// src/services/domain/user-service.ts

import { z } from "zod";
import { FirestoreService } from "../firebase/firestore-service";
import { CustomError, handleError } from "@/lib/error-utils";
import { QueryConstraint } from "firebase/firestore";

// Schema definitions
export const UserRoleSchema = z.enum([
  "USER",
  "ADMIN",
  "EDITOR",
  "Customer",
  "Manager",
  "SuperAdmin"
]);

export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  uid: z.string().optional(), // UID from Firebase Auth, may be same as id
  email: z.string().email(),
  displayName: z.string().nullish(),
  photoURL: z.string().url().nullish(),
  role: UserRoleSchema.default("USER"),
  lastLogin: z.string().optional(), // ISO date string
  orderCount: z.number().int().optional(),
  avatarUrl: z.string().url().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  disabled: z.boolean().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Input schemas for update operations
export const UpdateUserInputSchema = UserSchema.partial().omit({
  id: true,
  uid: true,
  createdAt: true,
  updatedAt: true,
  email: true // Email shouldn't be updated here
});

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;

// Get Users Params
export const GetUsersParamsSchema = z.object({
  role: UserRoleSchema.optional(),
  limit: z.number().int().positive().optional(),
  startAfter: z.string().optional(),
  disabled: z.boolean().optional(),
  searchQuery: z.string().optional(),
});

export type GetUsersParams = z.infer<typeof GetUsersParamsSchema>;

/**
 * Domain service for user operations
 */
class UserService {
  private readonly collectionName = "users";

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<User | null> {
    try {
      const userData = await FirestoreService.getDocument(
        this.collectionName,
        id
      );

      if (!userData) {
        return null;
      }

      // Validate the data against our schema
      const user = UserSchema.parse({
        id,
        ...userData,
      });

      return user;
    } catch (error) {
      throw handleError(
        error,
        "Failed to retrieve user",
        "UserService.getUser"
      );
    }
  }

  /**
   * Get users with optional filtering
   */
  async getUsers(params: GetUsersParams = {}): Promise<{
    users: User[];
    lastDoc: any | null;
  }> {
    try {
      // Validate params
      const validParams = GetUsersParamsSchema.parse(params);
      
      // Build query constraints
      const constraints: QueryConstraint[] = [];
      
      if (validParams.role) {
        constraints.push(FirestoreService.constraints.where("role", "==", validParams.role));
      }
      
      if (validParams.disabled !== undefined) {
        constraints.push(FirestoreService.constraints.where("disabled", "==", validParams.disabled));
      }
      
      // Always sort by creation date, descending
      constraints.push(FirestoreService.constraints.orderBy("createdAt", "desc"));

      // Execute the query
      const result = await FirestoreService.getPaginatedCollection(
        this.collectionName,
        validParams.limit || 50,
        constraints
      );

      // Map and validate documents
      const users: User[] = [];
      
      for (const doc of result.data) {
        try {
          // If searchQuery is provided, filter by displayName or email
          if (validParams.searchQuery) {
            const query = validParams.searchQuery.toLowerCase();
            const email = doc.email?.toLowerCase() || '';
            const name = doc.displayName?.toLowerCase() || '';
            
            if (!email.includes(query) && !name.includes(query)) {
              continue;
            }
          }
          
          const user = UserSchema.parse(doc);
          users.push(user);
        } catch (e) {
          console.error(`Invalid user document ${doc.id}:`, e);
          // Skip invalid documents
        }
      }

      return { users, lastDoc: result.lastDoc };
    } catch (error) {
      throw handleError(
        error,
        "Failed to retrieve users",
        "UserService.getUsers"
      );
    }
  }

  /**
   * Update a user's role
   */
  async updateUserRole(id: string, role: UserRole): Promise<User> {
    try {
      // Validate the role
      const validRole = UserRoleSchema.parse(role);
      
      // Get current user to make sure it exists
      const existingUser = await this.getUser(id);
      
      if (!existingUser) {
        throw new CustomError("User not found", "NOT_FOUND");
      }

      // Prevent modifying super admins
      if (existingUser.role === "SuperAdmin" && role !== "SuperAdmin") {
        throw new CustomError(
          "Cannot change role of super admin accounts for security reasons",
          "FORBIDDEN"
        );
      }
      
      // Update the user
      const updateData = {
        role: validRole,
        updatedAt: new Date().toISOString(),
      };
      
      await FirestoreService.updateDocument(
        this.collectionName,
        id,
        updateData
      );
      
      // Return the updated user
      return {
        ...existingUser,
        ...updateData,
      };
    } catch (error) {
      throw handleError(
        error,
        "Failed to update user role",
        "UserService.updateUserRole"
      );
    }
  }

  /**
   * Update a user
   */
  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    try {
      // Validate input data
      const validData = UpdateUserInputSchema.parse(data);
      
      // Get current user to make sure it exists
      const existingUser = await this.getUser(id);
      
      if (!existingUser) {
        throw new CustomError("User not found", "NOT_FOUND");
      }

      // Prevent modifying super admins role
      if (
        existingUser.role === "SuperAdmin" && 
        validData.role && 
        validData.role !== "SuperAdmin"
      ) {
        throw new CustomError(
          "Cannot change role of super admin accounts for security reasons",
          "FORBIDDEN"
        );
      }
      
      // Add updated timestamp
      const updateData = {
        ...validData,
        updatedAt: new Date().toISOString(),
      };
      
      await FirestoreService.updateDocument(
        this.collectionName,
        id,
        updateData
      );
      
      // Return the updated user
      return {
        ...existingUser,
        ...updateData,
      };
    } catch (error) {
      throw handleError(
        error,
        "Failed to update user",
        "UserService.updateUser"
      );
    }
  }

  /**
   * Delete a user from Firestore
   * Note: This only deletes the user's document in Firestore
   * Deleting from Firebase Auth requires Admin SDK
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      // Check if user exists
      const existingUser = await this.getUser(id);
      
      if (!existingUser) {
        throw new CustomError("User not found", "NOT_FOUND");
      }

      // Prevent deleting super admins
      if (existingUser.role === "SuperAdmin") {
        throw new CustomError(
          "Cannot delete super admin accounts for security reasons",
          "FORBIDDEN"
        );
      }
      
      // Delete the user document
      await FirestoreService.deleteDocument(this.collectionName, id);
      
      return true;
    } catch (error) {
      throw handleError(
        error,
        "Failed to delete user",
        "UserService.deleteUser"
      );
    }
  }

  /**
   * Ensure a user document exists in Firestore
   * Helpful when creating users with the Auth service
   */
  async ensureUserDocument(userData: {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  }): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.getUser(userData.id).catch(() => null);
      
      if (existingUser) {
        // User exists, return existing data
        return existingUser;
      }
      
      // Create new user document
      const now = new Date().toISOString();
      const newUser = {
        email: userData.email,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        role: "USER" as UserRole,
        createdAt: now,
        updatedAt: now,
        disabled: false,
      };
      
      await FirestoreService.setDocument(
        this.collectionName,
        userData.id,
        newUser
      );
      
      // Return the new user
      return {
        id: userData.id,
        ...newUser,
      };
    } catch (error) {
      throw handleError(
        error,
        "Failed to ensure user document",
        "UserService.ensureUserDocument"
      );
    }
  }

  /**
   * Toggle a user's disabled status
   */
  async toggleUserDisabled(id: string, disabled: boolean): Promise<User> {
    try {
      // Get current user to make sure it exists
      const existingUser = await this.getUser(id);
      
      if (!existingUser) {
        throw new CustomError("User not found", "NOT_FOUND");
      }

      // Prevent disabling super admins
      if (existingUser.role === "SuperAdmin" && disabled) {
        throw new CustomError(
          "Cannot disable super admin accounts for security reasons",
          "FORBIDDEN"
        );
      }
      
      // Update disabled status
      const updateData = {
        disabled,
        updatedAt: new Date().toISOString(),
      };
      
      await FirestoreService.updateDocument(
        this.collectionName,
        id,
        updateData
      );
      
      // Return the updated user
      return {
        ...existingUser,
        ...updateData,
      };
    } catch (error) {
      throw handleError(
        error,
        "Failed to update user disabled status",
        "UserService.toggleUserDisabled"
      );
    }
  }

  /**
   * Update roles for multiple users in a single batch operation
   * @param updates - Array of objects with userId and new role
   * @returns Array of updated user objects
   */
  async batchUpdateUserRoles(updates: Array<{ userId: string; role: UserRole }>): Promise<User[]> {
    try {
      if (!updates.length) {
        return [];
      }

      // First, fetch all users to validate they exist and check permissions
      const userIds = updates.map(update => update.userId);
      const existingUsers: Record<string, User> = {};
      
      // Fetch each user to verify they exist and check permissions
      for (const userId of userIds) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new CustomError(`User with ID ${userId} not found`, "NOT_FOUND");
        }
        existingUsers[userId] = user;
      }
      
      // Validate role changes and create batch operations
      const operations = [];
      const updatedUsers: User[] = [];
      
      for (const update of updates) {
        const { userId, role } = update;
        const user = existingUsers[userId];
        
        // Validate the role
        const validRole = UserRoleSchema.parse(role);
        
        // Prevent modifying super admins
        if (user.role === "SuperAdmin" && validRole !== "SuperAdmin") {
          throw new CustomError(
            `Cannot change role of super admin account (${userId}) for security reasons`,
            "FORBIDDEN"
          );
        }
        
        // Add update operation
        const updateData = {
          role: validRole,
          updatedAt: new Date().toISOString(),
        };
        
        operations.push({
          type: 'update' as const,
          collectionName: this.collectionName,
          docId: userId,
          data: updateData,
        });
        
        // Add to updated users list
        updatedUsers.push({
          ...user,
          ...updateData,
        });
      }
      
      // Perform batch update
      await FirestoreService.batchOperation(operations);
      
      return updatedUsers;
    } catch (error) {
      throw handleError(
        error,
        "Failed to batch update user roles",
        "UserService.batchUpdateUserRoles"
      );
    }
  }
}

// Export a singleton instance of the service
export const userService = new UserService();
