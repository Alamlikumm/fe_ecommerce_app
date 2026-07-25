<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'type', 'value', 'min_purchase', 'max_discount',
        'max_uses', 'used_count', 'expires_at', 'is_active'
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Cek apakah kupon ini valid untuk digunakan
     */
    public function isValid(float $subtotal): bool|string
    {
        if (!$this->is_active) {
            return 'Kupon ini sudah tidak aktif.';
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return 'Kupon ini sudah kadaluarsa.';
        }

        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return 'Kuota pemakaian kupon ini sudah habis.';
        }

        if ($subtotal < $this->min_purchase) {
            return 'Minimal belanja Rp ' . number_format($this->min_purchase, 0, ',', '.') . ' untuk menggunakan kupon ini.';
        }

        return true;
    }

    /**
     * Hitung besaran diskon berdasarkan subtotal
     */
    public function calculateDiscount(float $subtotal): float
    {
        if ($this->type === 'percentage') {
            $discount = $subtotal * ($this->value / 100);
            // Batasi dengan max_discount jika ada
            if ($this->max_discount !== null) {
                $discount = min($discount, $this->max_discount);
            }
        } else {
            // Fixed discount
            $discount = $this->value;
        }

        // Pastikan diskon tidak melebihi subtotal
        return min($discount, $subtotal);
    }
}
