import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GeneratedReportsPluginSetup {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GeneratedReportsPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
