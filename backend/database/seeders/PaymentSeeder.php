<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        Payment::create([
            'order_id' => 1,
            'method' => 'card',
            'amount' => 775.00,
            'status' => 'completed',
            'paid_at' => now(),
        ]);

        Payment::create([
            'order_id' => 2,
            'method' => 'card',
            'amount' => 65.00,
            'status' => 'completed',
            'paid_at' => now(),
        ]);

        Payment::create([
            'order_id' => 3,
            'method' => 'card',
            'amount' => 265.00,
            'status' => 'completed',
            'paid_at' => now(),
        ]);

        Payment::create([
            'order_id' => 4,
            'method' => 'card',
            'amount' => 180.00,
            'status' => 'pending',
            'paid_at' => null,
        ]);

        Payment::create([
            'order_id' => 5,
            'method' => 'card',
            'amount' => 85.00,
            'status' => 'pending',
            'paid_at' => null,
        ]);
    }
}
