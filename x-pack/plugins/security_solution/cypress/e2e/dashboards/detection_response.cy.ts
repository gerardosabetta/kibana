/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { getNewRule } from '../../objects/rule';
import { ALERTS_COUNT } from '../../screens/alerts';
import {
  CONTROL_FRAMES,
  OPTION_LIST_LABELS,
  OPTION_LIST_VALUES,
} from '../../screens/common/filter_group';

import {
  HOST_TABLE_HOST_NAME_BTN,
  HOST_TABLE_ROW_SEV,
  HOST_TABLE_ROW_TOTAL_ALERTS,
  RULE_TABLE_ROW_RULE_NAME_BTN,
  RULE_TABLE_ROW_TOTAL_ALERTS,
  RULE_TABLE_VIEW_ALL_OPEN_ALERTS_BTN,
  USER_TABLE_ROW_SEV,
  USER_TABLE_ROW_TOTAL_ALERTS,
  USER_TABLE_USER_NAME_BTN,
} from '../../screens/detection_response';
import { DETECTION_RESPONSE } from '../../screens/security_header';
import { QUERY_TAB_BUTTON, TIMELINE_DATA_PROVIDERS_CONTAINER } from '../../screens/timeline';
import { waitForAlerts } from '../../tasks/alerts';
import { createRule } from '../../tasks/api_calls/rules';
import { cleanKibana } from '../../tasks/common';
import { investigateDashboardItemInTimeline } from '../../tasks/dashboards/common';
import { waitToNavigateAwayFrom } from '../../tasks/kibana_navigation';
import { login, visit } from '../../tasks/login';
import { navigateFromHeaderTo } from '../../tasks/security_header';
import { closeTimeline } from '../../tasks/timeline';
import { ALERTS_URL, DASHBOARDS_URL, DETECTIONS_RESPONSE_URL } from '../../urls/navigation';

describe('Detection response view', () => {
  before(() => {
    cleanKibana();
    login();
    createRule(getNewRule());
    visit(DETECTIONS_RESPONSE_URL);
  });
  context('Open in timeline', { testIsolation: false }, () => {
    afterEach(() => {
      closeTimeline();
    });

    it(`opens timeline with correct query count for hosts by alert severity table`, () => {
      cy.get(HOST_TABLE_ROW_TOTAL_ALERTS)
        .first()
        .then((sub) => {
          const alertCount = sub.text();
          cy.get(HOST_TABLE_HOST_NAME_BTN)
            .first()
            .then((hostNameEl) => {
              const hostName = hostNameEl.text();
              investigateDashboardItemInTimeline(HOST_TABLE_ROW_TOTAL_ALERTS);
              cy.get(QUERY_TAB_BUTTON).should('be.visible').should('contain.text', alertCount);
              cy.get(TIMELINE_DATA_PROVIDERS_CONTAINER)
                .should('be.visible')
                .should(
                  'contain.text',
                  `host.name: "${hostName}"ANDkibana.alert.workflow_status: "open"`
                );
            });
        });
    });
    it(`opens timeline with correct query count for users by alert severity table`, () => {
      cy.get(USER_TABLE_ROW_TOTAL_ALERTS)
        .first()
        .then((sub) => {
          const alertCount = sub.text();
          cy.get(USER_TABLE_USER_NAME_BTN)
            .first()
            .then((userNameEl) => {
              const userName = userNameEl.text();
              investigateDashboardItemInTimeline(USER_TABLE_ROW_TOTAL_ALERTS);
              cy.get(QUERY_TAB_BUTTON).should('contain.text', alertCount);
              cy.get(TIMELINE_DATA_PROVIDERS_CONTAINER)
                .should('be.visible')
                .should(
                  'contain.text',
                  `user.name: "${userName}"ANDkibana.alert.workflow_status: "open"`
                );
            });
        });
    });
    it(`opens timeline with correct query count for open alerts by rule table`, () => {
      cy.get(RULE_TABLE_ROW_TOTAL_ALERTS)
        .first()
        .then((sub) => {
          const alertCount = sub.text();
          cy.get(RULE_TABLE_ROW_RULE_NAME_BTN)
            .first()
            .then((ruleNameEl) => {
              const ruleName = ruleNameEl.text();
              investigateDashboardItemInTimeline(RULE_TABLE_ROW_TOTAL_ALERTS);
              cy.get(QUERY_TAB_BUTTON).should('contain.text', alertCount);
              cy.get(TIMELINE_DATA_PROVIDERS_CONTAINER)
                .should('be.visible')
                .should(
                  'contain.text',
                  `kibana.alert.rule.name: "${ruleName}"ANDkibana.alert.workflow_status: "open"`
                );
            });
        });
    });
  });

  context('Redirection to AlertPage', { testIsolation: false }, () => {
    afterEach(() => {
      navigateFromHeaderTo(DETECTION_RESPONSE);
    });

    it('should redirect to alert page with host and status as the filters', () => {
      cy.get(HOST_TABLE_ROW_TOTAL_ALERTS)
        .first()
        .should('be.visible')
        .then((sub) => {
          const alertCount = sub.text();
          cy.get(HOST_TABLE_HOST_NAME_BTN)
            .first()
            .should('be.visible')
            .then((hostNameEl) => {
              const hostName = hostNameEl.text();
              sub.trigger('click');
              waitToNavigateAwayFrom(DASHBOARDS_URL);
              cy.url().should((urlString) => {
                const url = new URL(urlString);
                expect(url.pathname.endsWith(ALERTS_URL)).eq(true);
              });
              waitForAlerts();
              cy.get(ALERTS_COUNT).should('be.visible').should('have.text', `${alertCount} alerts`);
              cy.get(CONTROL_FRAMES).should('have.length', 2);
              cy.get(OPTION_LIST_LABELS).eq(0).should('have.text', `Status`);
              cy.get(OPTION_LIST_VALUES(0)).should('have.text', 'open1');
              cy.get(OPTION_LIST_LABELS).eq(1).should('have.text', `Host name`);
              cy.get(OPTION_LIST_VALUES(1)).should('have.text', `${hostName}1`);
            });
        });
    });

    it('should redirect to alert page with host, status and severity as the filters', () => {
      const severityVal = 'high';
      cy.get(HOST_TABLE_ROW_SEV(severityVal))
        .first()
        .should('be.visible')
        .then((sub) => {
          const alertCount = sub.text();
          cy.get(HOST_TABLE_HOST_NAME_BTN)
            .first()
            .should('be.visible')
            .then((hostNameEl) => {
              cy.get(HOST_TABLE_ROW_SEV(severityVal)).first().trigger('click');
              waitToNavigateAwayFrom(DASHBOARDS_URL);
              const hostName = hostNameEl.text();
              waitForAlerts();
              cy.get(ALERTS_COUNT).should('be.visible').should('have.text', `${alertCount} alerts`);
              cy.get(CONTROL_FRAMES).should('have.length', 3);
              cy.get(OPTION_LIST_LABELS).eq(0).should('have.text', `Status`);
              cy.get(OPTION_LIST_VALUES(0)).should('have.text', 'open1');
              cy.get(OPTION_LIST_LABELS).eq(1).should('have.text', 'Host name');
              cy.get(OPTION_LIST_VALUES(1)).should('have.text', `${hostName}1`);
              cy.get(OPTION_LIST_LABELS).eq(2).should('have.text', 'Severity');
              cy.get(OPTION_LIST_VALUES(2)).should('have.text', `${severityVal}1`);
            });
        });
    });
    it('should redirect to alert page with user and status as the filters', () => {
      cy.get(USER_TABLE_ROW_TOTAL_ALERTS)
        .first()
        .should('be.visible')
        .then((sub) => {
          const alertCount = sub.text();
          cy.get(USER_TABLE_USER_NAME_BTN)
            .first()
            .should('be.visible')
            .then((userNameEl) => {
              const userName = userNameEl.text();
              sub.trigger('click');
              waitToNavigateAwayFrom(DASHBOARDS_URL);
              cy.url().should((urlString) => {
                const url = new URL(urlString);
                expect(url.pathname.endsWith(ALERTS_URL)).eq(true);
              });
              waitForAlerts();
              cy.get(ALERTS_COUNT).should('be.visible').should('have.text', `${alertCount} alerts`);
              cy.get(CONTROL_FRAMES).should('have.length', 2);
              cy.get(OPTION_LIST_LABELS).eq(0).should('have.text', `Status`);
              cy.get(OPTION_LIST_VALUES(0)).should('have.text', 'open1');
              cy.get(OPTION_LIST_LABELS).eq(1).should('have.text', `Username`);
              cy.get(OPTION_LIST_VALUES(1)).should('have.text', `${userName}1`);
            });
        });
    });

    it('should redirect to alert page with user, status and severity as the filters', () => {
      const severityVal = 'high';
      cy.get(USER_TABLE_ROW_SEV(severityVal))
        .first()
        .should('be.visible')
        .then((sub) => {
          const alertCount = sub.text();
          cy.get(USER_TABLE_USER_NAME_BTN)
            .first()
            .should('be.visible')
            .then((userNameEl) => {
              const userName = userNameEl.text();
              cy.get(USER_TABLE_ROW_SEV(severityVal)).trigger('click');
              waitToNavigateAwayFrom(DASHBOARDS_URL);
              waitForAlerts();
              cy.get(ALERTS_COUNT).should('be.visible').should('have.text', `${alertCount} alerts`);
              cy.get(CONTROL_FRAMES).should('have.length', 3);
              cy.get(OPTION_LIST_LABELS).eq(0).should('have.text', `Status`);
              cy.get(OPTION_LIST_VALUES(0)).should('have.text', 'open1');
              cy.get(OPTION_LIST_LABELS).eq(1).should('have.text', 'Username');
              cy.get(OPTION_LIST_VALUES(1)).should('have.text', `${userName}1`);
              cy.get(OPTION_LIST_LABELS).eq(2).should('have.text', 'Severity');
              cy.get(OPTION_LIST_VALUES(2)).should('have.text', `${severityVal}1`);
            });
        });
    });
    it('should redirect to alert page with rule name & status as filters', () => {
      cy.get(RULE_TABLE_ROW_TOTAL_ALERTS)
        .first()
        .should('be.visible')
        .then((sub) => {
          const alertCount = sub.text();
          cy.get(RULE_TABLE_ROW_RULE_NAME_BTN)
            .first()
            .should('be.visible')
            .then((ruleNameEl) => {
              sub.trigger('click');
              waitToNavigateAwayFrom(DASHBOARDS_URL);
              const ruleName = ruleNameEl.text();
              waitForAlerts();
              cy.get(ALERTS_COUNT).should('be.visible').should('have.text', `${alertCount} alerts`);
              cy.get(CONTROL_FRAMES).should('have.length', 2);
              cy.get(OPTION_LIST_LABELS).eq(0).should('have.text', `Status`);
              cy.get(OPTION_LIST_VALUES(0)).should('have.text', 'open1');
              cy.get(OPTION_LIST_LABELS).eq(1).should('have.text', 'Rule name');
              cy.get(OPTION_LIST_VALUES(1)).should('have.text', `${ruleName}1`);
            });
        });
    });
    it('should redirect to "View Open Alerts" correctly', () => {
      cy.get(RULE_TABLE_VIEW_ALL_OPEN_ALERTS_BTN)
        .first()
        .should('be.visible')
        .then((sub) => {
          sub.trigger('click');
          waitToNavigateAwayFrom(DASHBOARDS_URL);
          waitForAlerts();
          cy.get(CONTROL_FRAMES).should('have.length', 1);
          cy.get(OPTION_LIST_LABELS).eq(0).should('have.text', `Status`);
          cy.get(OPTION_LIST_VALUES(0)).should('have.text', 'open1');
        });
    });
  });
});
