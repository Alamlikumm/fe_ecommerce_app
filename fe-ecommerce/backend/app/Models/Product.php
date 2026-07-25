<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['category_id',
    'name',
    'slug',
    'description', 
    'price', 
    'stock', 
    'image_url'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }
}
