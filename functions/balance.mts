import { CosmosFaucet } from './pkg/faucet';
import { Store } from './pkg/store';

import type { Config, Context } from '@netlify/functions';
import type { Blockchain } from './types/chain';

export const config: Config = {
  path: '/api/balance/:network/:chain_name',
};

export default async (req: Request, context: Context) => {
  const { network, chain_name } = context.params;

  const mnemonic = Netlify.env.get('MNEMONIC');
  if (!mnemonic) {
    return new Response(`env: MNEMONIC is missing`, {
      status: 500,
    });
  }

  var chain: Blockchain;

  try {
    chain = await import(`../chains/${network}/${chain_name}.json`);
  } catch (err) {
    return new Response(`${network}/${chain_name} not found`, {
      status: 400,
    });
  }

  const faucet = new CosmosFaucet(chain, mnemonic);

  try {
    const wallet = await faucet.get_wallet();
    const accounts = await wallet.getAccounts();

    const acc = accounts.find((x) => x.address.startsWith(chain.addr_prefix));
    if (!acc) {
      throw 'account not found';
    }

    const balance = await faucet.balanceOf(acc.address, chain.assets[0].base);

    return Response.json({
      ...balance,
      address: acc.address,
    });
  } catch (err) {
    return new Response(`error: ${err}`, {
      status: 500,
    });
  }
};
