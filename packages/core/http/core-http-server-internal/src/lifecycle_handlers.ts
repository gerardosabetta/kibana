/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Env } from '@kbn/config';
import type { OnPostAuthHandler, OnPreResponseHandler } from '@kbn/core-http-server';
import { isSafeMethod } from '@kbn/core-http-router-server-internal';
import { X_ELASTIC_INTERNAL_ORIGIN_REQUEST } from '@kbn/core-http-common/src/constants';
import { HttpConfig } from './http_config';
import { LifecycleRegistrar } from './http_server';

const VERSION_HEADER = 'kbn-version';
const XSRF_HEADER = 'kbn-xsrf';
const KIBANA_NAME_HEADER = 'kbn-name';

export const createXsrfPostAuthHandler = (config: HttpConfig): OnPostAuthHandler => {
  const { allowlist, disableProtection } = config.xsrf;

  return (request, response, toolkit) => {
    if (
      disableProtection ||
      allowlist.includes(request.route.path) ||
      request.route.options.xsrfRequired === false
    ) {
      return toolkit.next();
    }

    const hasVersionHeader = VERSION_HEADER in request.headers;
    const hasXsrfHeader = XSRF_HEADER in request.headers;

    if (!isSafeMethod(request.route.method) && !hasVersionHeader && !hasXsrfHeader) {
      return response.badRequest({ body: `Request must contain a ${XSRF_HEADER} header.` });
    }

    return toolkit.next();
  };
};

export const createRestrictInternalRoutesPostAuthHandler = (
  config: HttpConfig
): OnPostAuthHandler => {
  const isRestrictionEnabled = config.restrictInternalApis;

  return (request, response, toolkit) => {
    const isInternalRoute = request.route.options.access === 'internal';

    // only check if the header is present, not it's content.
    const hasInternalKibanaRequestHeader = X_ELASTIC_INTERNAL_ORIGIN_REQUEST in request.headers;

    if (isRestrictionEnabled && isInternalRoute && !hasInternalKibanaRequestHeader) {
      // throw 400
      return response.badRequest({
        body: `uri [${request.url}] with method [${request.route.method}] exists but is not available with the current configuration`,
      });
    }
    return toolkit.next();
  };
};

export const createVersionCheckPostAuthHandler = (kibanaVersion: string): OnPostAuthHandler => {
  return (request, response, toolkit) => {
    const requestVersion = request.headers[VERSION_HEADER];
    if (requestVersion && requestVersion !== kibanaVersion) {
      return response.badRequest({
        body: {
          message:
            `Browser client is out of date, please refresh the page ` +
            `("${VERSION_HEADER}" header was "${requestVersion}" but should be "${kibanaVersion}")`,
          attributes: {
            expected: kibanaVersion,
            got: requestVersion,
          },
        },
      });
    }

    return toolkit.next();
  };
};

export const createCustomHeadersPreResponseHandler = (config: HttpConfig): OnPreResponseHandler => {
  const {
    name: serverName,
    securityResponseHeaders,
    customResponseHeaders,
    csp: { header: cspHeader },
  } = config;

  return (request, response, toolkit) => {
    const additionalHeaders = {
      ...securityResponseHeaders,
      ...customResponseHeaders,
      'Content-Security-Policy': cspHeader,
      [KIBANA_NAME_HEADER]: serverName,
    };
    return toolkit.next({ headers: additionalHeaders });
  };
};

export const registerCoreHandlers = (
  registrar: LifecycleRegistrar,
  config: HttpConfig,
  env: Env
) => {
  // add headers based on config
  registrar.registerOnPreResponse(createCustomHeadersPreResponseHandler(config));
  // add extra request checks stuff
  registrar.registerOnPostAuth(createXsrfPostAuthHandler(config));
  // add check on version
  registrar.registerOnPostAuth(createVersionCheckPostAuthHandler(env.packageInfo.version));
  // add check on header if the route is internal
  registrar.registerOnPostAuth(createRestrictInternalRoutesPostAuthHandler(config)); // strictly speaking, we should have access to route.options.access from the request on postAuth
};
