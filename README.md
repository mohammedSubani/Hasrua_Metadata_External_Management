# Hasura Roles Management

Small utilities and a React-based UI to inspect, copy and modify Hasura role permissions.

---

## Repo layout (important files)

- Root scripts & docs
  - [docker-compose.yml](docker-compose.yml)
  - [docker-run.sh](docker-run.sh)
  - [docker-run.bat](docker-run.bat)
  - [docker-build-linux.ps1](docker-build-linux.ps1)
  - [docker-compose-linux.ps1](docker-compose-linux.ps1)
  - [check-docker-mode.ps1](check-docker-mode.ps1)
  - [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md)
  - [README.Docker.md](README.Docker.md)

- Client SPA (React + Vite)
  - Project root: [hasurarolesmanagement.client/](hasurarolesmanagement.client/)
  - Dev/build config: [hasurarolesmanagement.client/vite.config.ts](hasurarolesmanagement.client/vite.config.ts)
  - Dockerfile: [hasurarolesmanagement.client/Dockerfile](hasurarolesmanagement.client/Dockerfile)
  - README: [hasurarolesmanagement.client/README.md](hasurarolesmanagement.client/README.md)
  - Metadata guide: [hasurarolesmanagement.client/METADATA_STRUCTURE_GUIDE.md](hasurarolesmanagement.client/METADATA_STRUCTURE_GUIDE.md)

- Server (optional)
  - Solution file: [HasuraRolesManagement.sln](HasuraRolesManagement.sln)
  - Server project: [HasuraRolesManagement.Server/](HasuraRolesManagement.Server/)
  - Example controller: [HasuraRolesManagement.Server/Controllers/WeatherForecastController.cs](HasuraRolesManagement.Server/Controllers/WeatherForecastController.cs)

---

## What this app does

- Extracts roles from Hasura metadata and displays them in a sidebar ([hasurarolesmanagement.client/src/components/RolesList.tsx](hasurarolesmanagement.client/src/components/RolesList.tsx)).
- Shows permissions grouped by schema for a selected role ([hasurarolesmanagement.client/src/components/RoleDetails.tsx](hasurarolesmanagement.client/src/components/RoleDetails.tsx)).
- Inspect metadata as a tree view ([hasurarolesmanagement.client/src/components/MetadataTreeView.tsx](hasurarolesmanagement.client/src/components/MetadataTreeView.tsx)).
- Add a role (optionally copy permissions from an existing role) via the modal ([hasurarolesmanagement.client/src/components/AddRoleModal.tsx](hasurarolesmanagement.client/src/components/AddRoleModal.tsx)).
- Apply changes back to Hasura with the replace metadata endpoint.

Key client-side service functions:
- [`exportMetadata`](hasurarolesmanagement.client/src/services/hasuraApi.ts) — fetch current metadata from Hasura.
- [`replaceMetadata`](hasurarolesmanagement.client/src/services/hasuraApi.ts) — send updated metadata to Hasura.
- [`deserializeMetadata`](hasurarolesmanagement.client/src/services/hasuraApi.ts) — normalize older/new metadata formats.
- [`getAllTables`](hasurarolesmanagement.client/src/services/hasuraApi.ts) — collect tables from metadata.
- [`extractRoles`](hasurarolesmanagement.client/src/services/hasuraApi.ts) — extract all roles.
- [`copyRolePermissions`](hasurarolesmanagement.client/src/services/hasuraApi.ts) — clone permissions from one role to another.
- [`removeRole`](hasurarolesmanagement.client/src/services/hasuraApi.ts) — remove all permissions belonging to a role.

Open the implementations:
- [hasurarolesmanagement.client/src/services/hasuraApi.ts](hasurarolesmanagement.client/src/services/hasuraApi.ts)
- [hasurarolesmanagement.client/src/components/AddRoleModal.tsx](hasurarolesmanagement.client/src/components/AddRoleModal.tsx)
- [hasurarolesmanagement.client/src/components/RoleDetails.tsx](hasurarolesmanagement.client/src/components/RoleDetails.tsx)
- [hasurarolesmanagement.client/src/components/RolesList.tsx](hasurarolesmanagement.client/src/components/RolesList.tsx)
- [hasurarolesmanagement.client/src/components/MetadataTreeView.tsx](hasurarolesmanagement.client/src/components/MetadataTreeView.tsx)

---

## Quick start — Docker (recommended)

1. Create a `.env` in project root (or edit defaults in [README.Docker.md](README.Docker.md)):
   ```
   HASURA_ENDPOINT=https://your-hasura.example.com/v1/metadata
   HASURA_ADMIN_SECRET=youradminsecret
   ```

2. Build & start (recommended):
   ```sh
   docker compose up --build -d
   ```

3. Helpful scripts:
   - Linux/macOS: `./docker-run.sh`
   - Windows: `docker-run.bat`
   - Buildx helper (Windows PowerShell): `.\docker-build-linux.ps1`
   - Check Docker mode: `.\check-docker-mode.ps1`

See troubleshooting: [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md) and [README.Docker.md](README.Docker.md).

---

## Local development (client)

1. Open client folder:
   ```
   cd hasurarolesmanagement.client
   npm install
   npm run dev
   ```
2. Env vars used by client build/dev:
   - `VITE_HASURA_ENDPOINT`
   - `VITE_HASURA_ADMIN_SECRET`
3. Vite config: [hasurarolesmanagement.client/vite.config.ts](hasurarolesmanagement.client/vite.config.ts)

---

## Common workflows

- Load metadata: application calls [`exportMetadata`](hasurarolesmanagement.client/src/services/hasuraApi.ts) on startup.
- Add role: UI calls into the Add Role modal ([hasurarolesmanagement.client/src/components/AddRoleModal.tsx](hasurarolesmanagement.client/src/components/AddRoleModal.tsx)), which uses [`copyRolePermissions`](hasurarolesmanagement.client/src/services/hasuraApi.ts) if requested.
- Remove role: Roles list uses [`removeRole`](hasurarolesmanagement.client/src/services/hasuraApi.ts) to strip permissions.
- Save changes: call [`replaceMetadata`](hasurarolesmanagement.client/src/services/hasuraApi.ts) from the app ([hasurarolesmanagement.client/src/App.tsx](hasurarolesmanagement.client/src/App.tsx)).

---

## Files to inspect for customization

- UI components and styles:
  - [hasurarolesmanagement.client/src/components/RoleDetails.tsx](hasurarolesmanagement.client/src/components/RoleDetails.tsx)
  - [hasurarolesmanagement.client/src/components/RoleDetails.css](hasurarolesmanagement.client/src/components/RoleDetails.css)
  - [hasurarolesmanagement.client/src/components/RolesList.tsx](hasurarolesmanagement.client/src/components/RolesList.tsx)
  - [hasurarolesmanagement.client/src/components/RolesList.css](hasurarolesmanagement.client/src/components/RolesList.css)
  - [hasurarolesmanagement.client/src/components/AddRoleModal.tsx](hasurarolesmanagement.client/src/components/AddRoleModal.tsx)
  - [hasurarolesmanagement.client/src/components/AddRoleModal.css](hasurarolesmanagement.client/src/components/AddRoleModal.css)
  - [hasurarolesmanagement.client/src/components/MetadataTreeView.tsx](hasurarolesmanagement.client/src/components/MetadataTreeView.tsx)
  - [hasurarolesmanagement.client/src/components/MetadataTreeView.css](hasurarolesmanagement.client/src/components/MetadataTreeView.css)
  - Global styles: [hasurarolesmanagement.client/src/App.css](hasurarolesmanagement.client/src/App.css)

- Server (optional)
  - [HasuraRolesManagement.Server/Program.cs](HasuraRolesManagement.Server/Program.cs)
  - [HasuraRolesManagement.Server/Dockerfile](HasuraRolesManagement.Server/Dockerfile)

---

## Troubleshooting tips

- "no matching manifest for windows/amd64": switch Docker Desktop to Linux container mode — see [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md) and scripts [check-docker-mode.ps1](check-docker-mode.ps1), [docker-build-linux.ps1](docker-build-linux.ps1).
- Port conflicts: update port mappings in [docker-compose.yml](docker-compose.yml) or [README.Docker.md](README.Docker.md).
- CORS or endpoint issues: ensure `HASURA_ENDPOINT` and `VITE_HASURA_ENDPOINT` are correct and Hasura is configured to accept your origin.

---

## Next steps / Contributions

See enhancements in the metadata guide: [hasurarolesmanagement.client/METADATA_STRUCTURE_GUIDE.md](hasurarolesmanagement.client/METADATA_STRUCTURE_GUIDE.md) — suggestions include better filter visualization, permission editors, bulk operations and comparison tools.

---

If you want, I can:
- Merge this README into the repo (create/update README.MD)
- Or produce a smaller README focused only on Docker or only on the client.
