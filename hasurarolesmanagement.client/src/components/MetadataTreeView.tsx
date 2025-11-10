import { useState, useMemo } from 'react';
import { type Metadata } from '../types/metadataSchemes';
import { getDataSources } from '../services/hasuraApi';
import type { JSX } from "react";
import './MetadataTreeView.css';

interface MetadataTreeViewProps {
  metadata: Metadata | null;
  selectedRole?: string | null;
  onRoleSelect?: (role: string) => void;
}

interface TreeNode {
  id: string;
  label: string;
  type: 'source' | 'table' | 'permission' | 'role';
  children?: TreeNode[];
  data?: any;
  expanded?: boolean;
}

export function MetadataTreeView({ metadata, selectedRole, onRoleSelect }: MetadataTreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const treeData = useMemo(() => {
    if (!metadata) return [];

    const sources = getDataSources(metadata);
    const nodes: TreeNode[] = [];

    sources.forEach((source) => {
      const sourceId = `source-${source.name}`;
      const sourceNode: TreeNode = {
        id: sourceId,
        label: source.name || 'Unnamed Source',
        type: 'source',
        data: source,
        children: [],
      };

      if (source.tables && source.tables.length > 0) {
        source.tables.forEach((table) => {
          const tableId = `${sourceId}-table-${table.table.schema}-${table.table.name}`;
          const tableNode: TreeNode = {
            id: tableId,
            label: `${table.table.schema}.${table.table.name}`,
            type: 'table',
            data: table,
            children: [],
          };

          // Add permissions
          const permissionTypes = [
            { key: 'select_permissions', label: 'Select', type: 'select' },
            { key: 'insert_permissions', label: 'Insert', type: 'insert' },
            { key: 'update_permissions', label: 'Update', type: 'update' },
            { key: 'delete_permissions', label: 'Delete', type: 'delete' },
          ];

          permissionTypes.forEach((permType) => {
            const permissions = table[permType.key as keyof typeof table] as any[];
            if (permissions && permissions.length > 0) {
              const permId = `${tableId}-${permType.type}`;
              const permNode: TreeNode = {
                id: permId,
                label: `${permType.label} (${permissions.length})`,
                type: 'permission',
                data: { type: permType.type, permissions },
                children: permissions.map((perm, idx) => ({
                  id: `${permId}-role-${perm.role}-${idx}`,
                  label: perm.role,
                  type: 'role',
                  data: perm,
                })),
              };
              tableNode.children!.push(permNode);
            }
          });

          if (tableNode.children!.length > 0) {
            sourceNode.children!.push(tableNode);
          }
        });
      }

      if (sourceNode.children!.length > 0) {
        nodes.push(sourceNode);
      }
    });

    return nodes;
  }, [metadata]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          allIds.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(treeData);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const renderNode = (node: TreeNode, level: number = 0): JSX.Element => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 20;

    const handleClick = () => {
      if (hasChildren) {
        toggleNode(node.id);
      } else if (node.type === 'role' && onRoleSelect) {
        onRoleSelect(node.label);
      }
    };

    const getIcon = () => {
      if (!hasChildren) {
        if (node.type === 'role') {
          return '👤';
        }
        return '•';
      }
      return isExpanded ? '📂' : '📁';
    };

    const getTypeClass = () => {
      switch (node.type) {
        case 'source':
          return 'tree-node-source';
        case 'table':
          return 'tree-node-table';
        case 'permission':
          return `tree-node-permission tree-node-permission-${node.data?.type || ''}`;
        case 'role':
          return selectedRole === node.label ? 'tree-node-role selected' : 'tree-node-role';
        default:
          return '';
      }
    };

    return (
      <div key={node.id} className="tree-node-wrapper">
        <div
          className={`tree-node ${getTypeClass()}`}
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={handleClick}
        >
          <span className="tree-node-icon">{getIcon()}</span>
          <span className="tree-node-label">{node.label}</span>
          {hasChildren && (
            <span className="tree-node-count">({node.children!.length})</span>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div className="tree-node-children">
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!metadata) {
    return (
      <div className="metadata-tree-container">
        <div className="empty-state">No metadata loaded</div>
      </div>
    );
  }

  if (treeData.length === 0) {
    return (
      <div className="metadata-tree-container">
        <div className="empty-state">No data sources found</div>
      </div>
    );
  }

  return (
    <div className="metadata-tree-container">
      <div className="tree-header">
        <h3>Metadata Structure</h3>
        <div className="tree-actions">
          <button onClick={expandAll} className="btn-tree-action" title="Expand all">
            Expand All
          </button>
          <button onClick={collapseAll} className="btn-tree-action" title="Collapse all">
            Collapse All
          </button>
        </div>
      </div>
      <div className="tree-content">
        {treeData.map((node) => renderNode(node))}
      </div>
    </div>
  );
}

