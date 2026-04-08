import { NextResponse } from "next/server";
import { discoverRandomObject } from "@/lib/vam";

export async function GET() {
  try {
    const object = await discoverRandomObject();
    return NextResponse.json(object);
  } catch (err) {
    console.error("Discover error:", err);
    return NextResponse.json({ error: "Failed to discover object" }, { status: 500 });
  }
}
