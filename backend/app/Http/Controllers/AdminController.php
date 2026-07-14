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

    public function dashboardStats()
    {
        // Statistik Total
        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total_price');
        $totalOrders = Order::count();
        $totalUsers = \App\Models\User::count();
        
        // Data Penjualan 7 Hari Terakhir
        $salesData = Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, SUM(total_price) as total')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'summary' => [
                'revenue' => $totalRevenue,
                'orders' => $totalOrders,
                'users' => $totalUsers
            ],
            'chartData' => $salesData
        ]);
    }
}