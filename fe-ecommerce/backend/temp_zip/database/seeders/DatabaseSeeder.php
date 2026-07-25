<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'), // Add a default password if necessary
            ]
        );

        $categories = ['Elektronik', 'Pakaian Pria', 'Pakaian Wanita', 'Kebutuhan Rumah'];
        
        foreach ($categories as $catName) {
            $category = Category::firstOrCreate([
                'slug' => Str::slug($catName)
            ], [
                'name' => $catName,
            ]);

            for ($i = 1; $i <= 5; $i++) {
                $productName = 'Produk ' . $catName . ' ' . $i;
                Product::firstOrCreate([
                    'slug' => Str::slug($productName)
                ], [
                    'category_id' => $category->id,
                    'name' => $productName,
                    'description' => 'Ini adalah deskripsi untuk ' . $productName . '. Barang kualitas terbaik dan bergaransi resmi.',
                    'price' => rand(50, 500) * 1000, // random price between 50k - 500k
                    'stock' => rand(10, 100),
                    'image_url' => 'https://via.placeholder.com/400x400.png?text=' . urlencode($productName)
                ]);
            }
        }
    }
}
