import { NextRequest, NextResponse } from "next/server";
import { searchByQuery } from "@/lib/vam";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);

  try {
    const result = await searchByQuery(q, page, 40);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
