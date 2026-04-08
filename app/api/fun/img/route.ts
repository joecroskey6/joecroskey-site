import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return new NextResponse("Missing key", { status: 400 });

  // Only allow paths under products/ to prevent open proxy abuse
  if (!key.startsWith("products/")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const upstream = await fetch(`https://ciggies.app/api/img/${key}`, {
      next: { revalidate: 86400 },
    });

    if (!upstream.ok) {
      return new NextResponse(null, { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("Image proxy error:", err);
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
