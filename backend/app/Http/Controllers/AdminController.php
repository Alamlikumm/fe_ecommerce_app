<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderTimeline;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function getOrders()
    {
        $orders = Order::with(['items.product', 'user'])->orderBy('created_at', 'desc')->get();

        return response()->json($orders);
    }

    public function dashboardStats()
    {
        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total_price');
        $totalOrders = Order::count();
        $totalUsers = \App\Models\User::count();

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

    public function getOrderDetail($id)
    {
        $order = Order::with(['items.product', 'user', 'timeline'])->findOrFail($id);
        return response()->json($order);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status' => 'required|string|in:pending,paid,processing,shipped,completed,cancelled',
            'tracking_number' => 'nullable|string|max:255',
            'shipping_courier' => 'nullable|string|max:255',
            'admin_notes' => 'nullable|string',
        ]);

        $order = Order::findOrFail($id);

        DB::beginTransaction();
        try {
            $oldStatus = $order->status;
            $order->update([
                'status' => $data['status'],
                'tracking_number' => $data['tracking_number'] ?? $order->tracking_number,
                'shipping_courier' => $data['shipping_courier'] ?? $order->shipping_courier,
                'admin_notes' => $data['admin_notes'] ?? $order->admin_notes,
            ]);

            $timelineLabels = [
                'pending' => 'Pesanan Dibuat',
                'paid' => 'Pembayaran Dikonfirmasi',
                'processing' => 'Pesanan Diproses',
                'shipped' => 'Pesanan Dikirim',
                'completed' => 'Pesanan Selesai',
                'cancelled' => 'Pesanan Dibatalkan',
            ];

            $timelineDescriptions = [
                'pending' => 'Pesanan berhasil dibuat dan menunggu pembayaran.',
                'paid' => 'Pembayaran telah dikonfirmasi. Pesanan sedang disiapkan.',
                'processing' => 'Pesanan sedang diproses oleh penjual.',
                'shipped' => 'Pesanan telah dikirim dan dalam perjalanan.',
                'completed' => 'Pesanan telah diterima dan selesai.',
                'cancelled' => 'Pesanan dibatalkan.',
            ];

            if ($oldStatus !== $data['status']) {
                OrderTimeline::create([
                    'order_id' => $order->id,
                    'status' => $data['status'],
                    'label' => $timelineLabels[$data['status']] ?? $data['status'],
                    'description' => $timelineDescriptions[$data['status']] ?? '',
                ]);
            }

            DB::commit();

            $order->load('timeline');
            return response()->json(['message' => 'Status pesanan diperbarui.', 'order' => $order]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui status: ' . $e->getMessage()], 500);
        }
    }
}