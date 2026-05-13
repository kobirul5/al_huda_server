import axios from "axios";

export interface HadithItem {
  number: number;
  arabic: string;
  english: string;
  bangla: string;
}

type ExternalHadith = {
  text: string;
};

type ExternalHadithResponse = {
  hadiths?: ExternalHadith[];
};

const BASE_URL = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions";
const REQUEST_TIMEOUT_MS = 10000;

async function fetchHadithText(language: string, bookId: string, hadithNumber: number) {
  try {
    const response = await axios.get<ExternalHadithResponse>(
      `${BASE_URL}/${language}-${bookId}/${hadithNumber}.min.json`,
      { timeout: REQUEST_TIMEOUT_MS }
    );

    return response.data.hadiths?.[0]?.text || "";
  } catch {
    return "";
  }
}

async function fetchHadithByNumber(bookId: string, hadithNumber: number): Promise<HadithItem | null> {
  const [english, bangla, arabic] = await Promise.all([
    fetchHadithText("eng", bookId, hadithNumber),
    fetchHadithText("ben", bookId, hadithNumber),
    fetchHadithText("ara", bookId, hadithNumber),
  ]);

  if (!english) {
    return null;
  }

  return {
    number: hadithNumber,
    arabic,
    english,
    bangla: bangla || "অনুবাদ পাওয়া যায়নি",
  };
}

async function fetchHadithsByBook(bookId: string, page: number = 1, limit: number = 20): Promise<HadithItem[]> {
  try {
    const start = (page - 1) * limit + 1;
    const hadithNumbers = Array.from({ length: limit }, (_, index) => start + index);
    const hadiths = await Promise.all(hadithNumbers.map((number) => fetchHadithByNumber(bookId, number)));

    return hadiths.filter((hadith): hadith is HadithItem => Boolean(hadith));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Hadith API Error] Book: ${bookId}`, message);
    return [];
  }
}

export const externalHadithService = {
  fetchHadithsByBook,
};
