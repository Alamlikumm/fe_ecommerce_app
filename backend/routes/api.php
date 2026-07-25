<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\MidtransCallbackController;

// --- PUBLIC ROUTES (Tanpa Login) ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [App\Http\Controllers\CategoryController::class, 'index']);

// Cek kode promo (bisa diakses publik, tapi memerlukan subtotal)
Route::post('/coupons/apply', [CouponController::class, 'apply']);

// Shipping config (konfigurasi ongkir untuk frontend)
Route::get('/shipping-config', [CheckoutController::class, 'shippingConfig']);

// Midtrans Webhook Callback (dipanggil oleh server Midtrans, tanpa auth)
Route::post('/midtrans/callback', [MidtransCallbackController::class, 'handle']);

// --- AUTHENTICATED ROUTES (Harus Login) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/products/{id}/reviews', [App\Http\Controllers\ReviewController::class, 'store']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/my-orders', [App\Http\Controllers\OrderController::class, 'myOrders']);
    Route::get('/my-orders/{id}', [App\Http\Controllers\OrderController::class, 'show']);

    // --- WISHLIST ---
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
    Route::get('/wishlist/check/{productId}', [WishlistController::class, 'check']);
    Route::get('/wishlist/ids', [WishlistController::class, 'ids']);

    // --- ADDRESSES ---
    Route::get('/addresses', [App\Http\Controllers\AddressController::class, 'index']);
    Route::post('/addresses', [App\Http\Controllers\AddressController::class, 'store']);
    Route::put('/addresses/{id}', [App\Http\Controllers\AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [App\Http\Controllers\AddressController::class, 'destroy']);
    Route::put('/addresses/{id}/primary', [App\Http\Controllers\AddressController::class, 'setPrimary']);

    // --- AREA ADMIN ---
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {

        // Dashboard & Pesanan
        Route::get('/admin/orders', [AdminController::class, 'getOrders']);
        Route::get('/admin/orders/{id}', [AdminController::class, 'getOrderDetail']);
        Route::put('/admin/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
        Route::get('/admin/dashboard-stats', [AdminController::class, 'dashboardStats']);

        // CRUD Kategori
        Route::get('/admin/categories', [App\Http\Controllers\CategoryController::class, 'index']);
        Route::post('/admin/categories', [App\Http\Controllers\CategoryController::class, 'store']);
        Route::put('/admin/categories/{id}', [App\Http\Controllers\CategoryController::class, 'update']);
        Route::delete('/admin/categories/{id}', [App\Http\Controllers\CategoryController::class, 'destroy']);

        // CRUD Produk
        Route::post('/admin/products', [ProductController::class, 'store']);
        Route::put('/admin/products/{id}', [ProductController::class, 'update']);
        Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);

        // CRUD Varian Produk
        Route::get('/admin/products/{productId}/variants', [App\Http\Controllers\VariantController::class, 'index']);
        Route::post('/admin/products/{productId}/variants', [App\Http\Controllers\VariantController::class, 'store']);
        Route::put('/admin/products/{productId}/variants/{id}', [App\Http\Controllers\VariantController::class, 'update']);
        Route::delete('/admin/products/{productId}/variants/{id}', [App\Http\Controllers\VariantController::class, 'destroy']);

        // Manajemen User
        Route::get('/admin/users', [App\Http\Controllers\UserController::class, 'index']);
        Route::put('/admin/users/{id}/role', [App\Http\Controllers\UserController::class, 'updateRole']);
        Route::put('/admin/users/{id}', [App\Http\Controllers\UserController::class, 'update']);
        Route::delete('/admin/users/{id}', [App\Http\Controllers\UserController::class, 'destroy']);

        // CRUD Kupon (Admin)
        Route::get('/admin/coupons', [CouponController::class, 'index']);
        Route::post('/admin/coupons', [CouponController::class, 'store']);
        Route::put('/admin/coupons/{id}', [CouponController::class, 'update']);
        Route::delete('/admin/coupons/{id}', [CouponController::class, 'destroy']);
    });
});
