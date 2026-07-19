<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function myOrders(Request $request)
    {
        // Ambil pesanan milik user yang sedang login beserta detail item dan nama produknya
        $orders = Order::with(['items.product'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($orders);
    }
}
