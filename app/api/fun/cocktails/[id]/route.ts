import { NextRequest, NextResponse } from "next/server";

interface TDBDrink {
  idDrink: string;
  strDrink: string;
  strCategory: string;
  strAlcoholic: string;
  strGlass: string;
  strInstructions: string;
  strDrinkThumb: string;
  strTags: string | null;
  strIBA: string | null;
  [key: string]: string | null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();
    const drink: TDBDrink = data.drinks?.[0];
    if (!drink) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Collect ingredients + measures
    const ingredients: { name: string; measure: string }[] = [];
    for (let i = 1; i <= 15; i++) {
      const name = drink[`strIngredient${i}`];
      const measure = drink[`strMeasure${i}`];
      if (name?.trim()) {
        ingredients.push({ name: name.trim(), measure: (measure ?? "").trim() });
      }
    }

    return NextResponse.json({
      id: drink.idDrink,
      name: drink.strDrink,
      category: drink.strCategory,
      alcoholic: drink.strAlcoholic,
      glass: drink.strGlass,
      instructions: drink.strInstructions,
      imageUrl: drink.strDrinkThumb,
      tags: drink.strTags,
      iba: drink.strIBA,
      ingredients,
    });
  } catch (err) {
    console.error("Cocktail detail error:", err);
    return NextResponse.json({ error: "Failed to fetch cocktail" }, { status: 500 });
  }
}
