import { useState, useCallback, useEffect } from 'react';
import { useFirestoreDocumentRealtime, useUpdateFirestoreDocument } from '@/hooks/firebase/useFirestoreDocument';
import { useFirestoreCollectionRealtime } from '@/hooks/firebase/useFirestoreCollection';
import FirebaseServices from '@/services/firebase';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { 
  UserPermissionAssignment, 
  Permission, 
  AccessRestriction,
  createDefaultUserPermissionAssignment,
  hasEnhancedPermission,
  getUserPermissions,
  getUserPermissionGroups
} from '@/lib/enhanced-permissions';
import { UserRole, AdminSection, PermissionAction } from '@/lib/permissions';

// Collection name for user permissions
const USER_PERMISSIONS_COLLECTION = 'userPermissions';

/**
 * Hook for managing user permissions
 */
export function useUserPermissions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();
  
  // Fetch all user permission assignments
  const { 
    data: userPermissions = [], 
    isLoading: isLoadingPermissions, 
    isError, 
    error: queryError,
    refetch
  } = useFirestoreCollectionRealtime<UserPermissionAssignment>(
    USER_PERMISSIONS_COLLECTION,
    {
      onError: (err) => {
        console.error('Error fetching user permissions:', err);
        setError(err);
      }
    }
  );
  
  // Fetch current user's permission assignment
  const { 
    data: currentUserPermission,
    isLoading: isLoadingCurrentUser
  } = useFirestoreDocumentRealtime<UserPermissionAssignment>(
    USER_PERMISSIONS_COLLECTION,
    currentUser?.uid,
    {
      enabled: !!currentUser?.uid,
      onError: (err) => {
        console.error('Error fetching current user permissions:', err);
        setError(err);
      }
    }
  );
  
  // Create a new user permission assignment
  const createUserPermission = useCallback(async (
    userId: string,
    email: string,
    role: UserRole = UserRole.CUSTOMER
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user permission already exists
      const exists = await FirebaseServices.firestore.documentExists(
        USER_PERMISSIONS_COLLECTION,
        userId
      );
      
      if (exists) {
        throw new Error(`User permission for ${email} already exists`);
      }
      
      // Create default permission assignment
      const permissionAssignment = createDefaultUserPermissionAssignment(userId, email, role);
      
      // Save to Firestore
      await FirebaseServices.firestore.setDocument(
        USER_PERMISSIONS_COLLECTION,
        userId,
        permissionAssignment
      );
      
      toast({
        title: "Permissions Created",
        description: `Permissions for ${email} have been created.`
      });
      
      return true;
    } catch (err) {
      console.error('Error creating user permission:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Creating Permissions",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Update a user's role
  const updateUserRole = useCallback(async (
    userId: string,
    role: UserRole
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current permission assignment
      const currentAssignment = await FirebaseServices.firestore.getDocument<UserPermissionAssignment>(
        USER_PERMISSIONS_COLLECTION,
        userId
      );
      
      // Update role
      await FirebaseServices.firestore.updateDocument(
        USER_PERMISSIONS_COLLECTION,
        userId,
        { role }
      );
      
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${role}.`
      });
      
      return true;
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Updating Role",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Grant a permission to a user
  const grantPermission = useCallback(async (
    userId: string,
    permission: Permission
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current permission assignment
      const currentAssignment = await FirebaseServices.firestore.getDocument<UserPermissionAssignment>(
        USER_PERMISSIONS_COLLECTION,
        userId
      );
      
      // Check if permission is already granted
      const isAlreadyGranted = currentAssignment.customPermissions.granted.some(
        p => p.section === permission.section && p.action === permission.action
      );
      
      if (isAlreadyGranted) {
        return true; // Already granted, no need to update
      }
      
      // Remove from denied permissions if present
      const updatedDenied = currentAssignment.customPermissions.denied.filter(
        p => !(p.section === permission.section && p.action === permission.action)
      );
      
      // Add to granted permissions
      const updatedGranted = [...currentAssignment.customPermissions.granted, permission];
      
      // Update in Firestore
      await FirebaseServices.firestore.updateDocument(
        USER_PERMISSIONS_COLLECTION,
        userId,
        { 
          customPermissions: {
            granted: updatedGranted,
            denied: updatedDenied
          }
        }
      );
      
      toast({
        title: "Permission Granted",
        description: `Permission ${permission.section}:${permission.action} has been granted.`
      });
      
      return true;
    } catch (err) {
      console.error('Error granting permission:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Granting Permission",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Deny a permission to a user
  const denyPermission = useCallback(async (
    userId: string,
    permission: Permission
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current permission assignment
      const currentAssignment = await FirebaseServices.firestore.getDocument<UserPermissionAssignment>(
        USER_PERMISSIONS_COLLECTION,
        userId
      );
      
      // Check if permission is already denied
      const isAlreadyDenied = currentAssignment.customPermissions.denied.some(
        p => p.section === permission.section && p.action === permission.action
      );
      
      if (isAlreadyDenied) {
        return true; // Already denied, no need to update
      }
      
      // Remove from granted permissions if present
      const updatedGranted = currentAssignment.customPermissions.granted.filter(
        p => !(p.section === permission.section && p.action === permission.action)
      );
      
      // Add to denied permissions
      const updatedDenied = [...currentAssignment.customPermissions.denied, permission];
      
      // Update in Firestore
      await FirebaseServices.firestore.updateDocument(
        USER_PERMISSIONS_COLLECTION,
        userId,
        { 
          customPermissions: {
            granted: updatedGranted,
            denied: updatedDenied
          }
        }
      );
      
      toast({
        title: "Permission Denied",
        description: `Permission ${permission.section}:${permission.action} has been denied.`
      });
      
      return true;
    } catch (err) {
      console.error('Error denying permission:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Denying Permission",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Reset a permission to role default
  const resetPermission = useCallback(async (
    userId: string,
    permission: Permission
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current permission assignment
      const currentAssignment = await FirebaseServices.firestore.getDocument<UserPermissionAssignment>(
        USER_PERMISSIONS_COLLECTION,
        userId
      );
      
      // Remove from both granted and denied permissions
      const updatedGranted = currentAssignment.customPermissions.granted.filter(
        p => !(p.section === permission.section && p.action === permission.action)
      );
      
      const updatedDenied = currentAssignment.customPermissions.denied.filter(
        p => !(p.section === permission.section && p.action === permission.action)
      );
      
      // Update in Firestore
      await FirebaseServices.firestore.updateDocument(
        USER_PERMISSIONS_COLLECTION,
        userId,
        { 
          customPermissions: {
            granted: updatedGranted,
            denied: updatedDenied
          }
        }
      );
      
      toast({
        title: "Permission Reset",
        description: `Permission ${permission.section}:${permission.action} has been reset to role default.`
      });
      
      return true;
    } catch (err) {
      console.error('Error resetting permission:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Resetting Permission",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Add an access restriction
  const addAccessRestriction = useCallback(async (
    userId: string,
    restriction: AccessRestriction
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current permission assignment
      const currentAssignment = await FirebaseServices.firestore.getDocument<UserPermissionAssignment>(
        USER_PERMISSIONS_COLLECTION,
        userId
      );
      
      // Add restriction
      const updatedRestrictions = [...currentAssignment.accessRestrictions, restriction];
      
      // Update in Firestore
      await FirebaseServices.firestore.updateDocument(
        USER_PERMISSIONS_COLLECTION,
        userId,
        { accessRestrictions: updatedRestrictions }
      );
      
      toast({
        title: "Restriction Added",
        description: `Access restriction has been added.`
      });
      
      return true;
    } catch (err) {
      console.error('Error adding access restriction:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Adding Restriction",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Remove an access restriction
  const removeAccessRestriction = useCallback(async (
    userId: string,
    restrictionIndex: number
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current permission assignment
      const currentAssignment = await FirebaseServices.firestore.getDocument<UserPermissionAssignment>(
        USER_PERMISSIONS_COLLECTION,
        userId
      );
      
      // Remove restriction
      const updatedRestrictions = [...currentAssignment.accessRestrictions];
      updatedRestrictions.splice(restrictionIndex, 1);
      
      // Update in Firestore
      await FirebaseServices.firestore.updateDocument(
        USER_PERMISSIONS_COLLECTION,
        userId,
        { accessRestrictions: updatedRestrictions }
      );
      
      toast({
        title: "Restriction Removed",
        description: `Access restriction has been removed.`
      });
      
      return true;
    } catch (err) {
      console.error('Error removing access restriction:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Removing Restriction",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Set expiration date for user permissions
  const setExpirationDate = useCallback(async (
    userId: string,
    expiresAt: Date | null
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Update in Firestore
      await FirebaseServices.firestore.updateDocument(
        USER_PERMISSIONS_COLLECTION,
        userId,
        { expiresAt: expiresAt }
      );
      
      toast({
        title: "Expiration Date Set",
        description: expiresAt 
          ? `Permissions will expire on ${expiresAt.toLocaleDateString()}.`
          : "Expiration date has been removed."
      });
      
      return true;
    } catch (err) {
      console.error('Error setting expiration date:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Setting Expiration",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Check if current user has a specific permission
  const checkPermission = useCallback((
    section: AdminSection,
    action: PermissionAction,
    context: {
      ipAddress?: string;
      timestamp?: Date;
      geoLocation?: { country: string; region?: string };
    } = {}
  ): boolean => {
    if (!currentUserPermission) {
      return false;
    }
    
    return hasEnhancedPermission(currentUserPermission, section, action, context);
  }, [currentUserPermission]);
  
  // Get all permissions for the current user
  const getCurrentUserPermissions = useCallback((): Permission[] => {
    if (!currentUserPermission) {
      return [];
    }
    
    return getUserPermissions(currentUserPermission);
  }, [currentUserPermission]);
  
  // Get permission groups for the current user
  const getCurrentUserPermissionGroups = useCallback(() => {
    if (!currentUserPermission) {
      return [];
    }
    
    return getUserPermissionGroups(currentUserPermission);
  }, [currentUserPermission]);
  
  // Initialize permissions for a new user if they don't exist
  useEffect(() => {
    if (currentUser && !isLoadingCurrentUser && !currentUserPermission) {
      // Create default permissions for the user
      createUserPermission(
        currentUser.uid,
        currentUser.email || 'unknown@example.com',
        UserRole.CUSTOMER
      );
    }
  }, [currentUser, isLoadingCurrentUser, currentUserPermission, createUserPermission]);
  
  return {
    userPermissions,
    currentUserPermission,
    isLoading: isLoading || isLoadingPermissions || isLoadingCurrentUser,
    isError: isError || error !== null,
    error: error || queryError,
    createUserPermission,
    updateUserRole,
    grantPermission,
    denyPermission,
    resetPermission,
    addAccessRestriction,
    removeAccessRestriction,
    setExpirationDate,
    checkPermission,
    getCurrentUserPermissions,
    getCurrentUserPermissionGroups,
    refetch
  };
}
