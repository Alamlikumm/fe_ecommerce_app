<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('shipping_cost', 15, 2)->default(0)->after('total_price');
            $table->decimal('discount', 15, 2)->default(0)->after('shipping_cost');
            $table->string('coupon_code')->nullable()->after('discount');
            $table->string('shipping_address')->nullable()->after('coupon_code');
            $table->string('midtrans_order_id')->nullable()->after('shipping_address');
            $table->string('snap_token')->nullable()->after('midtrans_order_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_cost', 'discount', 'coupon_code', 'shipping_address', 'midtrans_order_id', 'snap_token']);
        });
    }
};
