/**
 * Role-Based Access Control (RBAC)
 * Defines permissions for different user roles
 */

export type Role = 'patient' | 'doctor' | 'admin'

export type Permission =
  | 'view_own_data'
  | 'view_all_data'
  | 'create_analysis'
  | 'manage_users'
  | 'manage_agents'
  | 'view_analytics'
  | 'upload_documents'
  | 'chat_with_agents'

export const rolePermissions: Record<Role, Permission[]> = {
  patient: [
    'view_own_data',
    'create_analysis',
    'upload_documents',
    'chat_with_agents',
  ],
  doctor: [
    'view_own_data',
    'view_all_data', // Can view patient data (with consent)
    'create_analysis',
    'upload_documents',
    'chat_with_agents',
  ],
  admin: [
    'view_own_data',
    'view_all_data',
    'create_analysis',
    'manage_users',
    'manage_agents',
    'view_analytics',
    'upload_documents',
    'chat_with_agents',
  ],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

/**
 * Check if user can access resource owned by another user
 */
export function canAccessUserData(userRole: Role, userId: string, targetUserId: string): boolean {
  // User can always access their own data
  if (userId === targetUserId) {
    return true
  }

  // Doctors and admins can access other users' data
  return userRole === 'doctor' || userRole === 'admin'
}

/**
 * Get user's role from session
 */
export function getUserRole(session: any): Role {
  return (session?.user?.role as Role) ?? 'patient'
}
