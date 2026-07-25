<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderTimeline;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransCallbackController extends Controller
{
    public function handle(Request $request)
    {
        $serverKey = env('MIDTRANS_SERVER_KEY');

        $orderId = $request->order_id;
        $statusCode = $request->status_code;
        $grossAmount = $request->gross_amount;
        $transactionStatus = $request->transaction_status;
        $fraudStatus = $request->fraud_status ?? 'accept';

        $signatureKey = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if ($signatureKey !== $request->signature_key) {
            Log::warning('Midtrans callback: signature tidak valid', ['order_id' => $orderId]);
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $order = Order::where('midtrans_order_id', $orderId)->first();

        if (!$order) {
            $parts = explode('-', $orderId);
            if (count($parts) >= 2) {
                $order = Order::find($parts[0]);
            }
        }

        if (!$order) {
            Log::warning('Midtrans callback: order tidak ditemukan', ['order_id' => $orderId]);
            return response()->json(['message' => 'Order tidak ditemukan'], 404);
        }

        $oldStatus = $order->status;

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

        if ($oldStatus !== $order->status) {
            $timelineLabels = [
                'paid' => 'Pembayaran Dikonfirmasi',
                'cancelled' => 'Pesanan Dibatalkan',
            ];
            $timelineDescriptions = [
                'paid' => 'Pembayaran telah dikonfirmasi melalui Midtrans.',
                'cancelled' => 'Pembayaran gagal / dibatalkan.',
            ];

            if (isset($timelineLabels[$order->status])) {
                OrderTimeline::create([
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'label' => $timelineLabels[$order->status],
                    'description' => $timelineDescriptions[$order->status],
                ]);
            }

            // Kurangi stok produk jika status menjadi 'paid'
            if ($order->status === 'paid' && $oldStatus !== 'paid') {
                foreach ($order->items as $item) {
                    $product = $item->product;
                    if ($product) {
                        $product->decrement('stock', $item->quantity);
                    }
                    // Kurangi juga stok variant jika ada
                    if ($item->variant_id) {
                        $variant = \App\Models\ProductVariant::find($item->variant_id);
                        if ($variant) {
                            $variant->decrement('stock', $item->quantity);
                        }
                    }
                }
            }
        }

        Log::info('Midtrans callback berhasil diproses', [
            'order_id' => $orderId,
            'status' => $order->status,
            'transaction_status' => $transactionStatus,
        ]);

        return response()->json(['message' => 'OK']);
    }
}