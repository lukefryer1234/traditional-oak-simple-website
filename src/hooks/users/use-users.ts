import { useState, useCallback } from 'react';
import { useFirestoreCollectionRealtime } from '@/hooks/firebase/useFirestoreCollection';
import { FirestoreUser, COLLECTIONS } from '@/lib/firestore-schema';
import { UserRole } from '@/lib/permissions';
import FirebaseServices from '@/services/firebase';
import { toast } from '@/hooks/use-toast';

/**
 * Custom hook for managing users with real-time updates
 */
export function useUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch users with real-time updates
  const { 
    data: users = [], 
    isLoading: isLoadingUsers, 
    isError, 
    error: queryError,
    refetch
  } = useFirestoreCollectionRealtime<FirestoreUser>(
    COLLECTIONS.USERS,
    {
      constraints: [
        FirebaseServices.firestore.constraints.orderBy('email', 'asc')
      ],
      onError: (err) => {
        console.error('Error fetching users:', err);
        setError(err);
      }
    }
  );

  // Create a new user
  const createUser = useCallback(async (userData: Omit<FirestoreUser, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user with this email already exists
      const existingUsers = await FirebaseServices.firestore.getCollection<FirestoreUser>(
        COLLECTIONS.USERS,
        [FirebaseServices.firestore.constraints.where('email', '==', userData.email)]
      );
      
      if (existingUsers.length > 0) {
        throw new Error(`User with email ${userData.email} already exists`);
      }
      
      // Create the user
      const userId = await FirebaseServices.firestore.addDocument(COLLECTIONS.USERS, userData);
      
      toast({
        title: "User Created",
        description: `${userData.displayName || userData.email} has been added successfully.`
      });
      
      return userId;
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Creating User",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing user
  const updateUser = useCallback(async (userId: string, userData: Partial<FirestoreUser>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await FirebaseServices.firestore.updateDocument(
        COLLECTIONS.USERS,
        userId,
        userData
      );
      
      toast({
        title: "User Updated",
        description: `User information has been updated successfully.`
      });
      
      return true;
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Updating User",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a user
  const deleteUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await FirebaseServices.firestore.deleteDocument(COLLECTIONS.USERS, userId);
      
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully."
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Deleting User",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Batch update user roles
  const batchUpdateUserRoles = useCallback(async (userIds: string[], role: UserRole) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const operations = userIds.map(userId => ({
        type: 'update' as const,
        collectionName: COLLECTIONS.USERS,
        docId: userId,
        data: { role }
      }));
      
      await FirebaseServices.firestore.batchOperation(operations);
      
      toast({
        title: "Roles Updated",
        description: `Updated roles for ${userIds.length} users.`
      });
      
      return true;
    } catch (err) {
      console.error('Error updating user roles:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Updating Roles",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    isLoading: isLoading || isLoadingUsers,
    isError: isError || error !== null,
    error: error || queryError,
    createUser,
    updateUser,
    deleteUser,
    batchUpdateUserRoles,
    refetch
  };
}

/**
 * Hook for batch updating user roles
 */
export function useBatchUpdateUserRoles() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const batchUpdateUserRoles = useCallback(async (userIds: string[], role: UserRole) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const operations = userIds.map(userId => ({
        type: 'update' as const,
        collectionName: COLLECTIONS.USERS,
        docId: userId,
        data: { role }
      }));
      
      await FirebaseServices.firestore.batchOperation(operations);
      
      toast({
        title: "Roles Updated",
        description: `Updated roles for ${userIds.length} users.`
      });
      
      return true;
    } catch (err) {
      console.error('Error updating user roles:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Updating Roles",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    batchUpdateUserRoles,
    isLoading,
    error
  };
}
