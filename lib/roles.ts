export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  USER: "user",
} as const;

export type Role = keyof typeof ROLES;

export const PERMISSIONS = {
  // Dashboard
  viewDashboard: [ROLES.SUPERADMIN, ROLES.ADMIN],

  // Support
  viewSupport: [ROLES.SUPERADMIN, ROLES.ADMIN],

  // Admin-only
  manageUsers: [ROLES.SUPERADMIN],
  manageSettings: [ROLES.SUPERADMIN],
} as const;

export type Permission = keyof typeof PERMISSIONS;