<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category')->orderBy('created_at', 'desc');

        // Filter Pencarian (Nama Barang)
        if ($request->has('search') && $request->search != '') {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Filter Kategori
        if ($request->has('category_id') && $request->category_id != '') {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->get();
        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'reviews.user'])->findOrFail($id);
        return response()->json($product);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . time(),
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'image_url' => $imagePath ? '/storage/' . $imagePath : null
        ]);

        return response()->json(['message' => 'Produk berhasil ditambahkan', 'product' => $product], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($product->image_url) {
                $oldPath = str_replace('/storage/', '', $product->image_url);
                Storage::disk('public')->delete($oldPath);
            }
            $imagePath = $request->file('image')->store('products', 'public');
            $product->image_url = '/storage/' . $imagePath;
        }

        $product->category_id = $request->category_id;
        $product->name = $request->name;
        // Kita tidak update slug agar URL produk (jika ada) tidak rusak, tapi bisa juga diupdate
        $product->description = $request->description;
        $product->price = $request->price;
        $product->stock = $request->stock;
        $product->save();

        return response()->json(['message' => 'Produk berhasil diubah', 'product' => $product]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        
        // Hapus gambar jika ada
        if ($product->image_url) {
            $oldPath = str_replace('/storage/', '', $product->image_url);
            Storage::disk('public')->delete($oldPath);
        }
        
        $product->delete();
        return response()->json(['message' => 'Produk berhasil dihapus']);
    }
}
