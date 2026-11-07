<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AuthController;


/*
|--------------------------------------------------------------------------
| Autenticación
|--------------------------------------------------------------------------
*/

// Registro y login son públicos
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| Productos públicos
|--------------------------------------------------------------------------
*/

// Cualquier persona puede consultar productos
Route::get('/products', [ProductController::class, 'index']);


/*
|--------------------------------------------------------------------------
| Rutas protegidas por JWT
|--------------------------------------------------------------------------
*/

Route::middleware('auth:api')->group(function () {

    // Usuario autenticado
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);


    /*
    |--------------------------------------------------------------------------
    | Productos - solo admin
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    });


    /*
    |--------------------------------------------------------------------------
    | Pedidos
    |--------------------------------------------------------------------------
    */

    Route::apiResource('orders', OrderController::class)
        ->only(['index', 'store', 'show']);


    /*
    |--------------------------------------------------------------------------
    | Pagos
    |--------------------------------------------------------------------------
    */

    Route::apiResource('payments', PaymentController::class)
        ->only(['index', 'store', 'show']);
});
