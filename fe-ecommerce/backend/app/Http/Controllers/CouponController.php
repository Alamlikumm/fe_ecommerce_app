<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * [PUBLIC] Cek & terapkan kode promo
     */
    public function apply(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper(trim($request->code)))->first();

        if (!$coupon) {
            return response()->json(['message' => 'Kode promo tidak ditemukan.'], 404);
        }

        $valid = $coupon->isValid($request->subtotal);
        if ($valid !== true) {
            return response()->json(['message' => $valid], 422);
        }

        $discount = $coupon->calculateDiscount($request->subtotal);

        return response()->json([
            'message' => 'Kode promo berhasil diterapkan! 🎉',
            'coupon' => [
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => $coupon->value,
                'discount' => $discount,
            ],
        ]);
    }

    // ========== ADMIN CRUD ==========

    public function index()
    {
        return response()->json(Coupon::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date|after:now',
            'is_active' => 'boolean',
        ]);

        $coupon = Coupon::create([
            'code' => strtoupper(trim($request->code)),
            'type' => $request->type,
            'value' => $request->value,
            'min_purchase' => $request->min_purchase ?? 0,
            'max_discount' => $request->max_discount,
            'max_uses' => $request->max_uses,
            'expires_at' => $request->expires_at,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json(['message' => 'Kupon berhasil dibuat!', 'coupon' => $coupon], 201);
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);

        $request->validate([
            'code' => 'required|string|unique:coupons,code,' . $coupon->id,
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $coupon->update([
            'code' => strtoupper(trim($request->code)),
            'type' => $request->type,
            'value' => $request->value,
            'min_purchase' => $request->min_purchase ?? 0,
            'max_discount' => $request->max_discount,
            'max_uses' => $request->max_uses,
            'expires_at' => $request->expires_at,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json(['message' => 'Kupon berhasil diupdate!', 'coupon' => $coupon]);
    }

    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();
        return response()->json(['message' => 'Kupon berhasil dihapus.']);
    }
}
