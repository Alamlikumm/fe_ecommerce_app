<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();              // Kode promo unik (misal: DISKON10)
            $table->enum('type', ['percentage', 'fixed']);  // Tipe diskon: persentase atau nominal tetap
            $table->decimal('value', 15, 2);               // Nilai diskon (misal: 10 untuk 10% atau 50000 untuk Rp50.000)
            $table->decimal('min_purchase', 15, 2)->default(0); // Minimal belanja agar kupon bisa dipakai
            $table->decimal('max_discount', 15, 2)->nullable(); // Batas maksimal potongan (khusus tipe percentage)
            $table->integer('max_uses')->nullable();        // Total kuota pemakaian (null = unlimited)
            $table->integer('used_count')->default(0);      // Sudah dipakai berapa kali
            $table->dateTime('expires_at')->nullable();     // Tanggal kadaluarsa
            $table->boolean('is_active')->default(true);    // Status aktif/nonaktif
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
