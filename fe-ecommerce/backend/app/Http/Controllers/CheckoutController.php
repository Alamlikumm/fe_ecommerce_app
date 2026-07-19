<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Midtrans\Config;
use Midtrans\Snap;

class CheckoutController extends Controller
{
    // Konfigurasi ongkir (bisa dipindahkan ke database/config nanti)
    const FREE_SHIPPING_THRESHOLD = 500000; // Gratis ongkir jika belanja di atas Rp500.000
    const DEFAULT_SHIPPING_COST = 15000;    // Ongkir default Rp15.000

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'coupon_code' => 'nullable|string',
            'shipping_address' => 'nullable|string',
        ]);

        // Hitung subtotal dari item
        $subtotal = collect($request->items)->sum(function ($item) {
            return $item['price'] * $item['quantity'];
        });

        // Hitung ongkos kirim
        $shippingCost = $subtotal >= self::FREE_SHIPPING_THRESHOLD ? 0 : self::DEFAULT_SHIPPING_COST;

        // Hitung diskon kupon (jika ada)
        $discount = 0;
        $couponCode = null;

        if ($request->coupon_code) {
            $coupon = Coupon::where('code', strtoupper(trim($request->coupon_code)))->first();

            if ($coupon) {
                $valid = $coupon->isValid($subtotal);
                if ($valid === true) {
                    $discount = $coupon->calculateDiscount($subtotal);
                    $couponCode = $coupon->code;
                }
            }
        }

        // Total akhir = subtotal + ongkir - diskon
        $totalPrice = $subtotal + $shippingCost - $discount;
        $totalPrice = max(0, $totalPrice); // Pastikan tidak negatif

        try {
            DB::beginTransaction();

            // 1. Buat Midtrans order ID yang unik
            $midtransOrderId = 'ORD-' . time() . '-' . rand(1000, 9999);

            // 2. Simpan pesanan ke database
            $order = Order::create([
                'user_id' => $request->user()->id,
                'total_price' => $totalPrice,
                'shipping_cost' => $shippingCost,
                'discount' => $discount,
                'coupon_code' => $couponCode,
                'shipping_address' => $request->shipping_address,
                'midtrans_order_id' => $midtransOrderId,
                'status' => 'pending',
            ]);

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['id'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity']
                ]);
            }

            // 3. Increment coupon usage jika dipakai
            if ($couponCode) {
                Coupon::where('code', $couponCode)->increment('used_count');
            }

            // --- 4. KONFIGURASI MIDTRANS ---
            Config::$serverKey = env('MIDTRANS_SERVER_KEY');
            Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
            Config::$isSanitized = true;
            Config::$is3ds = true;

            Config::$curlOptions = [
                CURLOPT_SSL_VERIFYHOST => 0, 
                CURLOPT_SSL_VERIFYPEER => 0, 
                CURLOPT_HTTPHEADER => []
            ];

            // 5. Susun item_details untuk Midtrans
            $midtransItems = [];
            foreach ($request->items as $item) {
                $midtransItems[] = [
                    'id' => $item['id'],
                    'price' => (int) $item['price'],
                    'quantity' => (int) $item['quantity'],
                    'name' => substr($item['name'] ?? 'Produk', 0, 50),
                ];
            }

            // Tambahkan ongkir sebagai item jika > 0
            if ($shippingCost > 0) {
                $midtransItems[] = [
                    'id' => 'SHIPPING',
                    'price' => (int) $shippingCost,
                    'quantity' => 1,
                    'name' => 'Ongkos Kirim',
                ];
            }

            // Tambahkan diskon sebagai item negatif jika > 0
            if ($discount > 0) {
                $midtransItems[] = [
                    'id' => 'DISCOUNT',
                    'price' => (int) -$discount,
                    'quantity' => 1,
                    'name' => 'Diskon Kupon (' . $couponCode . ')',
                ];
            }

            // 6. Buat parameter transaksi
            $params = [
                'transaction_details' => [
                    'order_id' => $midtransOrderId,
                    'gross_amount' => (int) $totalPrice,
                ],
                'item_details' => $midtransItems,
                'customer_details' => [
                    'first_name' => $request->user()->name,
                    'email' => $request->user()->email,
                ],
            ];

            // 7. Minta Snap Token dari Midtrans
            $snapToken = Snap::getSnapToken($params);

            // Simpan snap token ke order
            $order->update(['snap_token' => $snapToken]);

            DB::commit();

            return response()->json([
                'message' => 'Pesanan tercatat!',
                'snap_token' => $snapToken,
                'order' => [
                    'id' => $order->id,
                    'subtotal' => $subtotal,
                    'shipping_cost' => $shippingCost,
                    'discount' => $discount,
                    'coupon_code' => $couponCode,
                    'total_price' => $totalPrice,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Kesalahan Checkout: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Endpoint untuk mengecek konfigurasi ongkir (digunakan di frontend)
     */
    public function shippingConfig()
    {
        return response()->json([
            'free_shipping_threshold' => self::FREE_SHIPPING_THRESHOLD,
            'default_shipping_cost' => self::DEFAULT_SHIPPING_COST,
        ]);
    }
}