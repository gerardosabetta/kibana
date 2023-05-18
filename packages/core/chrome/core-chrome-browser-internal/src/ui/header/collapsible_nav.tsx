/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import './collapsible_nav.scss';
import {
  EuiThemeProvider,
  EuiCollapsibleNav,
  EuiCollapsibleNavGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiListGroup,
  EuiListGroupItem,
  EuiCollapsibleNavProps,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import React, { useMemo } from 'react';
import useObservable from 'react-use/lib/useObservable';
import * as Rx from 'rxjs';
import type { HttpStart } from '@kbn/core-http-browser';
import type { InternalApplicationStart } from '@kbn/core-application-browser-internal';
import type { ChromeNavLink, ChromeRecentlyAccessedHistoryItem } from '@kbn/core-chrome-browser';
import type { OnIsLockedUpdate } from './types';
import { createEuiListItem } from './nav_link';
import { QueryClient, useQuery, QueryClientProvider } from '@tanstack/react-query';

function getCategoryLocalStorageKey(id: string) {
  return `core.navGroup.${id}`;
}

function getIsCategoryOpen(id: string, storage: Storage) {
  const value = storage.getItem(getCategoryLocalStorageKey(id)) ?? 'true';

  return value === 'true';
}

function setIsCategoryOpen(id: string, isOpen: boolean, storage: Storage) {
  storage.setItem(getCategoryLocalStorageKey(id), `${isOpen}`);
}

const queryClient = new QueryClient();

function useDashboards(pageSize = 10) {
  return useQuery({
    queryKey: ['dashboards'],
    queryFn: async () => {
      const res = await (
        await window.fetch(`/api/saved_objects/_find?type=dashboard&page=1&per_page=${pageSize}`)
      ).json();

      return res.saved_objects.map((savedObj: any) => ({
        id: savedObj.id,
        title: savedObj.attributes.title,
      }));
    },
  });
}

interface Props {
  appId$: InternalApplicationStart['currentAppId$'];
  basePath: HttpStart['basePath'];
  id: string;
  isNavOpen: boolean;
  homeHref: string;
  navLinks$: Rx.Observable<ChromeNavLink[]>;
  recentlyAccessed$: Rx.Observable<ChromeRecentlyAccessedHistoryItem[]>;
  storage?: Storage;
  onIsLockedUpdate: OnIsLockedUpdate;
  closeNav: () => void;
  navigateToApp: InternalApplicationStart['navigateToApp'];
  navigateToUrl: InternalApplicationStart['navigateToUrl'];
  customNavLink$: Rx.Observable<ChromeNavLink | undefined>;
  button: EuiCollapsibleNavProps['button'];
}

const allowedIDs = ['dashboards', 'discover', 'visualize', 'generatedReports'];

export function CollapsibleNav({
  basePath,
  id,
  isNavOpen,
  homeHref,
  storage = window.localStorage,
  onIsLockedUpdate,
  closeNav,
  navigateToApp,
  navigateToUrl,
  button,
  ...observables
}: Props) {
  const allLinks = useObservable(observables.navLinks$, []);
  const allowedLinks = useMemo(
    () => allLinks.filter((link) => allowedIDs.includes(link.id)),
    [allLinks]
  );
  const customNavLink = useObservable(observables.customNavLink$, undefined);
  const appId = useObservable(observables.appId$, '');

  const readyForEUI = (link: ChromeNavLink, needsIcon: boolean = false) => {
    return createEuiListItem({
      link,
      appId,
      dataTestSubj: 'collapsibleNavAppLink',
      navigateToUrl,
      onClick: closeNav,
      ...(needsIcon && { basePath }),
    });
  };

  function ListOfDashboards() {
    const { data = [] } = useDashboards();
    const currentHref = window.location.href;

    return (
      <EuiCollapsibleNavGroup
        key="dashboardsList"
        background="light"
        title={i18n.translate('core.ui.dashboards', { defaultMessage: 'Dashboards' })}
        isCollapsible={true}
        initialIsOpen={getIsCategoryOpen('dashboards', storage)}
        onToggle={(isCategoryOpen) => {
          setIsCategoryOpen('dashboards', isCategoryOpen, storage);
        }}
      >
        <EuiListGroup
          aria-label="Dashboards"
          maxWidth="none"
          color="subdued"
          gutterSize="none"
          size="s"
          flush
        >
          {data.map((dashboard: any) => (
            <EuiListGroupItem
              {...readyForEUI({
                id: dashboard.id,
                title: dashboard.title,
                href: `/app/dashboards#/view/${dashboard.id}`,
                baseUrl: `/`,
                url: `/app/dashboards#/view/${dashboard.id}`,
              })}
              color="text"
              size="s"
              isActive={currentHref.includes(`/app/dashboards#/view/${dashboard.id}`)}
            />
          ))}
          <EuiListGroupItem
            {...readyForEUI({
              id: 'dashboards',
              title: 'View all',
              href: '/app/dashboards#/list',
              baseUrl: '/',
              url: '/app/dashboards#/list',
            })}
            size="s"
            iconType="plusInCircle"
            color="primary"
            isActive={currentHref.includes('/app/dashboards#/list')}
          />
        </EuiListGroup>
      </EuiCollapsibleNavGroup>
    );
  }
  return (
    <EuiCollapsibleNav
      data-test-subj="collapsibleNav"
      id={id}
      aria-label={i18n.translate('core.ui.primaryNav.screenReaderLabel', {
        defaultMessage: 'Primary',
      })}
      isOpen={isNavOpen}
      onClose={closeNav}
      button={button}
      ownFocus={false}
      size={248}
    >
      {customNavLink && (
        <>
          <EuiFlexItem grow={false} style={{ flexShrink: 0 }}>
            <EuiCollapsibleNavGroup
              background="dark"
              className="eui-yScroll"
              style={{ maxHeight: '40vh' }}
            >
              <EuiThemeProvider colorMode="dark">
                <EuiListGroup
                  listItems={[
                    createEuiListItem({
                      link: customNavLink,
                      basePath,
                      navigateToUrl,
                      dataTestSubj: 'collapsibleNavCustomNavLink',
                      onClick: closeNav,
                      externalLink: true,
                    }),
                  ]}
                  maxWidth="none"
                  gutterSize="none"
                  size="s"
                />
              </EuiThemeProvider>
            </EuiCollapsibleNavGroup>
          </EuiFlexItem>

          <EuiHorizontalRule margin="none" />
        </>
      )}

      <QueryClientProvider client={queryClient}>
        <ListOfDashboards />
      </QueryClientProvider>

      <EuiHorizontalRule margin="none" />

      <EuiFlexItem className="eui-yScroll">
        <EuiCollapsibleNavGroup data-test-subj={`collapsibleNavGroup-noCategory`}>
          {allowedLinks.map((link, i) => (
            <EuiListGroup key={i} flush>
              <EuiListGroupItem color="text" size="s" {...readyForEUI(link)} />
            </EuiListGroup>
          ))}
        </EuiCollapsibleNavGroup>
      </EuiFlexItem>
    </EuiCollapsibleNav>
  );
}
