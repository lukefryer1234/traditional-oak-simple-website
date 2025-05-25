import { useState, useCallback } from 'react';
import { useFirestoreCollectionRealtime } from '@/hooks/firebase/useFirestoreCollection';
import { FirestoreNotification, COLLECTIONS } from '@/lib/firestore-schema';
import FirebaseServices from '@/services/firebase';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

/**
 * Custom hook for managing notifications with real-time updates
 */
export function useNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();
  
  // Get the current user ID
  const userId = currentUser?.uid || 'all';

  // Fetch notifications with real-time updates
  const { 
    data: notifications = [], 
    isLoading: isLoadingNotifications, 
    isError, 
    error: queryError,
    refetch
  } = useFirestoreCollectionRealtime<FirestoreNotification>(
    COLLECTIONS.NOTIFICATIONS,
    {
      constraints: [
        // If userId is 'all', get all notifications, otherwise filter by userId
        ...(userId !== 'all' ? [FirebaseServices.firestore.constraints.where('userId', '==', userId)] : []),
        FirebaseServices.firestore.constraints.orderBy('createdAt', 'desc')
      ],
      onError: (err) => {
        console.error('Error fetching notifications:', err);
        setError(err);
      }
    }
  );

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Add a new notification
  const addNotification = useCallback(async (notificationData: Omit<FirestoreNotification, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create the notification
      const notificationId = await FirebaseServices.firestore.addDocument(COLLECTIONS.NOTIFICATIONS, notificationData);
      
      return notificationId;
    } catch (err) {
      console.error('Error creating notification:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Creating Notification",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await FirebaseServices.firestore.updateDocument(
        COLLECTIONS.NOTIFICATIONS,
        notificationId,
        { read: true }
      );
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Updating Notification",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const operations = notifications
        .filter(notification => !notification.read)
        .map(notification => ({
          type: 'update' as const,
          collectionName: COLLECTIONS.NOTIFICATIONS,
          docId: notification.id as string,
          data: { read: true }
        }));
      
      if (operations.length > 0) {
        await FirebaseServices.firestore.batchOperation(operations);
      }
      
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Updating Notifications",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [notifications]);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await FirebaseServices.firestore.deleteDocument(COLLECTIONS.NOTIFICATIONS, notificationId);
      
      toast({
        title: "Notification Deleted",
        description: "The notification has been deleted."
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Deleting Notification",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const operations = notifications.map(notification => ({
        type: 'delete' as const,
        collectionName: COLLECTIONS.NOTIFICATIONS,
        docId: notification.id as string
      }));
      
      if (operations.length > 0) {
        await FirebaseServices.firestore.batchOperation(operations);
      }
      
      toast({
        title: "Notifications Cleared",
        description: "All notifications have been deleted."
      });
      
      return true;
    } catch (err) {
      console.error('Error clearing notifications:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Clearing Notifications",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading: isLoading || isLoadingNotifications,
    isError: isError || error !== null,
    error: error || queryError,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refetch
  };
}
