import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { FormattedMessage, I18nProvider } from '@kbn/i18n-react';
import { BrowserRouter as Router } from 'react-router-dom';

import { EuiPage, EuiPageBody, EuiPageHeader, EuiTitle } from '@elastic/eui';

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { PLUGIN_NAME } from '../../common';
import { GeneratedReports } from './generated_reports';
import { EuiPageContentHeader_Deprecated } from '@elastic/eui';
import { EuiPageContent_Deprecated } from '@elastic/eui';
import { EuiPageContentBody_Deprecated } from '@elastic/eui';

interface GeneratedReportsAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
}

const queryClient = new QueryClient();

export const GeneratedReportsApp = ({ basename }: GeneratedReportsAppDeps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename={basename}>
        <I18nProvider>
          <>
            <EuiPage restrictWidth="1400px">
              <EuiPageBody>
                <EuiPageContent_Deprecated>
                  <EuiPageContentHeader_Deprecated>
                    <EuiTitle>
                      <h2>All time generated report history</h2>
                    </EuiTitle>
                  </EuiPageContentHeader_Deprecated>
                  <EuiPageContentBody_Deprecated>
                    <GeneratedReports />
                  </EuiPageContentBody_Deprecated>
                </EuiPageContent_Deprecated>
              </EuiPageBody>
            </EuiPage>
          </>
        </I18nProvider>
      </Router>
    </QueryClientProvider>
  );
};
