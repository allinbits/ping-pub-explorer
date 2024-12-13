import type { Blockchain } from './types/chain';
import { CosmosFaucet } from './pkg/faucet';
import { Store } from './pkg/store';

import type { Config, Context } from '@netlify/functions';

// ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const config: Config = {
  path: '/api/send/:network/:chain_name/:address',
};

export default async (_req: Request, context: Context) => {
  const { network, chain_name, address } = context.params;

  const mnemonic = Netlify.env.get('MNEMONIC');
  if (!mnemonic) {
    console.error('mnemonic is missing');
    return new Response(JSON.stringify({ error: `env: MNEMONIC is missing` }), {
      status: 500,
    });
  }

  const path = `${network}/${chain_name}/${address}`;
  const store = new Store();
  const stored_claim = await store.getClaim(path);

  if (stored_claim) {
    const now = new Date().getTime();
    const since = (now - stored_claim.latest_claim) / (1000 * 60 * 60); // in hours
    if (since < 1) {
      return new Response(JSON.stringify({ error: `already claimed` }), {
        status: 401,
      });
    }
  }

  var chain: Blockchain;

  try {
    chain = await import(`../chains/${network}/${chain_name}.json`);
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({ error: `${network}/${chain_name} not found` }),
      {
        status: 400,
      },
    );
  }

  // Ensure address is whitelisted
  if (
    chain.faucet.whitelist &&
    chain.faucet.whitelist.length !== 0 &&
    !chain.faucet.whitelist.find((x: string) => x === address)
  ) {
    return new Response(
      JSON.stringify({ error: `address is not whitelisted` }),
      {
        status: 400,
      },
    );
  }

  // Send tokens
  try {
    const faucet = new CosmosFaucet(chain, mnemonic);
    const resp = await faucet.send(address);

    await store.setClaim(
      path,
      stored_claim && stored_claim.value ? (stored_claim.value += 1) : 1,
    );

    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error(err);

    return new Response(JSON.stringify({ error: err }), {
      status: 500,
    });
  }
};
