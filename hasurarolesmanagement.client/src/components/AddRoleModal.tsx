import { useState } from 'react';
import { type Metadata } from '../types/metadataSchemes';
import { extractRoles } from '../services/hasuraApi';
import './AddRoleModal.css';

interface AddRoleModalProps {
  metadata: Metadata | null;
  isOpen: boolean;
  onClose: () => void;
  onAddRole: (newRoleName: string, copyFromRole: string | null) => void;
}

export function AddRoleModal({ metadata, isOpen, onClose, onAddRole }: AddRoleModalProps) {
  const [newRoleName, setNewRoleName] = useState('');
  const [copyFromRole, setCopyFromRole] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const existingRoles = metadata ? extractRoles(metadata) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newRoleName.trim()) {
      setError('Role name is required');
      return;
    }

    if (existingRoles.includes(newRoleName.trim())) {
      setError('Role already exists');
      return;
    }

    onAddRole(newRoleName.trim(), copyFromRole || null);
    setNewRoleName('');
    setCopyFromRole('');
    setError(null);
  };

  const handleClose = () => {
    setNewRoleName('');
    setCopyFromRole('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add-role-overlay" onClick={handleClose}>
      <div className="add-role-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-role-header">
          <h2>Add New Role</h2>
          <button onClick={handleClose} className="modal-close-btn" aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="add-role-form">
          <div className="form-group">
            <label htmlFor="roleName">Role Name</label>
            <input
              id="roleName"
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Enter role name"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="copyFrom">Copy Permissions From (Optional)</label>
            <select
              id="copyFrom"
              value={copyFromRole}
              onChange={(e) => setCopyFromRole(e.target.value)}
            >
              <option value="">-- None (Create Empty Role) --</option>
              {existingRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {copyFromRole && (
              <p className="form-hint">
                All permissions from "{copyFromRole}" will be copied to the new role
              </p>
            )}
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={handleClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

