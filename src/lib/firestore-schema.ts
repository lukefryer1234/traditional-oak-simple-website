import { z } from 'zod';
import { UserRole } from './permissions';

/**
 * Firestore Schema Definitions
 * 
 * This file defines the schema for Firestore collections using Zod.
 * These schemas are used for type validation and documentation.
 */

// Base schema with common fields for all documents
export const baseDocumentSchema = z.object({
  id: z.string().optional(), // Document ID (added by the client)
  createdAt: z.date().or(z.string()).optional(), // Creation timestamp
  updatedAt: z.date().or(z.string()).optional(), // Last update timestamp
});

// User schema
export const userSchema = baseDocumentSchema.extend({
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.CUSTOMER),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  lastLogin: z.date().or(z.string()).optional(),
  phoneNumber: z.string().optional(),
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

export type FirestoreUser = z.infer<typeof userSchema>;

// Notification schema
export const notificationSchema = baseDocumentSchema.extend({
  userId: z.string(), // User ID this notification is for
  type: z.enum(['order', 'stock', 'user', 'system', 'payment']),
  title: z.string(),
  message: z.string(),
  read: z.boolean().default(false),
  link: z.string().optional(), // Optional link to navigate to
  metadata: z.record(z.any()).optional(),
});

export type FirestoreNotification = z.infer<typeof notificationSchema>;

// Activity log schema
export const activityLogSchema = baseDocumentSchema.extend({
  userId: z.string(), // User who performed the action
  userName: z.string().optional(),
  userEmail: z.string().email().optional(),
  userRole: z.nativeEnum(UserRole).optional(),
  activityType: z.enum([
    'login',
    'logout',
    'create',
    'update',
    'delete',
    'export',
    'import',
    'password_reset',
    'role_change',
    'settings_change',
    'view_sensitive'
  ]),
  entityType: z.enum([
    'user',
    'order',
    'product',
    'content',
    'settings',
    'system'
  ]),
  entityId: z.string().optional(),
  description: z.string(),
  ipAddress: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  severity: z.enum(['low', 'medium', 'high']).default('low'),
});

export type FirestoreActivityLog = z.infer<typeof activityLogSchema>;

// Order schema
export const orderSchema = baseDocumentSchema.extend({
  customerId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  total: z.number(),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number(),
    price: z.number(),
    subtotal: z.number(),
  })),
  shippingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  billingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  paymentMethod: z.string(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
  shippingMethod: z.string(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type FirestoreOrder = z.infer<typeof orderSchema>;

// Product schema
export const productSchema = baseDocumentSchema.extend({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  sku: z.string(),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().optional(),
  images: z.array(z.string()).optional(),
  thumbnailUrl: z.string().optional(),
  featured: z.boolean().default(false),
  attributes: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type FirestoreProduct = z.infer<typeof productSchema>;

// Analytics data schema
export const analyticsDataSchema = baseDocumentSchema.extend({
  date: z.date().or(z.string()),
  sales: z.number(),
  orders: z.number(),
  visitors: z.number(),
  pageViews: z.number(),
  conversionRate: z.number(),
  averageOrderValue: z.number(),
  topProducts: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    sales: z.number(),
    quantity: z.number(),
  })).optional(),
  topCategories: z.array(z.object({
    category: z.string(),
    sales: z.number(),
  })).optional(),
  customerAcquisition: z.object({
    organic: z.number(),
    paid: z.number(),
    direct: z.number(),
    referral: z.number(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

export type FirestoreAnalyticsData = z.infer<typeof analyticsDataSchema>;

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  NOTIFICATIONS: 'notifications',
  ACTIVITY_LOGS: 'activityLogs',
  ORDERS: 'orders',
  PRODUCTS: 'products',
  ANALYTICS: 'analytics',
};
