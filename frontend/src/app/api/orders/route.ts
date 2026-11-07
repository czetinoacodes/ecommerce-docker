import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { ApiRequestError, createOrder, getOrders } from "@/lib/api";
import type { CreateOrderData } from "@/lib/types";

function isCreateOrderData(body: unknown): body is CreateOrderData {
  if (typeof body !== "object" || body === null || !("items" in body)) {
    return false;
  }

  const items = body.items;
  return (
    Array.isArray(items) &&
    items.length > 0 &&
    items.every(
      (item: unknown) =>
        typeof item === "object" &&
        item !== null &&
        "product_id" in item &&
        "quantity" in item &&
        typeof item.product_id === "number" &&
        Number.isInteger(item.product_id) &&
        item.product_id > 0 &&
        typeof item.quantity === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    )
  );
}

export async function GET(request: Request) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Inicia sesión para consultar tus órdenes." },
      { status: 401 }
    );
  }

  const requestedPage = Number(new URL(request.url).searchParams.get("page"));
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  try {
    return NextResponse.json(await getOrders(token, page));
  } catch (error) {
    if (!(error instanceof ApiRequestError)) {
      throw error;
    }

    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}

export async function POST(request: Request) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Inicia sesión para realizar una compra." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "La solicitud de compra no es válida." },
      { status: 400 }
    );
  }

  if (!isCreateOrderData(body)) {
    return NextResponse.json(
      { message: "Agrega al menos un producto válido al carrito." },
      { status: 400 }
    );
  }

  try {
    const order = await createOrder(token, body);
    revalidatePath("/productos");
    revalidatePath("/ordenes", "page");
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (!(error instanceof ApiRequestError)) {
      throw error;
    }

    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}
