import { externalHadithService } from "./externalHadithApi.service";

export const hadithService = {
  async getHadithsByBook(bookName: string) {
    const hadiths = await externalHadithService.fetchHadithsByBook(bookName);
    return hadiths;
  },
};
