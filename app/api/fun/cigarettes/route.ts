import { NextResponse } from "next/server";
import { FunItem } from "@/lib/types";

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

const BRANDS = [
  "中华", "玉溪", "芙蓉王", "熊猫", "黄鹤楼",
  "云烟", "利群", "红塔山", "双喜", "白沙",
  "苏烟", "南京", "黄金叶", "中南海", "泰山",
  "贵烟", "娇子", "七匹狼", "好猫", "石林",
];

export async function GET() {
  try {
    const results = await Promise.allSettled(
      BRANDS.map((brand) =>
        fetch(`https://ciggies.app/api/search?q=${encodeURIComponent(brand)}`, {
          next: { revalidate: 3600 },
        }).then((r) => r.json() as Promise<CiggiesProduct[]>)
      )
    );

    const seen = new Set<number>();
    const items: FunItem[] = [];

    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      for (const product of result.value) {
        if (seen.has(product.id)) continue;
        seen.add(product.id);
        items.push({
          id: String(product.id),
          title: product.english_name || product.name,
          subtitle: product.brand_name,
          detail: product.price_retail != null ? `¥${product.price_retail}` : "",
          imageUrl: `/api/fun/img?key=${encodeURIComponent(product.img_key)}`,
          sourceUrl: `https://ciggies.app`,
        });
      }
    }

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Cigarettes fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch cigarettes" }, { status: 500 });
  }
}
