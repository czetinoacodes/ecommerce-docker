<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::create([
            'name' => 'Laptop Lenovo',
            'description' => 'Laptop para trabajo y estudio',
            'price' => 750.00,
            'stock' => 10,
        ]);

        Product::create([
            'name' => 'Mouse Logitech',
            'description' => 'Mouse inalámbrico',
            'price' => 25.50,
            'stock' => 30,
        ]);

        Product::create([
            'name' => 'Teclado Mecánico',
            'description' => 'Teclado mecánico RGB',
            'price' => 65.00,
            'stock' => 15,
        ]);

        Product::create([
            'name' => 'Monitor Samsung',
            'description' => 'Monitor de 24 pulgadas',
            'price' => 180.00,
            'stock' => 8,
        ]);

        Product::create([
            'name' => 'Audífonos Sony',
            'description' => 'Audífonos inalámbricos',
            'price' => 85.00,
            'stock' => 20,
        ]);
    }
}
