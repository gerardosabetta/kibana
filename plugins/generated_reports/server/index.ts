import { PluginInitializerContext } from '../../../src/core/server';
import { GeneratedReportsPlugin } from './plugin';

//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new GeneratedReportsPlugin(initializerContext);
}

export { GeneratedReportsPluginSetup, GeneratedReportsPluginStart } from './types';
