<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransCallbackController extends Controller
{
    /**
     * Endpoint untuk menerima notifikasi/webhook dari Midtrans
     * Tidak memerlukan autentikasi (dipanggil oleh server Midtrans)
     */
    public function handle(Request $request)
    {
        $serverKey = env('MIDTRANS_SERVER_KEY');
        
        // Verifikasi signature dari Midtrans
        $orderId = $request->order_id;
        $statusCode = $request->status_code;
        $grossAmount = $request->gross_amount;
        $transactionStatus = $request->transaction_status;
        $fraudStatus = $request->fraud_status ?? 'accept';

        // Hitung signature key
        $signatureKey = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if ($signatureKey !== $request->signature_key) {
            Log::warning('Midtrans callback: signature tidak valid', ['order_id' => $orderId]);
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        // Cari order berdasarkan midtrans_order_id
        $order = Order::where('midtrans_order_id', $orderId)->first();

        if (!$order) {
            // Fallback: coba cari dari format lama (order_id-timestamp)
            $parts = explode('-', $orderId);
            if (count($parts) >= 2) {
                $order = Order::find($parts[0]);
            }
        }

        if (!$order) {
            Log::warning('Midtrans callback: order tidak ditemukan', ['order_id' => $orderId]);
            return response()->json(['message' => 'Order tidak ditemukan'], 404);
        }

        // Update status order berdasarkan status transaksi dari Midtrans
        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'accept') {
                $order->status = 'paid';
            } else {
                $order->status = 'pending';
            }
        } elseif ($transactionStatus == 'settlement') {
            $order->status = 'paid';
        } elseif ($transactionStatus == 'pending') {
            $order->status = 'pending';
        } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
            $order->status = 'cancelled';
        }

        $order->save();

        Log::info('Midtrans callback berhasil diproses', [
            'order_id' => $orderId,
            'status' => $order->status,
            'transaction_status' => $transactionStatus,
        ]);

        return response()->json(['message' => 'OK']);
    }
}
