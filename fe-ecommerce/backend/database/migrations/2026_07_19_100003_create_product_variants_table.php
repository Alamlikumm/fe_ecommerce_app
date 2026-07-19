<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name');            // Nama varian (misal: "Merah - XL")
            $table->string('type');            // Tipe varian (misal: "Warna", "Ukuran")
            $table->string('value');           // Nilai varian (misal: "Merah", "XL")
            $table->decimal('price_adjustment', 15, 2)->default(0); // Selisih harga dari harga dasar (+/-)
            $table->integer('stock')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
