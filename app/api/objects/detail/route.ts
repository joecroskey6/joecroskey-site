import { NextRequest, NextResponse } from "next/server";
import { getObjectDetail } from "@/lib/vam";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const detail = await getObjectDetail(id);
    return NextResponse.json(detail);
  } catch (err) {
    console.error("Detail error:", err);
    return NextResponse.json({ error: "Failed to fetch detail" }, { status: 500 });
  }
}
