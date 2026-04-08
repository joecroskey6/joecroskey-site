import { NextResponse } from "next/server";
import { FunItem } from "@/lib/types";

// IBA official cocktail list — these all have clean studio photography on TheCocktailDB
const IBA_COCKTAILS = [
  // Unforgettables
  "Alexander", "Americano", "Angelique", "Between the Sheets", "Boulevardier",
  "Brandy Crusta", "Bronx", "Clover Club", "Daiquiri", "Dry Martini",
  "Hanky Panky", "Last Word", "Manhattan", "Mary Pickford", "Monkey Gland",
  "Negroni", "Old Fashioned", "Porto Flip", "Rusty Nail", "Sazerac",
  "Stinger", "Tuxedo", "Whiskey Sour", "White Lady",
  // Contemporary Classics
  "Aperol Spritz", "Bramble", "Caipirinha", "Champagne Cocktail",
  "Cosmopolitan", "Dark and Stormy", "Espresso Martini", "French 75",
  "Gimlet", "Gin Fizz", "Hemingway Special", "Lemon Drop",
  "Long Island Iced Tea", "Mai Tai", "Mojito", "Moscow Mule",
  "Pisco Sour", "Planters Punch", "Sea Breeze", "Sex on the Beach",
  "Singapore Sling", "Tequila Sunrise", "Tom Collins", "Vieux Carré",
  // New Era Drinks
  "Airmail", "Naked and Famous", "Paper Plane", "Penicillin",
  "Porn Star Martini", "Spicy Fifty", "Spritz Veneziano", "Tommy's Margarita",
  "Trinidad Sour", "Turbo Shandy", "Illegal",
];

interface DrinkDetail {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strCategory: string;
  strIBA?: string;
}

async function searchCocktail(name: string): Promise<DrinkDetail | null> {
  try {
    const res = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();
    if (!data.drinks?.length) return null;
    // Prefer exact name match
    const exact = data.drinks.find(
      (d: DrinkDetail) => d.strDrink.toLowerCase() === name.toLowerCase()
    );
    return exact || data.drinks[0];
  } catch {
    return null;
  }
}

async function batchedSearch(names: string[], batchSize = 5): Promise<(DrinkDetail | null)[]> {
  const results: (DrinkDetail | null)[] = [];
  for (let i = 0; i < names.length; i += batchSize) {
    const batch = names.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(searchCocktail));
    results.push(...batchResults);
    if (i + batchSize < names.length) await new Promise(r => setTimeout(r, 200));
  }
  return results;
}

export async function GET() {
  try {
    const results = await batchedSearch(IBA_COCKTAILS);

    const seen = new Set<string>();
    const items: FunItem[] = results
      .filter((d): d is DrinkDetail => d !== null)
      .filter((d) => {
        if (seen.has(d.idDrink)) return false;
        seen.add(d.idDrink);
        return true;
      })
      .map((d) => ({
        id: d.idDrink,
        title: d.strDrink,
        subtitle: "cocktail",
        detail: "",
        imageUrl: d.strDrinkThumb,
        sourceUrl: `https://www.thecocktaildb.com/drink/${d.idDrink}`,
      }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Cocktails fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch cocktails" }, { status: 500 });
  }
}
