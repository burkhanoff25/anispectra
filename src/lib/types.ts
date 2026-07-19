// Общие типы данных, используемые во всех разделах Anispectra

export interface AniLibertyName {
  main: string;
  english: string | null;
  alternative: string | null;
}

export interface AniLibertyPoster {
  src: string | null;
  thumbnail: string | null;
}

export interface AniLibertyGenre {
  id: number;
  name: string;
}

export interface AniLibertyEpisode {
  id: string;
  name: string | null;
  ordinal: number;
  preview: { src: string } | null;
  hls_480: string | null;
  hls_720: string | null;
  hls_1080: string | null;
  duration: number | null;
  opening?: { start: number | null; stop: number | null } | null;
  ending?: { start: number | null; stop: number | null } | null;
}

export interface AniLibertyRelease {
  id: number;
  type?: { value: string; description: string } | null;
  year: number | null;
  name: AniLibertyName;
  alias: string;
  season?: { value: string; description: string; year: number } | null;
  poster: AniLibertyPoster;
  description: string | null;
  is_ongoing: boolean;
  age_rating?: { value: string; label: string } | null;
  genres: AniLibertyGenre[];
  episodes_total: number | null;
  episodes?: AniLibertyEpisode[];
}

export interface AniLibertyPagination {
  pages: number;
  page: number;
  items_per_page: number;
  total_items: number;
}

export interface AniLibertyCatalogResponse {
  data: AniLibertyRelease[];
  meta: { pagination: AniLibertyPagination };
}

// --- Kodik (дорамы) ---
export interface KodikResultItem {
  id: string;
  type: string;
  link: string;
  title: string;
  title_orig: string | null;
  year: number | null;
  screenshots?: string[];
  translation?: { id: number; title: string; type: string } | null;
  seasons?: Record<
    string,
    {
      link: string;
      episodes: Record<string, string>;
    }
  >;
  last_season?: number;
  last_episode?: number;
  episodes_count?: number;
  material_data?: {
    poster_url?: string;
    anime_poster_url?: string;
    description?: string;
    all_genres?: string[];
    countries?: string[];
    shikimori_rating?: number;
  } | null;
}

export interface KodikSearchResponse {
  time: string;
  total: number;
  results: KodikResultItem[];
}

// --- MangaDex (манга) ---
export interface MangaDexTitleMap {
  [lang: string]: string;
}

export interface MangaDexManga {
  id: string;
  type: "manga";
  attributes: {
    title: MangaDexTitleMap;
    description: MangaDexTitleMap;
    status: string;
    year: number | null;
    contentRating: string;
    tags: { attributes: { name: MangaDexTitleMap; group: string } }[];
  };
  relationships: { id: string; type: string; attributes?: Record<string, unknown> }[];
}

export interface MangaDexChapter {
  id: string;
  attributes: {
    chapter: string | null;
    title: string | null;
    translatedLanguage: string;
    pages: number;
    publishAt: string;
  };
}
