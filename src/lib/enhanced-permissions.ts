/**
 * Enhanced Permissions System for Oak Structures Admin Dashboard
 * 
 * This system provides:
 * - Role-based access control with granular permissions
 * - Permission groups for better organization
 * - Custom permissions for individual users
 * - IP-based access restrictions
 * - Time-based access restrictions
 */

import { UserRole, PermissionAction, AdminSection } from './permissions';

// Permission object
export interface Permission {
  section: AdminSection;
  action: PermissionAction;
}

// Permission key for efficient lookup
export type PermissionKey = `${AdminSection}:${PermissionAction}`;

// Permission group for organizing related permissions
export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

// Access restriction types
export enum AccessRestrictionType {
  IP_ALLOW = 'ip_allow',     // Allow only from these IPs
  IP_DENY = 'ip_deny',       // Deny from these IPs
  TIME_ALLOW = 'time_allow', // Allow only during these times
  TIME_DENY = 'time_deny',   // Deny during these times
  GEO_ALLOW = 'geo_allow',   // Allow only from these locations
  GEO_DENY = 'geo_deny',     // Deny from these locations
}

// Time restriction
export interface TimeRestriction {
  daysOfWeek: number[];      // 0-6, where 0 is Sunday
  startHour: number;         // 0-23
  startMinute: number;       // 0-59
  endHour: number;           // 0-23
  endMinute: number;         // 0-59
  timezone: string;          // e.g., 'Europe/London'
}

// IP restriction
export interface IpRestriction {
  ipAddresses: string[];     // List of IP addresses or CIDR ranges
}

// Geo restriction
export interface GeoRestriction {
  countries: string[];       // ISO country codes
  regions?: string[];        // Region/state codes
}

// Access restriction
export interface AccessRestriction {
  type: AccessRestrictionType;
  value: TimeRestriction | IpRestriction | GeoRestriction;
}

// User permission assignment
export interface UserPermissionAssignment {
  userId: string;
  email: string;
  role: UserRole;
  customPermissions: {
    granted: Permission[];
    denied: Permission[];
  };
  accessRestrictions: AccessRestriction[];
  expiresAt?: Date;          // Optional expiration date for temporary access
}

// Define permission groups
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Access to dashboard and analytics',
    permissions: [
      { section: AdminSection.DASHBOARD, action: PermissionAction.VIEW },
    ]
  },
  {
    id: 'orders',
    name: 'Orders',
    description: 'Manage customer orders',
    permissions: [
      { section: AdminSection.ORDERS, action: PermissionAction.VIEW },
      { section: AdminSection.ORDERS, action: PermissionAction.CREATE },
      { section: AdminSection.ORDERS, action: PermissionAction.EDIT },
      { section: AdminSection.ORDERS, action: PermissionAction.DELETE },
      { section: AdminSection.ORDERS, action: PermissionAction.APPROVE },
    ]
  },
  {
    id: 'products',
    name: 'Products',
    description: 'Manage product catalog',
    permissions: [
      { section: AdminSection.PRODUCTS, action: PermissionAction.VIEW },
      { section: AdminSection.PRODUCTS, action: PermissionAction.CREATE },
      { section: AdminSection.PRODUCTS, action: PermissionAction.EDIT },
      { section: AdminSection.PRODUCTS, action: PermissionAction.DELETE },
      { section: AdminSection.PRODUCTS_PRICES, action: PermissionAction.VIEW },
      { section: AdminSection.PRODUCTS_PRICES, action: PermissionAction.EDIT },
      { section: AdminSection.PRODUCTS_PHOTOS, action: PermissionAction.VIEW },
      { section: AdminSection.PRODUCTS_PHOTOS, action: PermissionAction.CREATE },
      { section: AdminSection.PRODUCTS_PHOTOS, action: PermissionAction.EDIT },
      { section: AdminSection.PRODUCTS_PHOTOS, action: PermissionAction.DELETE },
      { section: AdminSection.PRODUCTS_SPECIAL_DEALS, action: PermissionAction.VIEW },
      { section: AdminSection.PRODUCTS_SPECIAL_DEALS, action: PermissionAction.CREATE },
      { section: AdminSection.PRODUCTS_SPECIAL_DEALS, action: PermissionAction.EDIT },
      { section: AdminSection.PRODUCTS_SPECIAL_DEALS, action: PermissionAction.DELETE },
    ]
  },
  {
    id: 'content',
    name: 'Content',
    description: 'Manage website content',
    permissions: [
      { section: AdminSection.CONTENT, action: PermissionAction.VIEW },
      { section: AdminSection.CONTENT, action: PermissionAction.CREATE },
      { section: AdminSection.CONTENT, action: PermissionAction.EDIT },
      { section: AdminSection.CONTENT, action: PermissionAction.DELETE },
      { section: AdminSection.CONTENT_GALLERY, action: PermissionAction.VIEW },
      { section: AdminSection.CONTENT_GALLERY, action: PermissionAction.CREATE },
      { section: AdminSection.CONTENT_GALLERY, action: PermissionAction.EDIT },
      { section: AdminSection.CONTENT_GALLERY, action: PermissionAction.DELETE },
      { section: AdminSection.CONTENT_SEO, action: PermissionAction.VIEW },
      { section: AdminSection.CONTENT_SEO, action: PermissionAction.EDIT },
    ]
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Manage system settings',
    permissions: [
      { section: AdminSection.SETTINGS, action: PermissionAction.VIEW },
      { section: AdminSection.SETTINGS_COMPANY, action: PermissionAction.VIEW },
      { section: AdminSection.SETTINGS_COMPANY, action: PermissionAction.EDIT },
      { section: AdminSection.SETTINGS_FINANCIAL, action: PermissionAction.VIEW },
      { section: AdminSection.SETTINGS_FINANCIAL, action: PermissionAction.EDIT },
      { section: AdminSection.SETTINGS_DELIVERY, action: PermissionAction.VIEW },
      { section: AdminSection.SETTINGS_DELIVERY, action: PermissionAction.EDIT },
      { section: AdminSection.SETTINGS_PAYMENTS, action: PermissionAction.VIEW },
      { section: AdminSection.SETTINGS_PAYMENTS, action: PermissionAction.EDIT },
      { section: AdminSection.SETTINGS_ANALYTICS, action: PermissionAction.VIEW },
      { section: AdminSection.SETTINGS_ANALYTICS, action: PermissionAction.EDIT },
      { section: AdminSection.SETTINGS_NOTIFICATIONS, action: PermissionAction.VIEW },
      { section: AdminSection.SETTINGS_NOTIFICATIONS, action: PermissionAction.EDIT },
      { section: AdminSection.SETTINGS_ROLES, action: PermissionAction.VIEW },
      { section: AdminSection.SETTINGS_ROLES, action: PermissionAction.EDIT },
    ]
  },
  {
    id: 'users',
    name: 'Users',
    description: 'Manage user accounts',
    permissions: [
      { section: AdminSection.USERS, action: PermissionAction.VIEW },
      { section: AdminSection.USERS, action: PermissionAction.CREATE },
      { section: AdminSection.USERS, action: PermissionAction.EDIT },
      { section: AdminSection.USERS, action: PermissionAction.DELETE },
    ]
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Customer relationship management',
    permissions: [
      { section: AdminSection.CRM, action: PermissionAction.VIEW },
      { section: AdminSection.CRM, action: PermissionAction.CREATE },
      { section: AdminSection.CRM, action: PermissionAction.EDIT },
      { section: AdminSection.CRM, action: PermissionAction.DELETE },
      { section: AdminSection.CRM_LEADS, action: PermissionAction.VIEW },
      { section: AdminSection.CRM_LEADS, action: PermissionAction.CREATE },
      { section: AdminSection.CRM_LEADS, action: PermissionAction.EDIT },
      { section: AdminSection.CRM_LEADS, action: PermissionAction.DELETE },
    ]
  },
  {
    id: 'tools',
    name: 'Tools',
    description: 'Administrative tools',
    permissions: [
      { section: AdminSection.TOOLS, action: PermissionAction.VIEW },
      { section: AdminSection.TOOLS_EXPORTS, action: PermissionAction.VIEW },
      { section: AdminSection.TOOLS_EXPORTS, action: PermissionAction.CREATE },
    ]
  },
];

// Helper to create a permission key
export const createPermissionKey = (permission: Permission): PermissionKey => {
  return `${permission.section}:${permission.action}`;
};

// Get all permissions from permission groups
export const getAllPermissions = (): Permission[] => {
  const allPermissions: Permission[] = [];
  
  PERMISSION_GROUPS.forEach(group => {
    group.permissions.forEach(permission => {
      allPermissions.push(permission);
    });
  });
  
  return allPermissions;
};

// Get all permission keys
export const getAllPermissionKeys = (): PermissionKey[] => {
  return getAllPermissions().map(permission => createPermissionKey(permission));
};

// Check if a user has a specific permission
export const hasEnhancedPermission = (
  userAssignment: UserPermissionAssignment | null,
  section: AdminSection,
  action: PermissionAction,
  context: {
    ipAddress?: string;
    timestamp?: Date;
    geoLocation?: { country: string; region?: string };
  } = {}
): boolean => {
  // No assignment means no access
  if (!userAssignment) {
    return false;
  }
  
  // Check if permission has expired
  if (userAssignment.expiresAt && userAssignment.expiresAt < (context.timestamp || new Date())) {
    return false;
  }
  
  // Check access restrictions
  if (!checkAccessRestrictions(userAssignment.accessRestrictions, context)) {
    return false;
  }
  
  const permissionKey = createPermissionKey({ section, action });
  
  // Check if permission is explicitly denied
  const isDenied = userAssignment.customPermissions.denied.some(
    p => createPermissionKey(p) === permissionKey
  );
  
  if (isDenied) {
    return false;
  }
  
  // Check if permission is explicitly granted
  const isGranted = userAssignment.customPermissions.granted.some(
    p => createPermissionKey(p) === permissionKey
  );
  
  if (isGranted) {
    return true;
  }
  
  // Fall back to role-based permissions
  return hasRolePermission(userAssignment.role, section, action);
};

// Check if a role has a specific permission (imported from original permissions system)
export const hasRolePermission = (
  role: UserRole,
  section: AdminSection,
  action: PermissionAction
): boolean => {
  // Import the original permission check
  const { hasPermission } = require('./permissions');
  return hasPermission(role, section, action);
};

// Check access restrictions
export const checkAccessRestrictions = (
  restrictions: AccessRestriction[],
  context: {
    ipAddress?: string;
    timestamp?: Date;
    geoLocation?: { country: string; region?: string };
  }
): boolean => {
  // If no restrictions, access is allowed
  if (!restrictions || restrictions.length === 0) {
    return true;
  }
  
  // Check each restriction
  for (const restriction of restrictions) {
    switch (restriction.type) {
      case AccessRestrictionType.IP_ALLOW:
        if (!checkIpAllowRestriction(restriction.value as IpRestriction, context.ipAddress)) {
          return false;
        }
        break;
      case AccessRestrictionType.IP_DENY:
        if (checkIpDenyRestriction(restriction.value as IpRestriction, context.ipAddress)) {
          return false;
        }
        break;
      case AccessRestrictionType.TIME_ALLOW:
        if (!checkTimeAllowRestriction(restriction.value as TimeRestriction, context.timestamp)) {
          return false;
        }
        break;
      case AccessRestrictionType.TIME_DENY:
        if (checkTimeDenyRestriction(restriction.value as TimeRestriction, context.timestamp)) {
          return false;
        }
        break;
      case AccessRestrictionType.GEO_ALLOW:
        if (!checkGeoAllowRestriction(restriction.value as GeoRestriction, context.geoLocation)) {
          return false;
        }
        break;
      case AccessRestrictionType.GEO_DENY:
        if (checkGeoDenyRestriction(restriction.value as GeoRestriction, context.geoLocation)) {
          return false;
        }
        break;
    }
  }
  
  // All restrictions passed
  return true;
};

// Check IP allow restriction
export const checkIpAllowRestriction = (
  restriction: IpRestriction,
  ipAddress?: string
): boolean => {
  if (!ipAddress) {
    return false;
  }
  
  // Simple exact match for now
  // In a real implementation, this would use CIDR matching
  return restriction.ipAddresses.includes(ipAddress);
};

// Check IP deny restriction
export const checkIpDenyRestriction = (
  restriction: IpRestriction,
  ipAddress?: string
): boolean => {
  if (!ipAddress) {
    return false;
  }
  
  // Simple exact match for now
  return restriction.ipAddresses.includes(ipAddress);
};

// Check time allow restriction
export const checkTimeAllowRestriction = (
  restriction: TimeRestriction,
  timestamp?: Date
): boolean => {
  if (!timestamp) {
    timestamp = new Date();
  }
  
  const day = timestamp.getDay();
  const hour = timestamp.getHours();
  const minute = timestamp.getMinutes();
  
  // Check if current day is allowed
  if (!restriction.daysOfWeek.includes(day)) {
    return false;
  }
  
  // Convert current time to minutes since midnight
  const currentMinutes = hour * 60 + minute;
  
  // Convert restriction times to minutes since midnight
  const startMinutes = restriction.startHour * 60 + restriction.startMinute;
  const endMinutes = restriction.endHour * 60 + restriction.endMinute;
  
  // Check if current time is within allowed range
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

// Check time deny restriction
export const checkTimeDenyRestriction = (
  restriction: TimeRestriction,
  timestamp?: Date
): boolean => {
  if (!timestamp) {
    timestamp = new Date();
  }
  
  const day = timestamp.getDay();
  const hour = timestamp.getHours();
  const minute = timestamp.getMinutes();
  
  // Check if current day is denied
  if (!restriction.daysOfWeek.includes(day)) {
    return false;
  }
  
  // Convert current time to minutes since midnight
  const currentMinutes = hour * 60 + minute;
  
  // Convert restriction times to minutes since midnight
  const startMinutes = restriction.startHour * 60 + restriction.startMinute;
  const endMinutes = restriction.endHour * 60 + restriction.endMinute;
  
  // Check if current time is within denied range
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

// Check geo allow restriction
export const checkGeoAllowRestriction = (
  restriction: GeoRestriction,
  geoLocation?: { country: string; region?: string }
): boolean => {
  if (!geoLocation) {
    return false;
  }
  
  // Check country
  if (!restriction.countries.includes(geoLocation.country)) {
    return false;
  }
  
  // Check region if specified
  if (
    restriction.regions &&
    restriction.regions.length > 0 &&
    geoLocation.region &&
    !restriction.regions.includes(geoLocation.region)
  ) {
    return false;
  }
  
  return true;
};

// Check geo deny restriction
export const checkGeoDenyRestriction = (
  restriction: GeoRestriction,
  geoLocation?: { country: string; region?: string }
): boolean => {
  if (!geoLocation) {
    return false;
  }
  
  // Check country
  if (restriction.countries.includes(geoLocation.country)) {
    return true;
  }
  
  // Check region if specified
  if (
    restriction.regions &&
    restriction.regions.length > 0 &&
    geoLocation.region &&
    restriction.regions.includes(geoLocation.region)
  ) {
    return true;
  }
  
  return false;
};

// Get all permissions for a user
export const getUserPermissions = (
  userAssignment: UserPermissionAssignment
): Permission[] => {
  if (!userAssignment) {
    return [];
  }
  
  // Get role-based permissions
  const rolePermissions = getRolePermissions(userAssignment.role);
  
  // Add granted permissions
  const grantedPermissions = userAssignment.customPermissions.granted;
  
  // Remove denied permissions
  const deniedPermissionKeys = userAssignment.customPermissions.denied.map(
    p => createPermissionKey(p)
  );
  
  // Combine and deduplicate permissions
  const combinedPermissions = [...rolePermissions, ...grantedPermissions];
  const uniquePermissions = combinedPermissions.filter(
    p => !deniedPermissionKeys.includes(createPermissionKey(p))
  );
  
  // Remove duplicates
  const permissionKeys = new Set<string>();
  return uniquePermissions.filter(p => {
    const key = createPermissionKey(p);
    if (permissionKeys.has(key)) {
      return false;
    }
    permissionKeys.add(key);
    return true;
  });
};

// Get permissions for a role
export const getRolePermissions = (role: UserRole): Permission[] => {
  // For super admin, return all permissions
  if (role === UserRole.SUPER_ADMIN) {
    return getAllPermissions();
  }
  
  // Import the original role permissions
  const { ROLE_PERMISSIONS } = require('./permissions');
  return ROLE_PERMISSIONS[role] || [];
};

// Get permission groups a user has access to
export const getUserPermissionGroups = (
  userAssignment: UserPermissionAssignment
): PermissionGroup[] => {
  if (!userAssignment) {
    return [];
  }
  
  const userPermissions = getUserPermissions(userAssignment);
  const userPermissionKeys = userPermissions.map(p => createPermissionKey(p));
  
  // Filter groups where user has at least one permission
  return PERMISSION_GROUPS.filter(group => {
    return group.permissions.some(
      p => userPermissionKeys.includes(createPermissionKey(p))
    );
  });
};

// Create a default user permission assignment
export const createDefaultUserPermissionAssignment = (
  userId: string,
  email: string,
  role: UserRole = UserRole.CUSTOMER
): UserPermissionAssignment => {
  return {
    userId,
    email,
    role,
    customPermissions: {
      granted: [],
      denied: []
    },
    accessRestrictions: []
  };
};
