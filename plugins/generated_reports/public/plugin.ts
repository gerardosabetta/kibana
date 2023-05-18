import { i18n } from '@kbn/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import {
  GeneratedReportsPluginSetup,
  GeneratedReportsPluginStart,
  AppPluginStartDependencies,
} from './types';
import { PLUGIN_NAME } from '../common';

export class GeneratedReportsPlugin
  implements Plugin<GeneratedReportsPluginSetup, GeneratedReportsPluginStart>
{
  public setup(core: CoreSetup): GeneratedReportsPluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: 'generatedReports',
      title: PLUGIN_NAME,
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in kibana.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

    return {};
  }

  public start(core: CoreStart): GeneratedReportsPluginStart {
    return {};
  }

  public stop() {}
}
