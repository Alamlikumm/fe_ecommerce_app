<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Midtrans\Config;
use Midtrans\Snap;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
        ]);

        $totalPrice = collect($request->items)->sum(function ($item) {
            return $item['price'] * $item['quantity'];
        });

        try {
            DB::beginTransaction();

            // 1. Simpan pesanan ke database kita
            $order = Order::create([
                'user_id' => $request->user()->id,
                'total_price' => $totalPrice,
                'status' => 'pending' // Status awal adalah pending (belum dibayar)
            ]);

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['id'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity']
                ]);
            }

            // --- 2. KONFIGURASI MIDTRANS ---
            Config::$serverKey = env('MIDTRANS_SERVER_KEY');
            Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
            Config::$isSanitized = true;
            Config::$is3ds = true;

            // 👇 BARIS SAKTI YANG SUDAH DISEMPURNAKAN 👇
            Config::$curlOptions = [
                CURLOPT_SSL_VERIFYHOST => 0, 
                CURLOPT_SSL_VERIFYPEER => 0, 
                CURLOPT_HTTPHEADER => []
            ];

            // 3. Susun data yang akan dikirim ke Midtrans
            $params = [
                'transaction_details' => [
                    // Tambahkan waktu di belakang ID agar tidak dituduh "pesanan ganda" oleh Midtrans Sandbox
                    'order_id' => $order->id . '-' . time(), 
                    'gross_amount' => $totalPrice,
                ],
                'customer_details' => [
                    'first_name' => $request->user()->name,
                    'email' => $request->user()->email,
                ],
            ];

            // 4. Minta Snap Token dari server Midtrans
            $snapToken = Snap::getSnapToken($params);

            DB::commit();

            // 5. Kembalikan token pembayaran ini ke Frontend
            return response()->json([
                'message' => 'Pesanan tercatat!',
                'snap_token' => $snapToken // 👈 Token emas ini yang dicari!
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Kesalahan Midtrans: ' . $e->getMessage()], 500);
        }
    }
}