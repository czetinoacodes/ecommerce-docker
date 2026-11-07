import type {
  ApiListResponse,
  AuthResponse,
  CreateOrderData,
  CreateOrderResponse,
  CurrentUser,
  LoginResponse,
  Order,
  Producto,
  RegisterData,
} from "./types";

const BASE_URL = process.env.LARAVEL_API_URL;

if (!BASE_URL) {
  throw new Error("Falta LARAVEL_API_URL en tu archivo .env.local");
}

const JSON_HEADERS = { Accept: "application/json" };

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function checkResponse(response: Response, action: string) {
  if (!response.ok) {
    throw new ApiRequestError(
      `Error al ${action}: ${response.status}`,
      response.status
    );
  }
}

export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { ...JSON_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  await checkResponse(response, "iniciar sesión");
  const result = (await response.json()) as LoginResponse;

  if (!result.access_token) {
    throw new Error("La respuesta de inicio de sesión no incluye un token.");
  }

  return result;
}

export async function getCurrentUser(token: string): Promise<CurrentUser> {
  const response = await fetch(`${BASE_URL}/api/me`, {
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  await checkResponse(response, "consultar la sesión");
  return (await response.json()) as CurrentUser;
}

export async function registerRequest(
  data: RegisterData
): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/api/register`, {
    method: "POST",
    headers: { ...JSON_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  await checkResponse(response, "crear la cuenta");
  return (await response.json()) as AuthResponse;
}

export async function getProductos(): Promise<Producto[]> {
  const response = await fetch(`${BASE_URL}/api/products`, {
    headers: JSON_HEADERS,
    cache: "no-store",
  });

  await checkResponse(response, "cargar los productos");
  const result = (await response.json()) as ApiListResponse<Producto>;
  return result.data;
}

export async function getOrders(
  token: string,
  page = 1
): Promise<ApiListResponse<Order>> {
  const response = await fetch(`${BASE_URL}/api/orders?page=${page}`, {
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  await checkResponse(response, "cargar las órdenes");
  return (await response.json()) as ApiListResponse<Order>;
}

export async function createOrder(
  token: string,
  data: CreateOrderData
): Promise<CreateOrderResponse> {
  const response = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  if (!response.ok) {
    const result = (await response.json()) as { message?: string };
    throw new ApiRequestError(
      result.message ?? `Error al realizar la compra: ${response.status}`,
      response.status
    );
  }

  return (await response.json()) as CreateOrderResponse;
}
