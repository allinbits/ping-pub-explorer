import { CosmosFaucet } from './pkg/faucet';

import type { Config, Context } from '@netlify/functions';
import type { Blockchain } from './types/chain';

export const config: Config = {
  path: '/api/balance/:network/:chain_name',
};

export default async (_req: Request, context: Context) => {
  const { network, chain_name } = context.params;

  const mnemonic = Netlify.env.get('MNEMONIC');
  if (!mnemonic) {
    console.log(`[ERROR] env: MNEMONIC is missing`);
    return new Response(JSON.stringify({ error: `env: MNEMONIC is missing` }), {
      status: 503,
    });
  }

  var chain: Blockchain;

  try {
    chain = await import(`../chains/${network}/${chain_name}.json`);
  } catch (err) {
    console.log(`[ERROR] ${network}/${chain_name} not found`);
    return new Response(
      JSON.stringify({ error: `${network}/${chain_name} not found` }),
      {
        status: 400,
      },
    );
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
    console.log(
      `[ERROR] failed to get balance of account: ${acc.address}, ${err}`,
    );
    return new Response(JSON.stringify({ error: err }), {
      status: 500,
    });
  }
};
