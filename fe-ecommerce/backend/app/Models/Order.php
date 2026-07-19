<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $guarded = [];

    public function items() {
        return $this->hasMany(OrderItem::class); // Satu nota punya banyak barang
    }

    public function user() {
        return $this->belongsTo(User::class); // Satu nota dimiliki oleh satu pembeli
    }
}
