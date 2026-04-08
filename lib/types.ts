export interface VAMImage {
  _primary_thumbnail: string;
  _iiif_image_base_url: string;
  _iiif_presentation_url: string | null;
  imageResolution: string;
}

export interface VAMRecord {
  systemNumber: string;
  accessionNumber: string;
  objectType: string;
  _primaryTitle: string;
  _primaryMaker: {
    name: string;
    association: string;
  };
  _primaryImageId: string;
  _primaryDate: string;
  _primaryPlace: string;
  _images: VAMImage;
  _currentLocation?: {
    displayName: string;
    onDisplay: boolean;
  };
}

export interface VAMSearchResponse {
  info: {
    record_count: number;
    image_count: number;
    page_size: number;
    pages: number;
    page: number;
  };
  records: VAMRecord[];
}

export interface VAMObjectDetail {
  record: {
    systemNumber: string;
    accessionNumber: string;
    objectType: string;
    titles: Array<{ title: string; type: string }>;
    summaryDescription: string;
    physicalDescription: string;
    artistMakerPerson: Array<{
      name: { text: string };
      association: { text: string };
    }>;
    artistMakerOrganisations: Array<{
      name: { text: string };
      association: { text: string };
    }>;
    productionDates: Array<{
      date: { text: string };
    }>;
    placesOfOrigin: Array<{
      place: { text: string };
    }>;
    materials: Array<{ text: string }>;
    techniques: Array<{ text: string }>;
    dimensions: Array<{
      dimension: string;
      value: string;
      unit: string;
    }>;
    images: string[];
    categories: Array<{ text: string }>;
    collectionsOnline: { url: string };
  };
}

export interface DesignObject {
  id: string;
  title: string;
  designer: string;
  date: string;
  place: string;
  objectType: string;
  imageUrl: string;
  thumbnailUrl: string;
  imageBaseUrl: string;
}

export interface DesignObjectDetail extends DesignObject {
  description: string;
  materials: string[];
  techniques: string[];
  dimensions: string;
  categories: string[];
  sourceUrl: string;
  allImages: string[];
}

export interface FunItem {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  imageUrl: string;
  sourceUrl?: string;
}
