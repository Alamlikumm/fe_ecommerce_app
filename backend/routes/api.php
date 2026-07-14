<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\AdminController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [App\Http\Controllers\CategoryController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/products/{id}/reviews', [App\Http\Controllers\ReviewController::class, 'store']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/my-orders', [App\Http\Controllers\OrderController::class, 'myOrders']);
    
    // --- INI AREA SUPER RAHASIA (KHUSUS ADMIN) ---
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    
    // API untuk melihat rekap semua pesanan yang masuk
    Route::get('/admin/orders', [AdminController::class, 'getOrders']);

    // API untuk statistik dasbor
    Route::get('/admin/dashboard-stats', [AdminController::class, 'dashboardStats']);

    // API CRUD Kategori (Hanya Admin)
    Route::get('/admin/categories', [App\Http\Controllers\CategoryController::class, 'index']);
    Route::post('/admin/categories', [App\Http\Controllers\CategoryController::class, 'store']);
    Route::put('/admin/categories/{id}', [App\Http\Controllers\CategoryController::class, 'update']);
    Route::delete('/admin/categories/{id}', [App\Http\Controllers\CategoryController::class, 'destroy']);

    // API CRUD Produk (Hanya Admin - Untuk public GET products tetap di luar middleware)
    Route::post('/admin/products', [ProductController::class, 'store']);
    // Menggunakan POST karena multipart/form-data untuk upload file tidak selalu jalan baik dengan PUT di PHP
    Route::put('/admin/products/{id}', [ProductController::class, 'update']); 
    Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);

    // API Manajemen User & Hak Akses
    Route::get('/admin/users', [App\Http\Controllers\UserController::class, 'index']);
    Route::put('/admin/users/{id}/role', [App\Http\Controllers\UserController::class, 'updateRole']);
    
});

});