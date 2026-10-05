import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, await params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, await params);
}

async function handleProxy(request: NextRequest, params: { path: string[] }) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      {
        error:
          "This screen still uses the legacy private API. Configure NEXT_PUBLIC_API_URL or migrate it to Supabase.",
      },
      { status: 503 },
    );
  }

  try {
    // remove the literal "proxy" segment if the client included it
    const segments = [...params.path];
    if (segments[0] === "proxy") {
      segments.shift();
    }
    const path = segments.join("/");
    const url = `${API_BASE_URL}/${path}/`;

    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    let body: string | undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      const text = await request.text();
      if (text) body = text;
    }

    const response = await fetch(fullUrl, {
      method: request.method,
      headers,
      body,
    });

    const responseText = await response.text();

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to proxy request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
