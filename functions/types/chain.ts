import type { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';

export interface Blockchain {
  chain_name: string;
  registry_name: string;
  api: Api[];
  rpc: Rpc[];
  sdk_version: string;
  coin_type: string;
  min_tx_fee: string;
  addr_prefix: string;
  logo: string;
  assets: Asset[];
  faucet: Faucet;
}

export interface Api {
  provider: string;
  address: string;
}

export interface Rpc {
  provider: string;
  address: string;
}

export interface Asset {
  base: string;
  symbol: string;
  exponent: string;
  coingecko_id: string;
  logo: string;
}

export interface Faucet {
  amount: Coin[];
  ip_limit: string;
  address_limit: string;
  fees: string;
  whitelist: string[];
}
