import axios from 'axios';

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

const getSurahById = async (id: any): Promise<ISurahDetail> => {
  const response = await axios.get(
    `https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/${id}.json`,
  );
  return response.data;
};

export const QuranService = {
  getAllSurahsFromCDN,
  getSurahById,
};
