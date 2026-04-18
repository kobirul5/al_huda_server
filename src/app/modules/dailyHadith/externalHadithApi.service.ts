import axios from "axios";

export interface HadithItem {
  number: number;
  arabic: string;
  english: string;
  bangla: string;
}

const BASE_URL = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

async function fetchHadithsByBook(bookId: string, page: number = 1, limit: number = 20): Promise<HadithItem[]> {
  try {
    const start = (page - 1) * limit;
    const end = start + limit;

    const [engRes, benRes, araRes] = await Promise.all([
      axios.get(`${BASE_URL}/eng-${bookId}.min.json`),
      axios.get(`${BASE_URL}/ben-${bookId}.min.json`).catch(() => ({ data: { hadiths: [] } })), // Fallback if Bangla not available
      axios.get(`${BASE_URL}/ara-${bookId}.min.json`).catch(() => ({ data: { hadiths: [] } }))
    ]);

    const engHadiths = engRes.data.hadiths || [];
    const benHadiths = benRes.data.hadiths || [];
    const araHadiths = araRes.data.hadiths || [];

    const mergedHadiths: HadithItem[] = engHadiths.slice(start, end).map((h: any, index: number) => {
      const actualIndex = start + index;
      return {
        number: h.hadithnumber,
        arabic: araHadiths[actualIndex]?.text || "",
        english: h.text || "",
        bangla: benHadiths[actualIndex]?.text || "অনুবাদ পাওয়া যায়নি",
      };
    });

    return mergedHadiths;
  } catch (error: any) {
    console.error(`[Hadith API Error] Book: ${bookId}`, error.message);
    return [];
  }
}

export const externalHadithService = {
  fetchHadithsByBook,
};
