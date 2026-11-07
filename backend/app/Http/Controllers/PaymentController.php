<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use OpenApi\Attributes as OA;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
    path: "/api/payments",
    summary: "Obtener pagos",
    description: "Obtiene una lista paginada de pagos.",
    security: [["bearerAuth" => []]],
    tags: ["Payments"],
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
            description: "Lista de pagos"
        ),
        new OA\Response(
            response: 401,
            description: "No autenticado"
        )
    ]
)]
    public function index()
    {
        return PaymentResource::collection(
            Payment::paginate(10)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
    path: "/api/payments",
    summary: "Crear PaymentIntent para una orden",
    description: "Crea un PaymentIntent de Stripe utilizando el total de la orden. El monto nunca es proporcionado por el cliente.",
    tags: ["Payments"],
    security: [["bearerAuth" => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["order_id"],
            properties: [
                new OA\Property(
                    property: "order_id",
                    type: "integer",
                    example: 4,
                    description: "ID de la orden que se desea pagar."
                )
            ]
        )
    ),
    responses: [
        new OA\Response(
            response: 201,
            description: "PaymentIntent creado correctamente",
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: "message",
                        type: "string",
                        example: "PaymentIntent creado correctamente."
                    ),
                    new OA\Property(
                        property: "data",
                        type: "object",
                        properties: [
                            new OA\Property(
                                property: "payment_id",
                                type: "integer",
                                example: 6
                            ),
                            new OA\Property(
                                property: "order_id",
                                type: "integer",
                                example: 4
                            ),
                            new OA\Property(
                                property: "amount",
                                type: "number",
                                format: "float",
                                example: 180.00
                            ),
                            new OA\Property(
                                property: "currency",
                                type: "string",
                                example: "usd"
                            ),
                            new OA\Property(
                                property: "client_secret",
                                type: "string",
                                example: "pi_xxx_secret_xxx"
                            )
                        ]
                    )
                ]
            )
        ),
        new OA\Response(
            response: 403,
            description: "La orden no pertenece al usuario autenticado"
        ),
        new OA\Response(
            response: 422,
            description: "La orden no puede ser pagada"
        ),
        new OA\Response(
            response: 401,
            description: "No autenticado"
        )
    ]
)]
    public function store(StorePaymentRequest $request)
    {
        $payment = Payment::create($request->validated());
        return (new PaymentResource($payment->load('order')))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
    path: "/api/payments/{payment}",
    summary: "Obtener un pago",
    description: "Obtiene la información de un pago específico.",
    security: [["bearerAuth" => []]],
    tags: ["Payments"],
    parameters: [
        new OA\Parameter(
            name: "payment",
            description: "ID del pago",
            in: "path",
            required: true,
            schema: new OA\Schema(type: "integer", example: 1)
        )
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: "Pago encontrado"
        ),
        new OA\Response(
            response: 401,
            description: "No autenticado"
        ),
        new OA\Response(
            response: 404,
            description: "Pago no encontrado"
        )
    ]
)]
    public function show(Payment $payment)
    {
        return new PaymentResource($payment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Payment $payment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment)
    {
        //
    }
}
