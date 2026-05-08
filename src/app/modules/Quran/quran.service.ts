import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';

export type TranslationLanguage = 'en' | 'bn';

export interface ISurah {
  id: number;
  name: string;
  transliteration: string;
  type: 'meccan' | 'medinan';
  total_verses: number;
  link: string;
}

export interface ISurahDetail extends ISurah {
  verses: {
    id: number;
    text: string;
    translation: string;
    transliteration: string;
  }[];
}

interface IJuzBoundary {
  id: number;
  start: {
    surah: number;
    ayah: number;
  };
  end: {
    surah: number;
    ayah: number;
  };
}

export interface IParaSurahSegment extends ISurah {
  start_ayah: number;
  end_ayah: number;
  verses: ISurahDetail['verses'];
}

export interface IParaSurahSummary extends ISurah {
  start_ayah: number;
  end_ayah: number;
}

export interface IParaSummary {
  id: number;
  start: IJuzBoundary['start'];
  end: IJuzBoundary['end'];
  total_surahs: number;
  total_verses: number;
  surahs: IParaSurahSummary[];
}

export interface IParaDetail {
  id: number;
  start: IJuzBoundary['start'];
  end: IJuzBoundary['end'];
  total_surahs: number;
  total_verses: number;
  surahs: IParaSurahSegment[];
}

const supportedTranslationLanguages: TranslationLanguage[] = ['en', 'bn'];

const juzBoundaries: IJuzBoundary[] = [
  { id: 1, start: { surah: 1, ayah: 1 }, end: { surah: 2, ayah: 141 } },
  { id: 2, start: { surah: 2, ayah: 142 }, end: { surah: 2, ayah: 252 } },
  { id: 3, start: { surah: 2, ayah: 253 }, end: { surah: 3, ayah: 92 } },
  { id: 4, start: { surah: 3, ayah: 93 }, end: { surah: 4, ayah: 23 } },
  { id: 5, start: { surah: 4, ayah: 24 }, end: { surah: 4, ayah: 147 } },
  { id: 6, start: { surah: 4, ayah: 148 }, end: { surah: 5, ayah: 81 } },
  { id: 7, start: { surah: 5, ayah: 82 }, end: { surah: 6, ayah: 110 } },
  { id: 8, start: { surah: 6, ayah: 111 }, end: { surah: 7, ayah: 87 } },
  { id: 9, start: { surah: 7, ayah: 88 }, end: { surah: 8, ayah: 40 } },
  { id: 10, start: { surah: 8, ayah: 41 }, end: { surah: 9, ayah: 92 } },
  { id: 11, start: { surah: 9, ayah: 93 }, end: { surah: 11, ayah: 5 } },
  { id: 12, start: { surah: 11, ayah: 6 }, end: { surah: 12, ayah: 52 } },
  { id: 13, start: { surah: 12, ayah: 53 }, end: { surah: 14, ayah: 52 } },
  { id: 14, start: { surah: 15, ayah: 1 }, end: { surah: 16, ayah: 128 } },
  { id: 15, start: { surah: 17, ayah: 1 }, end: { surah: 18, ayah: 74 } },
  { id: 16, start: { surah: 18, ayah: 75 }, end: { surah: 20, ayah: 135 } },
  { id: 17, start: { surah: 21, ayah: 1 }, end: { surah: 22, ayah: 78 } },
  { id: 18, start: { surah: 23, ayah: 1 }, end: { surah: 25, ayah: 20 } },
  { id: 19, start: { surah: 25, ayah: 21 }, end: { surah: 27, ayah: 55 } },
  { id: 20, start: { surah: 27, ayah: 56 }, end: { surah: 29, ayah: 45 } },
  { id: 21, start: { surah: 29, ayah: 46 }, end: { surah: 33, ayah: 30 } },
  { id: 22, start: { surah: 33, ayah: 31 }, end: { surah: 36, ayah: 27 } },
  { id: 23, start: { surah: 36, ayah: 28 }, end: { surah: 39, ayah: 31 } },
  { id: 24, start: { surah: 39, ayah: 32 }, end: { surah: 41, ayah: 46 } },
  { id: 25, start: { surah: 41, ayah: 47 }, end: { surah: 45, ayah: 37 } },
  { id: 26, start: { surah: 46, ayah: 1 }, end: { surah: 51, ayah: 30 } },
  { id: 27, start: { surah: 51, ayah: 31 }, end: { surah: 57, ayah: 29 } },
  { id: 28, start: { surah: 58, ayah: 1 }, end: { surah: 66, ayah: 12 } },
  { id: 29, start: { surah: 67, ayah: 1 }, end: { surah: 77, ayah: 50 } },
  { id: 30, start: { surah: 78, ayah: 1 }, end: { surah: 114, ayah: 6 } },
];

const getAllSurahsFromCDN = async () => {
  const response = await axios.get(
    'https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/index.json',
  );
  
  const surahs: ISurah[] = response.data;
  
  // Calculate stats
  const stats = {
    totalSurahs: surahs.length,
    totalVerses: surahs.reduce((acc, s) => acc + s.total_verses, 0),
    meccanCount: surahs.filter(s => s.type === 'meccan').length,
    medinanCount: surahs.filter(s => s.type === 'medinan').length,
  };

  return { surahs, stats };
};

const getSurahById = async (
  id: string,
  translationLanguage: TranslationLanguage = 'en',
): Promise<ISurahDetail> => {
  const resolvedLanguage = supportedTranslationLanguages.includes(translationLanguage)
    ? translationLanguage
    : 'en';
  const response = await axios.get(
    `https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/${resolvedLanguage}/${id}.json`,
  );
  return response.data;
};

const getResolvedTranslationLanguage = (translationLanguage: TranslationLanguage) =>
  supportedTranslationLanguages.includes(translationLanguage) ? translationLanguage : 'en';

const getParaByBoundary = async (
  boundary: IJuzBoundary,
  surahIndex: ISurah[],
  translationLanguage: TranslationLanguage,
  surahCache: Map<number, Promise<ISurahDetail>>,
): Promise<IParaDetail> => {
  const surahSegments = surahIndex.filter(
    surah => surah.id >= boundary.start.surah && surah.id <= boundary.end.surah,
  );

  const surahs = await Promise.all(
    surahSegments.map(async surah => {
      if (!surahCache.has(surah.id)) {
        surahCache.set(surah.id, getSurahById(String(surah.id), translationLanguage));
      }

      const surahDetail = await surahCache.get(surah.id)!;
      const startAyah = surah.id === boundary.start.surah ? boundary.start.ayah : 1;
      const endAyah = surah.id === boundary.end.surah ? boundary.end.ayah : surah.total_verses;

      return {
        ...surah,
        start_ayah: startAyah,
        end_ayah: endAyah,
        verses: surahDetail.verses.filter(verse => verse.id >= startAyah && verse.id <= endAyah),
      };
    }),
  );

  return {
    id: boundary.id,
    start: boundary.start,
    end: boundary.end,
    total_surahs: surahs.length,
    total_verses: surahs.reduce((total, surah) => total + surah.verses.length, 0),
    surahs,
  };
};

const getParaSummaryByBoundary = (
  boundary: IJuzBoundary,
  surahIndex: ISurah[],
): IParaSummary => {
  const surahs = surahIndex
    .filter(surah => surah.id >= boundary.start.surah && surah.id <= boundary.end.surah)
    .map(surah => {
      const startAyah = surah.id === boundary.start.surah ? boundary.start.ayah : 1;
      const endAyah = surah.id === boundary.end.surah ? boundary.end.ayah : surah.total_verses;

      return {
        ...surah,
        start_ayah: startAyah,
        end_ayah: endAyah,
      };
    });

  return {
    id: boundary.id,
    start: boundary.start,
    end: boundary.end,
    total_surahs: surahs.length,
    total_verses: surahs.reduce((total, surah) => total + surah.end_ayah - surah.start_ayah + 1, 0),
    surahs,
  };
};

const getParaById = async (
  id: string,
  translationLanguage: TranslationLanguage = 'en',
): Promise<IParaDetail> => {
  const paraId = Number(id);
  const boundary = juzBoundaries.find(juz => juz.id === paraId);

  if (!boundary) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Para id must be between 1 and 30');
  }

  const resolvedLanguage = getResolvedTranslationLanguage(translationLanguage);
  const { surahs } = await getAllSurahsFromCDN();

  return getParaByBoundary(boundary, surahs, resolvedLanguage, new Map());
};

const getAllParas = async (): Promise<IParaSummary[]> => {
  const { surahs } = await getAllSurahsFromCDN();

  return juzBoundaries.map(boundary => getParaSummaryByBoundary(boundary, surahs));
};

export const QuranService = {
  getAllSurahsFromCDN,
  getSurahById,
  getAllParas,
  getParaById,
};
