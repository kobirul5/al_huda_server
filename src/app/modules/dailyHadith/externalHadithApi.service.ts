import axios from "axios";

export interface HadithItem {
  number: number;
  arabic: string;
  english: string;
  bangla: string;
}

const BASE_URL = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

async function fetchHadithsByBook(bookId: string): Promise<HadithItem[]> {
  try {

    const [engRes, benRes, araRes] = await Promise.all([
      axios.get(`${BASE_URL}/eng-${bookId}.min.json`),
      axios.get(`${BASE_URL}/ben-${bookId}.min.json`).catch(() => ({ data: { hadiths: [] } })), // Fallback if Bangla not available
      axios.get(`${BASE_URL}/ara-${bookId}.min.json`).catch(() => ({ data: { hadiths: [] } }))
    ]);

    const engHadiths = engRes.data.hadiths || [];
    const benHadiths = benRes.data.hadiths || [];
    const araHadiths = araRes.data.hadiths || [];

    const mergedHadiths: HadithItem[] = engHadiths.slice(0, 500).map((h: any, index: number) => {
      return {
        number: h.hadithnumber,
        arabic: araHadiths[index]?.text || "",
        english: h.text || "",
        bangla: benHadiths[index]?.text || "অনুবাদ পাওয়া যায়নি",
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
