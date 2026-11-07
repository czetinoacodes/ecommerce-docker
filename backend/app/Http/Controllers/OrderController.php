<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use App\Http\Resources\OrderResource;
use App\Http\Requests\StoreOrderRequest;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\OrderItem;
use OpenApi\Attributes as OA;

class OrderController extends Controller
{
    #[OA\Get(
    path: "/api/orders",
    summary: "Obtener órdenes",
    description: "Los usuarios normales solamente pueden consultar sus propias órdenes. Los administradores pueden consultar todas.",
    security: [["bearerAuth" => []]],
    tags: ["Orders"],
    parameters: [
        new OA\Parameter(
            name: "page",
            description: "Número de página",
            in: "query",
            required: false,
            schema: new OA\Schema(type: "integer", example: 1)
        )
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: "Lista de órdenes"
        ),
        new OA\Response(
            response: 401,
            description: "No autenticado"
        )
    ]
)]
    public function index()
{
    $user = auth('api')->user();

    $query = Order::with([
        'user',
        'orderItems.product',
        'payment'
    ]);

    if ($user->role !== 'admin') {
        $query->where('user_id', $user->id);
    }

    return OrderResource::collection(
        $query->paginate(10)
    );
}

#[OA\Post(
    path: "/api/orders",
    summary: "Crear una orden",
    description: "Crea una orden utilizando los productos y cantidades enviados. El usuario se obtiene del token JWT, el total se calcula en el servidor y el stock se descuenta automáticamente.",
    security: [["bearerAuth" => []]],
    tags: ["Orders"],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["items"],
            properties: [
                new OA\Property(
                    property: "items",
                    type: "array",
                    minItems: 1,
                    items: new OA\Items(
                        properties: [
                            new OA\Property(
                                property: "product_id",
                                type: "integer",
                                example: 3
                            ),
                            new OA\Property(
                                property: "quantity",
                                type: "integer",
                                minimum: 1,
                                example: 2
                            )
                        ]
                    )
                )
            ]
        )
    ),
    responses: [
        new OA\Response(
            response: 201,
            description: "Orden creada correctamente"
        ),
        new OA\Response(
            response: 401,
            description: "No autenticado"
        ),
        new OA\Response(
            response: 422,
            description: "Producto inexistente, cantidad inválida o stock insuficiente"
        )
    ]
)]
    public function store(StoreOrderRequest $request)
{
    $user = auth('api')->user();

    $items = $request->validated()['items'];

    $products = Product::whereIn(
        'id',
        collect($items)->pluck('product_id')
    )->get()->keyBy('id');

    // Validar stock
    foreach ($items as $item) {
        $product = $products[$item['product_id']];

        if ($item['quantity'] > $product->stock) {
            return response()->json([
                'message' => "No hay suficiente stock para el producto {$product->name}."
            ], 422);
        }
    }

    // Calcula el total
    $total = 0;

    foreach ($items as $item) {
        $product = $products[$item['product_id']];

        $total += $product->price * $item['quantity'];
    }

    // Crea orden y descuenta stock
    $order = DB::transaction(function () use ($user, $items, $products, $total) {

        $order = Order::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'total' => $total,
        ]);

        foreach ($items as $item) {
            $product = $products[$item['product_id']];

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'unit_price' => $product->price,
            ]);

            $product->decrement('stock', $item['quantity']);
        }

        return $order;
    });

    return response()->json([
        'message' => 'Orden creada correctamente.',
        'data' => new OrderResource(
            $order->load([
                'user',
                'orderItems.product',
                'payment'
            ])
        )
    ], 201);
}

#[OA\Get(
    path: "/api/orders/{order}",
    summary: "Obtener una orden",
    description: "Obtiene una orden específica. Un usuario solamente puede consultar sus propias órdenes; un administrador puede consultar cualquiera.",
    security: [["bearerAuth" => []]],
    tags: ["Orders"],
    parameters: [
        new OA\Parameter(
            name: "order",
            description: "ID de la orden",
            in: "path",
            required: true,
            schema: new OA\Schema(type: "integer", example: 1)
        )
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: "Orden encontrada"
        ),
        new OA\Response(
            response: 401,
            description: "No autenticado"
        ),
        new OA\Response(
            response: 403,
            description: "No tiene permiso para ver esta orden"
        ),
        new OA\Response(
            response: 404,
            description: "Orden no encontrada"
        )
    ]
)]
    public function show(Order $order)
{
    $user = auth('api')->user();

    if ($user->role !== 'admin' && $order->user_id !== $user->id) {
        return response()->json([
            'message' => 'No tienes permiso para ver esta orden.'
        ], 403);
    }

    return new OrderResource(
        $order->load([
            'user',
            'orderItems.product',
            'payment'
        ])
    );
}

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        //
    }
}
