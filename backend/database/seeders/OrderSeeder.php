<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        Order::create([
            'user_id' => 1,
            'status' => 'completed',
            'total' => 775.00,
        ]);

        Order::create([
            'user_id' => 2,
            'status' => 'completed',
            'total' => 65.00,
        ]);

        Order::create([
            'user_id' => 3,
            'status' => 'completed',
            'total' => 265.00,
        ]);

        Order::create([
            'user_id' => 4,
            'status' => 'pending',
            'total' => 180.00,
        ]);

        Order::create([
            'user_id' => 5,
            'status' => 'pending',
            'total' => 85.00,
        ]);
    }
}
