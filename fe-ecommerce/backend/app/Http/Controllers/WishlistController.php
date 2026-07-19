<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Ambil semua wishlist user yang sedang login
     */
    public function index(Request $request)
    {
        $wishlists = Wishlist::with('product.category')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->pluck('product');

        return response()->json($wishlists);
    }

    /**
     * Toggle wishlist (tambah jika belum ada, hapus jika sudah ada)
     */
    public function toggle(Request $request)
    {
        $request->validate(['product_id' => 'required|exists:products,id']);

        $existing = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'message' => 'Produk dihapus dari wishlist.',
                'wishlisted' => false,
            ]);
        }

        Wishlist::create([
            'user_id' => $request->user()->id,
            'product_id' => $request->product_id,
        ]);

        return response()->json([
            'message' => 'Produk ditambahkan ke wishlist! ❤️',
            'wishlisted' => true,
        ], 201);
    }

    /**
     * Cek apakah produk tertentu ada di wishlist user
     */
    public function check(Request $request, $productId)
    {
        $exists = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->exists();

        return response()->json(['wishlisted' => $exists]);
    }

    /**
     * Ambil semua product_id yang ada di wishlist (untuk bulk check di frontend)
     */
    public function ids(Request $request)
    {
        $ids = Wishlist::where('user_id', $request->user()->id)
            ->pluck('product_id');

        return response()->json($ids);
    }
}
