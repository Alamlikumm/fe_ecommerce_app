<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'), // Add default password since factory might not be used here fully if it exists
                'email_verified_at' => now(),
            ]
        );

        $categories = [
            ['name' => 'Elektronik', 'slug' => 'elektronik'],
            ['name' => 'Pakaian Pria', 'slug' => 'pakaian-pria'],
            ['name' => 'Pakaian Wanita', 'slug' => 'pakaian-wanita'],
            ['name' => 'Sepatu', 'slug' => 'sepatu'],
            ['name' => 'Aksesoris', 'slug' => 'aksesoris'],
        ];

        foreach ($categories as $cat) {
            \App\Models\Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        $products = [
            [
                'category_id' => 1,
                'name' => 'Smartphone Android 5G',
                'slug' => 'smartphone-android-5g',
                'description' => 'Smartphone dengan konektivitas 5G super cepat.',
                'price' => 3500000,
                'stock' => 50,
                'image_url' => 'https://images.unsplash.com/photo-1598327105666-5b89351cb31b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
            ],
            [
                'category_id' => 1,
                'name' => 'Laptop Gaming Pro',
                'slug' => 'laptop-gaming-pro',
                'description' => 'Laptop gaming dengan performa tinggi.',
                'price' => 12500000,
                'stock' => 20,
                'image_url' => 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
            ],
            [
                'category_id' => 2,
                'name' => 'Kemeja Flannel Pria',
                'slug' => 'kemeja-flannel-pria',
                'description' => 'Kemeja flannel nyaman dan stylish untuk pria.',
                'price' => 150000,
                'stock' => 100,
                'image_url' => 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
            ],
            [
                'category_id' => 3,
                'name' => 'Dress Floral Wanita',
                'slug' => 'dress-floral-wanita',
                'description' => 'Dress motif floral cantik untuk wanita.',
                'price' => 200000,
                'stock' => 80,
                'image_url' => 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
            ],
            [
                'category_id' => 4,
                'name' => 'Sepatu Sneakers Kasual',
                'slug' => 'sepatu-sneakers-kasual',
                'description' => 'Sepatu sneakers yang cocok untuk gaya kasual.',
                'price' => 350000,
                'stock' => 150,
                'image_url' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
            ],
            [
                'category_id' => 5,
                'name' => 'Jam Tangan Analog Minimalis',
                'slug' => 'jam-tangan-analog-minimalis',
                'description' => 'Jam tangan elegan dengan desain minimalis.',
                'price' => 250000,
                'stock' => 75,
                'image_url' => 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
            ],
        ];

        foreach ($products as $prod) {
            \App\Models\Product::firstOrCreate(['slug' => $prod['slug']], $prod);
        }
    }
}
