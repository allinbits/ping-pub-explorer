import { getStore } from '@netlify/blobs';

export interface ClaimStore {
  value: number;
  latest_claim: number;
}

export class Store {
  claim_key: string = 'faucet:claim';

  constructor() {}

  async getClaim(path: string): Promise<ClaimStore | null> {
    const store = getStore(this.claim_key);
    const res = await store.get(path);

    return JSON.parse(res) as ClaimStore;
  }

  async setClaim(path: string, value: number) {
    const store = getStore(this.claim_key);

    const now = new Date();

    await store.setJSON(path, {
      value: value,
      latest_claim: now.getTime(),
    });
  }
}
