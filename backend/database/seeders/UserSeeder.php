<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Carlos Zetino',
            'email' => 'carlos@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        User::create([
            'name' => 'Ana Martínez',
            'email' => 'ana@example.com',
            'password' => Hash::make('password'),
            'role' => 'user'
        ]);

        User::create([
            'name' => 'Luis Hernández',
            'email' => 'luis@example.com',
            'password' => Hash::make('password'),
            'role' => 'user'
        ]);

        User::create([
            'name' => 'Sofía García',
            'email' => 'sofia@example.com',
            'password' => Hash::make('password'),
            'role' => 'user'
        ]);

        User::create([
            'name' => 'Miguel Rodríguez',
            'email' => 'miguel@example.com',
            'password' => Hash::make('password'),
            'role' => 'user'
        ]);
    }
}
