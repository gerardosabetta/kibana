import './index.scss';

import { GeneratedReportsPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new GeneratedReportsPlugin();
}
export { GeneratedReportsPluginSetup, GeneratedReportsPluginStart } from './types';
