<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(
    path: "/api/register",
    summary: "Registrar un nuevo usuario",
    description: "Crea una cuenta de usuario y asigna automáticamente el rol user.",
    tags: ["Auth"],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["name", "email", "password", "password_confirmation"],
            properties: [
                new OA\Property(
                    property: "name",
                    type: "string",
                    example: "Carlos Zetino"
                ),
                new OA\Property(
                    property: "email",
                    type: "string",
                    format: "email",
                    example: "carlos@example.com"
                ),
                new OA\Property(
                    property: "password",
                    type: "string",
                    format: "password",
                    example: "password123"
                ),
                new OA\Property(
                    property: "password_confirmation",
                    type: "string",
                    format: "password",
                    example: "password123"
                )
            ]
        )
    ),
    responses: [
        new OA\Response(
            response: 201,
            description: "Usuario registrado correctamente"
        ),
        new OA\Response(
            response: 422,
            description: "Error de validación"
        )
    ]
)]
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email'  => 'required|email|unique:users',
            'password'  => 'required|min:8|confirmed',

        ]);

        $user = User::create([
            'name'  => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'  => 'user',
        ]);

        return response()->json(['user' => $user], 201);
    }

    #[OA\Post(
    path: "/api/login",
    summary: "Iniciar sesión",
    description: "Genera un token JWT al iniciar sesión con credenciales válidas.",
    tags: ["Auth"],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["email", "password"],
            properties: [
                new OA\Property(
                    property: "email",
                    type: "string",
                    format: "email",
                    example: "carlos@example.com"
                ),
                new OA\Property(
                    property: "password",
                    type: "string",
                    format: "password",
                    example: "password123"
                )
            ]
        )
    ),
    responses: [
        new OA\Response(
            response: 200,
            description: "Login exitoso",
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: "access_token",
                        type: "string",
                        example: "eyJIUzI1NiJ9..."
                    ),
                    new OA\Property(
                        property: "token_type",
                        type: "string",
                        example: "bearer"
                    ),
                    new OA\Property(
                        property: "role",
                        type: "string",
                        example: "user"
                    ),
                    new OA\Property(
                        property: "expires_in",
                        type: "integer",
                        example: 3600
                    )
                ]
            )
        ),
        new OA\Response(
            response: 401,
            description: "Credenciales inválidas"
        ),
        new OA\Response(
            response: 422,
            description: "Error de validación"
        )
    ]
)]
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        //cliente            //DB
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales invalidas'], 401);
        }

        $credentials = $request->only('email', 'password');

        if (! $token = JWTAuth::attempt($credentials)) {
            return response()->json(['message' => 'No Autorizado'], 401);
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'role' => $user->role,
            'expires_in' => JWTAuth::factory()->getTTL() * 60,
        ]);
    }

    public function me()
    {
        return response()->json(auth('api')->user());
    }
    public function logout()
    {
        JWTAuth::invalidate(
            JWTAuth::getToken()
        );

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }
}
