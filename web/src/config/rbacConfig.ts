export const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
  STAFF: 'staff',
  OPERATOR: 'operator',
} as const

export const permissions = {
  VIEW_DASHBOARD: 'view_dashboard',
  EDIT_PROFILE: 'edit_profile',
  VIEW_AUDITS: 'view_audits',
  CHANGE_PASSWORD: 'change_password',
  VIEW_SESSION: 'view_session',
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_BUSES: 'manage_buses',
  MANAGE_ROUTES: 'manage_routes',
  MANAGE_BOOKINGS: 'manage_bookings',
  VIEW_BOOKINGS: 'view_bookings',
  CREATE_BOOKING: 'create_booking',
  // Staff permissions
  READ_ASSIGNED_TRIPS: 'read_assigned_trips',
  MANAGE_TRIP_STATUS: 'manage_trip_status',
  MANAGE_PASSENGER_BOARDING: 'manage_passenger_boarding',
  VIEW_BUSES: 'view_buses',
  VIEW_ROUTES: 'view_routes',
} as const

export const rolePermissions: Record<string, string[]> = {
  [USER_ROLES.ADMIN]: [
    permissions.VIEW_DASHBOARD,
    permissions.EDIT_PROFILE,
    permissions.VIEW_AUDITS,
    permissions.CHANGE_PASSWORD,
    permissions.VIEW_SESSION,
    permissions.MANAGE_USERS,
    permissions.VIEW_ANALYTICS,
    permissions.MANAGE_SETTINGS,
    permissions.MANAGE_BUSES,
    permissions.MANAGE_ROUTES,
    permissions.MANAGE_BOOKINGS,
    permissions.VIEW_BOOKINGS,
  ],
  [USER_ROLES.CLIENT]: [
    permissions.VIEW_DASHBOARD,
    permissions.EDIT_PROFILE,
    permissions.CHANGE_PASSWORD,
    permissions.CREATE_BOOKING,
    permissions.VIEW_BOOKINGS,
  ],
  [USER_ROLES.STAFF]: [
    permissions.VIEW_DASHBOARD,
    permissions.EDIT_PROFILE,
    permissions.CHANGE_PASSWORD,
    permissions.READ_ASSIGNED_TRIPS,
    permissions.MANAGE_TRIP_STATUS,
    permissions.MANAGE_PASSENGER_BOARDING,
    permissions.VIEW_BUSES,
    permissions.VIEW_ROUTES,
  ],
  [USER_ROLES.OPERATOR]: [
    permissions.VIEW_DASHBOARD,
    permissions.EDIT_PROFILE,
    permissions.CHANGE_PASSWORD,
    permissions.VIEW_ANALYTICS,
    permissions.MANAGE_BUSES,
    permissions.MANAGE_ROUTES,
    permissions.VIEW_BOOKINGS,
  ],
}

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]
export type Permission = (typeof permissions)[keyof typeof permissions]
