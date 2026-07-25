<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderTimeline extends Model
{
    protected $table = 'order_timeline';
    protected $guarded = [];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}