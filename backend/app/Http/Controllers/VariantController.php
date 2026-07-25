<?php

namespace App\Http\Controllers;

use App\Models\ProductVariant;
use Illuminate\Http\Request;

class VariantController extends Controller
{
    public function index($productId)
    {
        $variants = ProductVariant::where('product_id', $productId)->get();
        return response()->json($variants);
    }

    public function store(Request $request, $productId)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'value' => 'required|string|max:255',
            'price_adjustment' => 'required|numeric',
            'stock' => 'required|integer|min:0',
        ]);

        $data['product_id'] = $productId;
        $variant = ProductVariant::create($data);

        return response()->json($variant, 201);
    }

    public function update(Request $request, $productId, $id)
    {
        $variant = ProductVariant::where('product_id', $productId)->findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'value' => 'required|string|max:255',
            'price_adjustment' => 'required|numeric',
            'stock' => 'required|integer|min:0',
        ]);

        $variant->update($data);
        return response()->json($variant);
    }

    public function destroy($productId, $id)
    {
        $variant = ProductVariant::where('product_id', $productId)->findOrFail($id);
        $variant->delete();
        return response()->json(['message' => 'Varian dihapus.']);
    }
}