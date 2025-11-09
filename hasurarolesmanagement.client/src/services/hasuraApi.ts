import type { Metadata, Table } from '../types/metadataSchemes';

// Get Hasura endpoint from environment variable or use default
const HASURA_ENDPOINT = import.meta.env.VITE_HASURA_ENDPOINT || 'https://hasura-test.mstart.local/v1/metadata';
const HASURA_ADMIN_KEY = import.meta.env.VITE_HASURA_ADMIN_SECRET || 'myadminsecretkey';

export interface ExportMetadataRequest {
  type: 'export_metadata';
  args: Record<string, never>;
}

export interface ReplaceMetadataRequest {
  type: 'replace_metadata';
  args: Record<string, any>;
}

// Keep HasuraMetadata as an alias for backward compatibility
export type HasuraMetadata = Metadata;

/**
 * Deserializes raw JSON metadata into typed Metadata object
 */
export function deserializeMetadata(rawMetadata: any): Metadata {
  // If it's already in the new format (with sources), return as-is
  if (rawMetadata.sources && Array.isArray(rawMetadata.sources)) {
    return rawMetadata as Metadata;
  }

  // Handle old format (tables directly) - convert to new format
  if (rawMetadata.tables && Array.isArray(rawMetadata.tables)) {
    const metadata: Metadata = {
      version: rawMetadata.version || 0,
      sources: [
        {
          name: 'default',
          kind: 'postgres',
          tables: rawMetadata.tables.map((table: any) => ({
            table: {
              name: table.table?.name || '',
              schema: table.table?.schema || 'public',
            },
            select_permissions: table.select_permissions?.map((perm: any) => ({
              role: perm.role,
              permission: {
                columns: perm.permission?.columns || [],
                filter: perm.permission?.filter,
                allow_aggregations: perm.permission?.allow_aggregations,
                limit: perm.permission?.limit,
                query_root_fields: perm.permission?.query_root_fields,
                subscription_root_fields: perm.permission?.subscription_root_fields,
              },
              comment: perm.comment,
            })),
            update_permissions: table.update_permissions?.map((perm: any) => ({
              role: perm.role,
              permission: {
                columns: perm.permission?.columns || [],
                filter: perm.permission?.filter,
                set: perm.permission?.set,
                check: perm.permission?.check,
              },
              comment: perm.comment,
            })),
            insert_permissions: table.insert_permissions?.map((perm: any) => ({
              role: perm.role,
              permission: {
                columns: perm.permission?.columns || [],
                check: perm.permission?.check,
                set: perm.permission?.set,
                backend_only: perm.permission?.backend_only,
              },
              comment: perm.comment,
            })),
            delete_permissions: table.delete_permissions?.map((perm: any) => ({
              role: perm.role,
              permission: {
                filter: perm.permission?.filter,
                backend_only: perm.permission?.backend_only,
              },
              comment: perm.comment,
            })),
            configuration: table.configuration,
            is_enum: table.is_enum,
          })),
          configuration: {},
        },
      ],
      actions: rawMetadata.actions || null,
      custom_types: rawMetadata.custom_types || null,
    };

    // Preserve other properties
    Object.keys(rawMetadata).forEach((key) => {
      if (!['version', 'tables', 'actions', 'custom_types'].includes(key)) {
        metadata[key] = rawMetadata[key];
      }
    });

    return metadata;
  }

  // If neither format, return as-is
  return rawMetadata as Metadata;
}

/**
 * Fetches the current metadata from Hasura and deserializes it
 */
export async function exportMetadata(): Promise<Metadata> {
  const response = await fetch(HASURA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_KEY,
    },
    body: JSON.stringify({
      type: 'export_metadata',
      args: {},
    } as ExportMetadataRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to export metadata: ${response.status} ${errorText}`);
  }

  const rawMetadata = await response.json();
  return deserializeMetadata(rawMetadata);
}

/**
 * Replaces the metadata in Hasura
 */
export async function replaceMetadata(metadata: Metadata): Promise<void> {
  const response = await fetch(HASURA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_KEY,
    },
    body: JSON.stringify({
      type: 'replace_metadata',
      args: metadata,
    } as ReplaceMetadataRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to replace metadata: ${response.status} ${errorText}`);
  }
}

/**
 * Gets all tables from all data sources
 */
export function getAllTables(metadata: Metadata): Table[] {
  const tables: Table[] = [];
  
  if (metadata.sources) {
    metadata.sources.forEach((source) => {
      if (source.tables) {
        tables.push(...source.tables);
      }
    });
  }

  return tables;
}

/**
 * Extracts all unique roles from the metadata
 */
export function extractRoles(metadata: Metadata): string[] {
  const roles = new Set<string>();
  const tables = getAllTables(metadata);

  tables.forEach((table) => {
    table.select_permissions?.forEach((perm) => roles.add(perm.role));
    table.insert_permissions?.forEach((perm) => roles.add(perm.role));
    table.update_permissions?.forEach((perm) => roles.add(perm.role));
    table.delete_permissions?.forEach((perm) => roles.add(perm.role));
  });

  return Array.from(roles).sort();
}

/**
 * Gets data source information from metadata
 */
export function getDataSources(metadata: Metadata) {
  return metadata.sources || [];
}

/**
 * Copies all permissions from source role to target role
 */
export function copyRolePermissions(
  metadata: Metadata,
  sourceRole: string,
  targetRole: string
): Metadata {
  const updatedMetadata = JSON.parse(JSON.stringify(metadata)) as Metadata; // Deep clone

  if (!updatedMetadata.sources) {
    return updatedMetadata;
  }

  updatedMetadata.sources.forEach((source) => {
    if (source.tables) {
      source.tables.forEach((table) => {
        // Copy select permissions
        if (table.select_permissions) {
          const sourceSelectPerm = table.select_permissions.find((p) => p.role === sourceRole);
          if (sourceSelectPerm) {
            const existingIndex = table.select_permissions.findIndex((p) => p.role === targetRole);
            const newPerm = {
              role: targetRole,
              permission: JSON.parse(JSON.stringify(sourceSelectPerm.permission)),
              comment: sourceSelectPerm.comment,
            };
            if (existingIndex >= 0) {
              table.select_permissions[existingIndex] = newPerm;
            } else {
              table.select_permissions.push(newPerm);
            }
          }
        }

        // Copy insert permissions
        if (table.insert_permissions) {
          const sourceInsertPerm = table.insert_permissions.find((p) => p.role === sourceRole);
          if (sourceInsertPerm) {
            const existingIndex = table.insert_permissions.findIndex((p) => p.role === targetRole);
            const newPerm = {
              role: targetRole,
              permission: JSON.parse(JSON.stringify(sourceInsertPerm.permission)),
              comment: sourceInsertPerm.comment,
            };
            if (existingIndex >= 0) {
              table.insert_permissions[existingIndex] = newPerm;
            } else {
              table.insert_permissions.push(newPerm);
            }
          }
        }

        // Copy update permissions
        if (table.update_permissions) {
          const sourceUpdatePerm = table.update_permissions.find((p) => p.role === sourceRole);
          if (sourceUpdatePerm) {
            const existingIndex = table.update_permissions.findIndex((p) => p.role === targetRole);
            const newPerm = {
              role: targetRole,
              permission: JSON.parse(JSON.stringify(sourceUpdatePerm.permission)),
              comment: sourceUpdatePerm.comment,
            };
            if (existingIndex >= 0) {
              table.update_permissions[existingIndex] = newPerm;
            } else {
              table.update_permissions.push(newPerm);
            }
          }
        }

        // Copy delete permissions
        if (table.delete_permissions) {
          const sourceDeletePerm = table.delete_permissions.find((p) => p.role === sourceRole);
          if (sourceDeletePerm) {
            const existingIndex = table.delete_permissions.findIndex((p) => p.role === targetRole);
            const newPerm = {
              role: targetRole,
              permission: JSON.parse(JSON.stringify(sourceDeletePerm.permission)),
              comment: sourceDeletePerm.comment,
            };
            if (existingIndex >= 0) {
              table.delete_permissions[existingIndex] = newPerm;
            } else {
              table.delete_permissions.push(newPerm);
            }
          }
        }
      });
    }
  });

  return updatedMetadata;
}

