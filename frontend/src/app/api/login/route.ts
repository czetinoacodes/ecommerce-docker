import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ApiRequestError, getCurrentUser, loginRequest } from "@/lib/api";
import { getUserNameFromAuthResponse, setSessionCookies } from "@/lib/session";

// Este Route Handler es un "proxy": el navegador nunca llama a Laravel
// directamente, llama aquí (mismo origen, sin CORS). Nosotros hacemos
// la petición real a Laravel desde el servidor de Next.js.
export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json(
      { message: "Ingresa tu correo y contraseña." },
      { status: 400 }
    );
  }

  try {
    const result = await loginRequest(body.email, body.password);
    const user = await getCurrentUser(result.access_token);
    const response = NextResponse.json({ ok: true });
    const name =
      getUserNameFromAuthResponse(result, user.name) || user.name;
    setSessionCookies(response, result.access_token, name, user.id);
    revalidatePath("/", "layout");
    return response;
  } catch (error) {
    if (!(error instanceof ApiRequestError)) {
      throw error;
    }

    return NextResponse.json(
      {
        message:
          error.status === 401
            ? "Correo o contraseña incorrectos."
            : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      },
      { status: error.status === 401 ? 401 : 502 }
    );
  }
}