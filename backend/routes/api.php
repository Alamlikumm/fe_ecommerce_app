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

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/checkout', [CheckoutController::class, 'store']);
    
    // --- INI AREA SUPER RAHASIA (KHUSUS ADMIN) ---
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    
    // API untuk melihat rekap semua pesanan yang masuk
    Route::get('/admin/orders', [AdminController::class, 'getOrders']);
    
});

});