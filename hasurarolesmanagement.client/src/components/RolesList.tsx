import { useMemo } from 'react';
import { type Metadata } from '../types/metadataSchemes';
import { extractRoles, getDataSources, getAllTables } from '../services/hasuraApi';
import './RolesList.css';

interface RolesListProps {
  metadata: Metadata | null;
  selectedRole: string | null;
  onRoleSelect: (role: string) => void;
  onAddRoleClick: () => void;
  onRemoveRole: (role: string) => void;
}

export function RolesList({ metadata, selectedRole, onRoleSelect, onAddRoleClick, onRemoveRole }: RolesListProps) {
  const roles = useMemo(() => {
    if (!metadata) return [];
    return extractRoles(metadata);
  }, [metadata]);

  const dataSources = useMemo(() => {
    if (!metadata) return [];
    return getDataSources(metadata);
  }, [metadata]);

  const totalTables = useMemo(() => {
    if (!metadata) return 0;
    return getAllTables(metadata).length;
  }, [metadata]);

  if (!metadata) {
    return (
      <div className="roles-list-container">
        <div className="empty-state">No metadata loaded</div>
      </div>
    );
  }

  return (
    <div className="roles-list-container">
      <div className="roles-list-header">
        <h2>Roles</h2>
        <span className="role-count">{roles.length} role{roles.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="add-role-section">
        <button onClick={onAddRoleClick} className="btn-add-role">
          + Add New Role
        </button>
      </div>
      {metadata && dataSources.length > 0 && (
        <div className="data-sources-info">
          <div className="info-item">
            <strong>Data Sources:</strong> {dataSources.length}
          </div>
          <div className="info-item">
            <strong>Tables:</strong> {totalTables}
          </div>
          {dataSources.map((source) => (
            <div key={source.name || 'unknown'} className="data-source-item">
              <span className="source-name">{source.name || 'Unnamed'}</span>
              <span className="source-kind">({source.kind || 'unknown'})</span>
              {source.tables && (
                <span className="source-table-count">{source.tables.length} tables</span>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="roles-list">
        {roles.length === 0 ? (
          <div className="empty-state">No roles found in metadata</div>
        ) : (
          roles.map((role) => (
            <div
              key={role}
              className={`role-item ${selectedRole === role ? 'selected' : ''}`}
            >
              <span 
                className="role-name" 
                onClick={() => onRoleSelect(role)}
                style={{ flex: 1, cursor: 'pointer' }}
              >
                {role}
              </span>
              <button
                className="btn-delete-role"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to remove the role "${role}"? This will remove all permissions for this role.`)) {
                    onRemoveRole(role);
                  }
                }}
                title={`Remove role "${role}"`}
                aria-label={`Remove role ${role}`}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

