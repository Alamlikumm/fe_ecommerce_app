<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getOrders()
    {
        // Ajaibnya Laravel: Menarik semua pesanan, BERSERTA isi barangnya, detail produknya, dan data diri pembelinya sekaligus!
        // Diurutkan dari pesanan yang paling baru masuk (descending).
        $orders = Order::with(['items.product', 'user'])->orderBy('created_at', 'desc')->get();
        
        return response()->json($orders);
    }
}