import { Blockchain } from '../types/chain';

import { stringToPath } from '@cosmjs/crypto';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate';

export class Faucet {
  mnemonic: string;
  chain: Blockchain;

  constructor(chain: Blockchain, mnemonic: string) {
    this.chain = chain;
    this.mnemonic = mnemonic;
  }
}

export class CosmosFaucet extends Faucet {
  wallet: DirectSecp256k1HdWallet | undefined;

  constructor(chain: Blockchain, mnemonic: string) {
    super(chain, mnemonic);
  }

  async get_wallet(): Promise<DirectSecp256k1HdWallet> {
    if (!this.wallet) {
      this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(this.mnemonic, {
        prefix: this.chain.addr_prefix,
        hdPaths: [stringToPath("m/44'/118'/0'/0/0")],
      });
    }
    return this.wallet;
  }

  async balanceOf(addr: string, prefix: string) {
    const client = await StargateClient.connect(this.chain.rpc[0].address);

    return await client.getBalance(addr, prefix);
  }

  async send(addr: string) {
    const wallet = await this.get_wallet();
    const client = await SigningStargateClient.connectWithSigner(
      this.chain.rpc[0].address,
      wallet,
    );

    const [fromAccount] = await wallet.getAccounts();

    const resp = await client.sendTokens(
      fromAccount.address,
      addr,
      this.chain.faucet.amount,
      this.chain.faucet.fees,
    );

    return resp;
  }
}
