# Hasura Metadata Structure Guide

## Overview

The Hasura metadata JSON can be very complex and large. This guide provides strategies for working with it effectively when building a roles management interface.

## Understanding the Metadata Structure

The Hasura metadata typically contains:

1. **Tables** - Database tables with their permissions
2. **Actions** - Custom GraphQL actions
3. **Remote Schemas** - Remote GraphQL schemas
4. **Functions** - Database functions
5. **Query Collections** - Saved query collections
6. **Cron Triggers** - Scheduled tasks
7. **Allowlist** - Allowed queries

For roles management, the most important part is the **tables** array, which contains permission definitions.

## Strategies for Handling Complex Metadata

### 1. **Incremental Development Approach**

Instead of trying to handle all metadata at once, build the interface incrementally:

**Phase 1: Basic Role Viewing** ✅ (Current Implementation)
- Extract and display all roles
- Show basic permission information (select, insert, update, delete)
- Display table names and columns

**Phase 2: Enhanced Permission Details**
- Add filter condition visualization
- Show computed fields
- Display aggregation permissions
- Add permission templates/presets

**Phase 3: Permission Editing**
- Create forms for editing permissions
- Add validation for permission rules
- Implement permission cloning/copying
- Add bulk operations

**Phase 4: Advanced Features**
- Permission diff/comparison
- Role templates
- Permission inheritance
- Audit logging

### 2. **Sample Metadata Structure**

To help me understand your specific metadata structure, you can:

**Option A: Share a Sample Export**
```bash
# Export your metadata and share a sanitized version
# Remove sensitive data but keep the structure
```

**Option B: Describe Key Sections**
Tell me about:
- How many tables you have
- What permission types you use most (select, insert, update, delete)
- If you use computed fields
- If you have custom actions
- Any special permission patterns

**Option C: Share Specific Examples**
Provide 2-3 example permission objects from your metadata:
```json
{
  "role": "user",
  "permission": {
    "columns": ["id", "name", "email"],
    "filter": { "user_id": { "_eq": "X-Hasura-User-Id" } }
  }
}
```

### 3. **Current Implementation Features**

The current UI provides:

- ✅ **Role List**: Displays all roles extracted from metadata
- ✅ **Role Details**: Shows permissions grouped by schema
- ✅ **Permission Types**: Visual badges for select/insert/update/delete
- ✅ **Table Information**: Shows table names and columns
- ✅ **Filter Display**: Shows filter conditions (as JSON for now)
- ✅ **Raw Metadata View**: Collapsible section to view full JSON

### 4. **Next Steps for Enhancement**

Based on your needs, I can add:

1. **Better Filter Visualization**
   - Parse and display filter conditions in a user-friendly format
   - Show filter builders/editors
   - Visual condition trees

2. **Permission Editing Forms**
   - Form-based editors for each permission type
   - Column selection checkboxes
   - Filter condition builders
   - Validation and preview

3. **Search and Filtering**
   - Search roles by name
   - Filter permissions by type
   - Search tables by name

4. **Bulk Operations**
   - Copy permissions between roles
   - Apply permissions to multiple tables
   - Export/import role configurations

5. **Comparison Tools**
   - Compare permissions between roles
   - Show permission differences
   - Highlight changes before saving

## How to Proceed

**To help me build a more complete interface, please:**

1. **Share a sample metadata export** (sanitized) - This helps me understand your exact structure
2. **Describe your workflow** - How do you typically manage roles? What operations do you perform most?
3. **Specify priorities** - What features are most important to you?

## Example: Sharing Metadata Structure

You can share metadata in these ways:

1. **Full Export** (sanitized):
   ```json
   {
     "version": 3,
     "tables": [
       {
         "table": { "schema": "public", "name": "users" },
         "select_permissions": [...]
       }
     ]
   }
   ```

2. **Specific Examples**:
   - Show 1-2 complete permission objects
   - Describe any custom fields or structures

3. **Screenshots**:
   - Screenshots of Hasura console showing your permission structure
   - This helps me understand the visual layout you want

## Current API Endpoint

The app is configured to use:
- **Endpoint**: `https://hasura-test.mstart.local/v1/metadataa`
- **Export**: `POST` with `{"type": "export_metadata", "args": {}}`
- **Replace**: `POST` with `{"type": "replace_metadata", "args": { ...metadata }}`

Note: If the endpoint should be `metadata` instead of `metadataa`, let me know and I'll update it.

