import { useState, useEffect } from 'react';
import { exportMetadata, replaceMetadata, copyRolePermissions, removeRole } from './services/hasuraApi';
import { type Metadata } from './types/metadataSchemes';
import { RolesList } from './components/RolesList';
import { RoleDetails } from './components/RoleDetails';
import { AddRoleModal } from './components/AddRoleModal';
import { MetadataTreeView } from './components/MetadataTreeView';
import './App.css';

function App() {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy JSON');

  const loadMetadata = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await exportMetadata();
      setMetadata(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metadata');
      console.error('Error loading metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!metadata) return;

    setSaving(true);
    setError(null);
    try {
      await replaceMetadata(metadata);
      alert('Metadata updated successfully!');
      // Reload to get the latest state
      await loadMetadata();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save metadata');
      console.error('Error saving metadata:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddRole = (newRoleName: string, copyFromRole: string | null) => {
    if (!metadata) return;

    let updatedMetadata = JSON.parse(JSON.stringify(metadata)) as Metadata; // Deep clone

    // If copying from an existing role, copy all permissions
    if (copyFromRole) {
      updatedMetadata = copyRolePermissions(updatedMetadata, copyFromRole, newRoleName);
    }

    setMetadata(updatedMetadata);
    setSelectedRole(newRoleName);
    setShowAddRoleModal(false);
  };

  const handleRemoveRole = (roleToRemove: string) => {
    if (!metadata) return;

    const updatedMetadata = removeRole(metadata, roleToRemove);
    setMetadata(updatedMetadata);

    // Clear selection if the removed role was selected
    if (selectedRole === roleToRemove) {
      setSelectedRole(null);
    }
  };

  const handleCopyMetadata = async () => {
    if (!metadata) return;
    
    try {
      const jsonString = JSON.stringify(metadata, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopyButtonText('Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy JSON');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title-section">
            <img 
              src="https://www.kafana.tech/wp-content/uploads/2021/05/KafanaEng-1.png" 
              alt="Logo" 
              className="header-logo"
            />
            <h1>Hasura Roles Management</h1>
          </div>
          <div className="header-actions">
            {metadata && (
              <button
                onClick={() => setShowMetadata(!showMetadata)}
                className="btn btn-secondary"
              >
                {showMetadata ? 'Hide' : 'View'} Raw JSON
              </button>
            )}
            <button
              onClick={loadMetadata}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={handleSaveMetadata}
              disabled={!metadata || saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      <main className="app-main">
        {loading && !metadata ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading metadata...</p>
          </div>
        ) : (
          <>
            <div className="content-grid">
              <RolesList
                metadata={metadata}
                selectedRole={selectedRole}
                onRoleSelect={setSelectedRole}
                onAddRoleClick={() => setShowAddRoleModal(true)}
                onRemoveRole={handleRemoveRole}
              />
              <MetadataTreeView
                metadata={metadata}
                selectedRole={selectedRole}
                onRoleSelect={setSelectedRole}
              />
              <RoleDetails metadata={metadata} role={selectedRole} />
            </div>
          </>
        )}
      </main>

      {metadata && showMetadata && (
        <div className="metadata-overlay" onClick={() => setShowMetadata(false)}>
          <div className="metadata-panel" onClick={(e) => e.stopPropagation()}>
            <div className="metadata-panel-header">
              <h2>Raw Metadata JSON</h2>
              <div className="metadata-header-actions">
                <button
                  onClick={handleCopyMetadata}
                  className={`btn-copy-json ${copyButtonText === 'Copied!' ? 'copied' : ''}`}
                  title="Copy JSON to clipboard"
                >
                  {copyButtonText}
                </button>
                <button
                  onClick={() => setShowMetadata(false)}
                  className="metadata-close-btn"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="metadata-panel-content">
              <div className="metadata-json-wrapper">
                <div className="metadata-line-numbers">
                  {JSON.stringify(metadata, null, 2)
                    .split('\n')
                    .map((_, index) => (
                      <div key={index} className="line-number">
                        {index + 1}
                      </div>
                    ))}
                </div>
                <pre className="metadata-json">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddRoleModal
        metadata={metadata}
        isOpen={showAddRoleModal}
        onClose={() => setShowAddRoleModal(false)}
        onAddRole={handleAddRole}
      />
    </div>
  );
}

export default App;
