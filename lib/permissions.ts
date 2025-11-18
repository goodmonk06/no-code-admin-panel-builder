import type { UserRole, PermissionsConfig } from './types'

export function hasPermission(
  userRole: UserRole,
  permissions: PermissionsConfig,
  action: 'read' | 'create' | 'update' | 'delete'
): boolean {
  return permissions[userRole][action]
}

export function canAccessEntity(
  userRole: UserRole,
  permissions: PermissionsConfig
): boolean {
  // User can access entity if they have at least read permission
  return permissions[userRole].read
}

export function filterEditableFields(
  fields: any[],
  userRole: UserRole,
  permissions: PermissionsConfig,
  isCreating: boolean
): any[] {
  const action = isCreating ? 'create' : 'update'

  if (!hasPermission(userRole, permissions, action)) {
    return []
  }

  return fields.filter(field => field.editable)
}

// Mock function to get current user role
// In a real app, this would check JWT token, session, etc.
export function getCurrentUserRole(): UserRole {
  // For now, default to admin
  // In production, implement proper authentication
  return 'admin'
}

export const DEFAULT_PERMISSIONS: PermissionsConfig = {
  admin: {
    read: true,
    create: true,
    update: true,
    delete: true,
  },
  editor: {
    read: true,
    create: true,
    update: true,
    delete: false,
  },
  viewer: {
    read: true,
    create: false,
    update: false,
    delete: false,
  },
}
