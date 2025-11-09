import { useMemo } from 'react';
import { type Metadata } from '../types/metadataSchemes';
import { getAllTables } from '../services/hasuraApi';
import './RoleDetails.css';

interface RoleDetailsProps {
  metadata: Metadata | null;
  role: string | null;
}

export function RoleDetails({ metadata, role }: RoleDetailsProps) {
  const rolePermissions = useMemo(() => {
    if (!metadata || !role) return [];

    const tables = getAllTables(metadata);
    if (tables.length === 0) return [];

    return tables
      .map((table) => {
        const permissions: Array<{
          type: 'select' | 'insert' | 'update' | 'delete';
          table: string;
          schema: string;
          permission: any;
        }> = [];

        const tableName = `${table.table.schema}.${table.table.name}`;

        table.select_permissions?.forEach((perm) => {
          if (perm.role === role) {
            permissions.push({
              type: 'select',
              table: tableName,
              schema: table.table.schema,
              permission: perm.permission,
            });
          }
        });

        table.insert_permissions?.forEach((perm) => {
          if (perm.role === role) {
            permissions.push({
              type: 'insert',
              table: tableName,
              schema: table.table.schema,
              permission: perm.permission,
            });
          }
        });

        table.update_permissions?.forEach((perm) => {
          if (perm.role === role) {
            permissions.push({
              type: 'update',
              table: tableName,
              schema: table.table.schema,
              permission: perm.permission,
            });
          }
        });

        table.delete_permissions?.forEach((perm) => {
          if (perm.role === role) {
            permissions.push({
              type: 'delete',
              table: tableName,
              schema: table.table.schema,
              permission: perm.permission,
            });
          }
        });

        return permissions;
      })
      .flat()
      .sort((a, b) => {
        if (a.schema !== b.schema) return a.schema.localeCompare(b.schema);
        return a.table.localeCompare(b.table);
      });
  }, [metadata, role]);

  if (!role) {
    return (
      <div className="role-details-container">
        <div className="empty-state">
          <p>Select a role to view its permissions</p>
        </div>
      </div>
    );
  }

  if (rolePermissions.length === 0) {
    return (
      <div className="role-details-container">
        <div className="role-details-header">
          <h2>Role: {role}</h2>
        </div>
        <div className="empty-state">
          <p>No permissions found for this role</p>
        </div>
      </div>
    );
  }

  // Group permissions by schema
  const permissionsBySchema = rolePermissions.reduce((acc, perm) => {
    if (!acc[perm.schema]) {
      acc[perm.schema] = [];
    }
    acc[perm.schema].push(perm);
    return acc;
  }, {} as Record<string, typeof rolePermissions>);

  return (
    <div className="role-details-container">
      <div className="role-details-header">
        <h2>Role: {role}</h2>
        <span className="permission-count">
          {rolePermissions.length} permission{rolePermissions.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="permissions-list">
        {Object.entries(permissionsBySchema).map(([schema, permissions]) => (
          <div key={schema} className="schema-group">
            <h3 className="schema-name">{schema}</h3>
            {permissions.map((perm, idx) => (
              <div key={`${perm.table}-${perm.type}-${idx}`} className="permission-item">
                <div className="permission-header">
                  <span className="table-name">{perm.table}</span>
                  <span className={`permission-badge permission-${perm.type}`}>
                    {perm.type.toUpperCase()}
                  </span>
                </div>
                <div className="permission-details">
                  {perm.type === 'select' && (
                    <div className="permission-info">
                      <strong>Columns:</strong>{' '}
                      {perm.permission.columns?.length > 0
                        ? perm.permission.columns.join(', ')
                        : 'All'}
                      {perm.permission.filter && (
                        <div className="filter-info">
                          <strong>Filter:</strong>{' '}
                          <code>{JSON.stringify(perm.permission.filter, null, 2)}</code>
                        </div>
                      )}
                    </div>
                  )}
                  {perm.type === 'insert' && (
                    <div className="permission-info">
                      <strong>Columns:</strong>{' '}
                      {perm.permission.columns?.length > 0
                        ? perm.permission.columns.join(', ')
                        : 'All'}
                      {perm.permission.set && (
                        <div className="set-info">
                          <strong>Set:</strong>{' '}
                          <code>{JSON.stringify(perm.permission.set, null, 2)}</code>
                        </div>
                      )}
                    </div>
                  )}
                  {perm.type === 'update' && (
                    <div className="permission-info">
                      <strong>Columns:</strong>{' '}
                      {perm.permission.columns?.length > 0
                        ? perm.permission.columns.join(', ')
                        : 'All'}
                      {perm.permission.filter && (
                        <div className="filter-info">
                          <strong>Filter:</strong>{' '}
                          <code>{JSON.stringify(perm.permission.filter, null, 2)}</code>
                        </div>
                      )}
                    </div>
                  )}
                  {perm.type === 'delete' && (
                    <div className="permission-info">
                      {perm.permission.filter && (
                        <div className="filter-info">
                          <strong>Filter:</strong>{' '}
                          <code>{JSON.stringify(perm.permission.filter, null, 2)}</code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

