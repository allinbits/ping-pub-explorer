import type { RequestRegistry } from './registry';

import { COSMOS_REGISTRY } from './registry_cosmos';
import { ATOMONE_REGISTRY } from './registry_atomone';

export const DEFAULT: RequestRegistry = COSMOS_REGISTRY;

export const ATOMONE: RequestRegistry = ATOMONE_REGISTRY;
