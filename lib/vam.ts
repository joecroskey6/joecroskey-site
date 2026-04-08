import {
  VAMRecord,
  VAMSearchResponse,
  VAMObjectDetail,
  DesignObject,
  DesignObjectDetail,
} from "./types";

const VAM_BASE = "https://api.vam.ac.uk/v2";

const DESIGN_TYPES = [
  "chair", "lamp", "table", "armchair", "cabinet",
  "stool", "desk", "chandelier", "vase", "clock",
  "sofa", "mirror", "rug", "teapot", "jug",
  "bowl", "plate", "cup", "coffeepot", "candelabrum",
  "screen", "chest of drawers", "bookcase", "wardrobe", "settee",
  "pendant", "sconce", "lantern", "figurine", "sculpture",
];

function getImageUrl(baseUrl: string, size: number = 600): string {
  if (!baseUrl) return "";
  return `${baseUrl}full/!${size},${size}/0/default.jpg`;
}

function getThumbnailUrl(baseUrl: string): string {
  if (!baseUrl) return "";
  return `${baseUrl}full/!400,400/0/default.jpg`;
}

function transformRecord(record: VAMRecord): DesignObject {
  const baseUrl = record._images?._iiif_image_base_url || "";
  return {
    id: record.systemNumber,
    title: record._primaryTitle || "Untitled",
    designer: record._primaryMaker?.name || "Unknown",
    date: record._primaryDate || "",
    place: record._primaryPlace || "",
    objectType: record.objectType || "",
    imageUrl: getImageUrl(baseUrl, 800),
    thumbnailUrl: getThumbnailUrl(baseUrl),
    imageBaseUrl: baseUrl,
  };
}

// Shuffle array in place
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function searchDesignObjects(
  page: number = 1,
  pageSize: number = 40
): Promise<{ objects: DesignObject[]; totalRecords: number; totalPages: number }> {
  // Fetch from multiple object types in parallel and merge
  const perType = Math.ceil(pageSize / DESIGN_TYPES.length);
  const randomOffset = Math.floor(Math.random() * 20) + 1;

  const fetches = DESIGN_TYPES.map(async (type) => {
    const params = new URLSearchParams({
      q_object_type: type,
      page: (page + randomOffset).toString(),
      page_size: perType.toString(),
      images_exist: "1",
    });

    try {
      const res = await fetch(`${VAM_BASE}/objects/search?${params}`);
      if (!res.ok) return [];
      const data: VAMSearchResponse = await res.json();
      return data.records.map(transformRecord);
    } catch {
      return [];
    }
  });

  const results = await Promise.all(fetches);
  const allObjects = shuffle(results.flat());

  return {
    objects: allObjects.slice(0, pageSize),
    totalRecords: allObjects.length,
    totalPages: 100, // approximate
  };
}

export async function searchByQuery(
  query: string,
  page: number = 1,
  pageSize: number = 40
): Promise<{ objects: DesignObject[]; totalRecords: number; totalPages: number }> {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    page_size: pageSize.toString(),
    images_exist: "1",
  });

  const res = await fetch(`${VAM_BASE}/objects/search?${params}`);
  if (!res.ok) throw new Error(`V&A search failed: ${res.statusText}`);

  const data: VAMSearchResponse = await res.json();
  return {
    objects: data.records.map(transformRecord),
    totalRecords: data.info.record_count,
    totalPages: data.info.pages,
  };
}

export async function getObjectDetail(
  id: string
): Promise<DesignObjectDetail> {
  const res = await fetch(`${VAM_BASE}/object/${id}`);
  if (!res.ok) throw new Error(`V&A object fetch failed: ${res.statusText}`);

  const data: VAMObjectDetail = await res.json();
  const r = data.record;

  const designer =
    r.artistMakerPerson?.[0]?.name?.text ||
    r.artistMakerOrganisations?.[0]?.name?.text ||
    "Unknown";

  const title =
    r.titles?.[0]?.title || "Untitled";

  const date = r.productionDates?.[0]?.date?.text || "";
  const place = r.placesOfOrigin?.[0]?.place?.text || "";

  const imageIds = r.images || [];
  const allImages = imageIds.map(
    (imgId: string) =>
      `https://framemark.vam.ac.uk/collections/${imgId}/full/!800,800/0/default.jpg`
  );

  const firstImageBase = imageIds.length > 0
    ? `https://framemark.vam.ac.uk/collections/${imageIds[0]}/`
    : "";

  const dimensions = r.dimensions
    ?.map((d) => `${d.dimension}: ${d.value} ${d.unit}`)
    .join(", ") || "";

  const stripHtml = (str: string) => str?.replace(/<[^>]*>/g, "") || "";

  return {
    id: r.systemNumber,
    title,
    designer,
    date,
    place,
    objectType: r.objectType || "",
    imageUrl: allImages[0] || "",
    thumbnailUrl: firstImageBase
      ? `${firstImageBase}full/!400,400/0/default.jpg`
      : "",
    imageBaseUrl: firstImageBase,
    description: stripHtml(r.summaryDescription || r.physicalDescription || ""),
    materials: r.materials?.map((m) => m.text) || [],
    techniques: r.techniques?.map((t) => t.text) || [],
    dimensions,
    categories: r.categories?.map((c) => c.text) || [],
    sourceUrl: r.collectionsOnline?.url
      ? `https://collections.vam.ac.uk${r.collectionsOnline.url}`
      : `https://collections.vam.ac.uk/item/${r.systemNumber}`,
    allImages,
  };
}

export async function discoverRandomObject(): Promise<DesignObject> {
  const type = DESIGN_TYPES[Math.floor(Math.random() * DESIGN_TYPES.length)];
  const randomPage = Math.floor(Math.random() * 50) + 1;

  const params = new URLSearchParams({
    q_object_type: type,
    page: randomPage.toString(),
    page_size: "1",
    images_exist: "1",
  });

  const res = await fetch(`${VAM_BASE}/objects/search?${params}`);
  if (!res.ok) throw new Error(`V&A discover failed: ${res.statusText}`);

  const data: VAMSearchResponse = await res.json();
  if (data.records.length === 0) throw new Error("No object found");
  return transformRecord(data.records[0]);
}
