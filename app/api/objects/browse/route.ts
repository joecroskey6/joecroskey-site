import { NextRequest, NextResponse } from "next/server";
import { searchDesignObjects } from "@/lib/vam";

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);

  try {
    const result = await searchDesignObjects(page, 40);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Browse error:", err);
    return NextResponse.json({ error: "Failed to browse objects" }, { status: 500 });
  }
}
