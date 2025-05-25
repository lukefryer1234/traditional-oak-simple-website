import { useState, useCallback } from 'react';
import { useFirestoreCollectionRealtime } from '@/hooks/firebase/useFirestoreCollection';
import { FirestoreActivityLog, COLLECTIONS } from '@/lib/firestore-schema';
import FirebaseServices from '@/services/firebase';
import { toast } from '@/hooks/use-toast';

/**
 * Custom hook for managing activity logs with real-time updates
 */
export function useActivityLogs() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch activity logs with real-time updates
  const { 
    data: activityLogs = [], 
    isLoading: isLoadingLogs, 
    isError, 
    error: queryError,
    refetch
  } = useFirestoreCollectionRealtime<FirestoreActivityLog>(
    COLLECTIONS.ACTIVITY_LOGS,
    {
      constraints: [
        FirebaseServices.firestore.constraints.orderBy('createdAt', 'desc')
      ],
      onError: (err) => {
        console.error('Error fetching activity logs:', err);
        setError(err);
      }
    }
  );

  // Add a new activity log
  const addActivityLog = useCallback(async (logData: Omit<FirestoreActivityLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create the activity log
      const logId = await FirebaseServices.firestore.addDocument(COLLECTIONS.ACTIVITY_LOGS, logData);
      
      return logId;
    } catch (err) {
      console.error('Error creating activity log:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Logging Activity",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete an activity log
  const deleteActivityLog = useCallback(async (logId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await FirebaseServices.firestore.deleteDocument(COLLECTIONS.ACTIVITY_LOGS, logId);
      
      toast({
        title: "Log Entry Deleted",
        description: "The activity log entry has been deleted."
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting activity log:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Deleting Log Entry",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear all activity logs
  const clearActivityLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, we would use a Cloud Function to batch delete
      // For now, we'll delete logs one by one (not efficient for large datasets)
      const operations = activityLogs.map(log => ({
        type: 'delete' as const,
        collectionName: COLLECTIONS.ACTIVITY_LOGS,
        docId: log.id as string
      }));
      
      if (operations.length > 0) {
        await FirebaseServices.firestore.batchOperation(operations);
      }
      
      toast({
        title: "Activity Logs Cleared",
        description: "All activity logs have been deleted."
      });
      
      return true;
    } catch (err) {
      console.error('Error clearing activity logs:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Clearing Logs",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [activityLogs]);

  return {
    activityLogs,
    isLoading: isLoading || isLoadingLogs,
    isError: isError || error !== null,
    error: error || queryError,
    addActivityLog,
    deleteActivityLog,
    clearActivityLogs,
    refetch
  };
}
