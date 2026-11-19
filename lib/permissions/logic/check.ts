export type PermissionCatalog = Readonly<Record<string, readonly string[]>>;

export function can(
  viewer: { roleName: string | null },
  key: string,
  catalog: PermissionCatalog,
): boolean {
  if (!viewer.roleName) return false;
  return catalog[viewer.roleName]?.includes(key) ?? false;
}
