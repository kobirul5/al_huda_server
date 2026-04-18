import { externalHadithService } from "./externalHadithApi.service";

export const hadithService = {
  async getHadithsByBook(bookName: string, page: number = 1, limit: number = 20) {
    const hadiths = await externalHadithService.fetchHadithsByBook(bookName, page, limit);
    return hadiths;
  },
};
