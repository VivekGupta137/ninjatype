import { nanoquery } from '@nanostores/query';

export const [createFetcherStore, createMutatorStore] = nanoquery({
  fetcher: (...keys) => {
    // if in development, add a delay to simulate loading
    if (import.meta.env.DEV) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fetch(keys.join('')).then((r) => r.json()));
        }, 1000);
      });
    }
    return fetch(keys.join('')).then((r) => r.json());
  },
});

export type FetchWordListType = {
    words: string[];
    type: "wordlist" | "quotelist";
    description: string;
    length: number;
};