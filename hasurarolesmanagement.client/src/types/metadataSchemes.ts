export interface Metadata {
  version: number;
  sources: DataSource[] | null;
  actions: any | null;
  custom_types: any | null;
  [key: string]: any; // Allow for other metadata properties
}

export interface DataSource {
  name: string | null;
  kind: string | null;
  tables: Table[] | null;
  configuration: any;
}

export interface Table {
  table: TableScheme;
  select_permissions?: PermissionsEntry[];
  update_permissions?: PermissionsEntry[];
  insert_permissions?: PermissionsEntry[];
  delete_permissions?: PermissionsEntry[];
  configuration?: any;
  is_enum?: boolean;
}

export interface TableScheme {
  name: string;
  schema: string; // Fixed typo: was "scheme"
}

export interface PermissionsEntry {
  role: string;
  permission: Permissions;
  comment?: any;
}

export interface Permissions {
  columns: string[];
  filter?: any;
  check?: any;
  set?: any;
  allow_aggregations?: boolean;
  limit?: number;
  query_root_fields?: string[];
  subscription_root_fields?: string[];
  backend_only?: boolean;
}

