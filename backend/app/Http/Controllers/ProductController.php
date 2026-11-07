<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Resources\ProductResource;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use OpenApi\Attributes as OA;


class ProductController extends Controller
{

#[OA\Get(
    path: "/api/products",
    summary: "Obtener productos",
    description: "Obtiene una lista paginada de productos.",
    tags: ["Products"],
    responses: [
        new OA\Response(
            response: 200,
            description: "Lista de productos"
        )
    ]
)]
    public function index()
    {
        return ProductResource::collection(Product::paginate(10));
    }

    #[OA\Post(
    path: "/api/products",
    summary: "Crear producto",
    description: "Crea un nuevo producto. Requiere autenticación y rol admin.",
    security: [["bearerAuth" => []]],
    tags: ["Products"],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["name", "price", "stock"],
            properties: [
                new OA\Property(property: "name", type: "string", example: "Teclado mecánico"),
                new OA\Property(property: "description",type: "string",example: "Teclado mecánico RGB"),
                new OA\Property(property: "price",type: "number",format: "float",example: 65.50),
                new OA\Property(property: "stock",type: "integer",example: 20)
            ]
        )
    ),
    responses: [
        new OA\Response(
            response: 201,
            description: "Producto creado correctamente"
        ),
        new OA\Response(
            response: 401,
            description: "No autenticado"
        ),
        new OA\Response(
            response: 403,
            description: "No tiene permisos de administrador"
        ),
        new OA\Response(
            response: 422,
            description: "Error de validación"
        )
    ]
)]
    public function store(StoreProductRequest $request)
    {
        $product = Product::create($request->validated());
        return (new ProductResource($product))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Product $product)
    {
        return new ProductResource($product);
    }

     #[OA\Put(
    path: "/api/products/{product}",
    summary: "Actualizar producto",
    description: "Actualiza un producto existente. Requiere rol admin.",
    security: [["bearerAuth" => []]],
    tags: ["Products"],
    parameters: [
        new OA\Parameter(
            name: "product",
            description: "ID del producto",
            in: "path",
            required: true,
            schema: new OA\Schema(type: "integer", example: 1)
        )
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: "name",
                    type: "string",
                    example: "Teclado mecánico RGB"
                ),
                new OA\Property(
                    property: "description",
                    type: "string",
                    example: "Teclado actualizado"
                ),
                new OA\Property(
                    property: "price",
                    type: "number",
                    format: "float",
                    example: 70.00
                ),
                new OA\Property(
                    property: "stock",
                    type: "integer",
                    example: 15
                )
            ]
        )
    ),
    responses: [
        new OA\Response(
            response: 200,
            description: "Producto actualizado correctamente"
        ),
        new OA\Response(
            response: 401,
            description: "No autenticado"
        ),
        new OA\Response(
            response: 403,
            description: "No tiene permisos"
        ),
        new OA\Response(
            response: 404,
            description: "Producto no encontrado"
        ),
        new OA\Response(
            response: 422,
            description: "Error de validación"
        )
    ]
)]
    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update($request->validated());
        return new ProductResource($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json([
            'message' => 'Producto eliminado correctamente'
        ]);
    }
}
