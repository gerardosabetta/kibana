/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { SavedObjectReference, SavedObjectsClientContract } from '@kbn/core/server';

import type { ConnectorMappings } from '../../../common/api';
import type { SavedObjectFindOptionsKueryNode } from '../../common/types';
import type { IndexRefresh } from '../types';

export interface ClientArgs {
  unsecuredSavedObjectsClient: SavedObjectsClientContract;
}
export interface FindConnectorMappingsArgs extends ClientArgs {
  options?: SavedObjectFindOptionsKueryNode;
}

export interface PostConnectorMappingsArgs extends ClientArgs, IndexRefresh {
  attributes: ConnectorMappings;
  references: SavedObjectReference[];
}

export interface UpdateConnectorMappingsArgs extends ClientArgs, IndexRefresh {
  mappingId: string;
  attributes: Partial<ConnectorMappings>;
  references: SavedObjectReference[];
}
