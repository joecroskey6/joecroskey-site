import { NextRequest, NextResponse } from "next/server";

interface CiggiesProduct {
  id: number;
  name: string;
  english_name: string;
  format: string | null;
  price_retail: number | null;
  brand_name: string;
  img_key: string;
  rank: number;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const brand = req.nextUrl.searchParams.get("brand") ?? "";

  try {
    const res = await fetch(
      `https://ciggies.app/api/search?q=${encodeURIComponent(brand)}`,
      { next: { revalidate: 3600 } }
    );
    const products: CiggiesProduct[] = await res.json();
    const product = products.find((p) => String(p.id) === id);

    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      id: String(product.id),
      name: product.name,
      englishName: product.english_name,
      brand: product.brand_name,
      price: product.price_retail,
      format: product.format,
      imageUrl: `/api/fun/img?key=${encodeURIComponent(product.img_key)}`,
    });
  } catch (err) {
    console.error("Cigarette detail error:", err);
    return NextResponse.json({ error: "Failed to fetch cigarette" }, { status: 500 });
  }
}
