<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OrderItem;

class OrderItemSeeder extends Seeder
{
    public function run(): void
    {
        // Orden 1
        OrderItem::create([
            'order_id' => 1,
            'product_id' => 1,
            'quantity' => 1,
            'unit_price' => 750.00,
        ]);

        OrderItem::create([
            'order_id' => 1,
            'product_id' => 2,
            'quantity' => 1,
            'unit_price' => 25.00,
        ]);

        // Orden 2
        OrderItem::create([
            'order_id' => 2,
            'product_id' => 3,
            'quantity' => 1,
            'unit_price' => 65.00,
        ]);

        // Orden 3
        OrderItem::create([
            'order_id' => 3,
            'product_id' => 4,
            'quantity' => 1,
            'unit_price' => 180.00,
        ]);

        OrderItem::create([
            'order_id' => 3,
            'product_id' => 5,
            'quantity' => 1,
            'unit_price' => 85.00,
        ]);

        // Orden 4
        OrderItem::create([
            'order_id' => 4,
            'product_id' => 4,
            'quantity' => 1,
            'unit_price' => 180.00,
        ]);

        // Orden 5
        OrderItem::create([
            'order_id' => 5,
            'product_id' => 5,
            'quantity' => 1,
            'unit_price' => 85.00,
        ]);

        // Más unidades para probar cantidades
        OrderItem::create([
            'order_id' => 1,
            'product_id' => 2,
            'quantity' => 2,
            'unit_price' => 25.00,
        ]);

        OrderItem::create([
            'order_id' => 3,
            'product_id' => 2,
            'quantity' => 2,
            'unit_price' => 25.00,
        ]);

        OrderItem::create([
            'order_id' => 5,
            'product_id' => 2,
            'quantity' => 1,
            'unit_price' => 25.00,
        ]);
    }
}
