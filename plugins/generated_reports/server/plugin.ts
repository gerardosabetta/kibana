import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { GeneratedReportsPluginSetup, GeneratedReportsPluginStart } from './types';
import { defineRoutes } from './routes';

export class GeneratedReportsPlugin
  implements Plugin<GeneratedReportsPluginSetup, GeneratedReportsPluginStart>
{
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('generatedReports: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('generatedReports: Started');
    return {};
  }

  public stop() {}
}
