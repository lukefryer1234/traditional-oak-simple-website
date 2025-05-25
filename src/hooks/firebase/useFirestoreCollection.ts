// src/hooks/firebase/useFirestoreCollection.ts
import { useQuery, useQueryClient, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  getDocs, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  onSnapshot,
  QueryConstraint,
  DocumentData as FirestoreDocumentData,
  QuerySnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { DocumentData } from './useFirestoreDocument';

// Define WhereFilterOp type since it's no longer exported from firebase/firestore
export type WhereFilterOp = 
  | '<' 
  | '<=' 
  | '==' 
  | '!=' 
  | '>=' 
  | '>' 
  | 'array-contains' 
  | 'array-contains-any' 
  | 'in' 
  | 'not-in';

// Interface for collection query options
export interface CollectionQueryOptions {
  constraints?: QueryConstraint[];
  idField?: string;
  refetchInterval?: number | false;
  enabled?: boolean;
  onSuccess?: (data: any[]) => void;
  onError?: (error: Error) => void;
  staleTime?: number;
}

// Type for pagination state
export interface PaginationState {
  lastDoc?: QueryDocumentSnapshot;
  hasMore: boolean;
}

/**
 * Converts a Firestore QuerySnapshot to an array of documents with IDs
 */
function snapshotToData<T>(
  querySnapshot: QuerySnapshot<FirestoreDocumentData, FirestoreDocumentData>, 
  idField: string = 'id'
): T[] {
  return querySnapshot.docs.map((doc) => ({
    [idField]: doc.id,
    ...doc.data(),
  })) as T[];
}

/**
 * Hook for querying a Firestore collection
 * @param collectionName - The name of the Firestore collection
 * @param options - Query options including constraints
 */
export function useFirestoreCollection<T extends DocumentData>(
  collectionName: string,
  options: CollectionQueryOptions = {}
) {
  const {
    constraints = [],
    idField = 'id',
    refetchInterval = false,
    enabled = true,
    onSuccess,
    onError,
    staleTime,
  } = options;

  // Create query options without the custom properties
  const queryOptions: UseQueryOptions<T[], Error> = {
    queryKey: ['firestore', 'collection', collectionName, constraints],
    queryFn: async () => {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      return snapshotToData<T>(querySnapshot, idField);
    },
    refetchInterval,
    enabled,
    staleTime,
  };

  const result = useQuery<T[], Error>(queryOptions);

  // Handle success and error callbacks manually
  useEffect(() => {
    if (result.data && onSuccess) {
      onSuccess(result.data);
    }
    if (result.error && onError) {
      onError(result.error);
    }
  }, [result.data, result.error, onSuccess, onError]);

  return result;
}

/**
 * Hook for real-time subscription to a Firestore collection
 * @param collectionName - The name of the Firestore collection
 * @param options - Subscription options including constraints
 */
export function useFirestoreCollectionRealtime<T extends DocumentData>(
  collectionName: string,
  options: CollectionQueryOptions = {}
) {
  const {
    constraints = [],
    idField = 'id',
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const queryClient = useQueryClient();
  const queryKey = ['firestore', 'collection', 'realtime', collectionName, constraints];

  // Initial fetch (will be used until subscription provides first value)
  const queryOptions: UseQueryOptions<T[], Error> = {
    queryKey,
    queryFn: async () => {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      return snapshotToData<T>(querySnapshot, idField);
    },
    enabled,
  };

  const queryResult = useQuery<T[], Error>(queryOptions);

  // Set up the real-time listener
  useEffect(() => {
    if (!enabled) return;

    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);

    console.log(`Setting up realtime collection listener for ${collectionName}`);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const data = snapshotToData<T>(querySnapshot, idField);
        queryClient.setQueryData(queryKey, data);
        if (onSuccess) onSuccess(data);
      },
      (error) => {
        console.error(`Error in realtime collection listener for ${collectionName}:`, error);
        if (onError) onError(error);
      }
    );

    return () => {
      console.log(`Removing realtime collection listener for ${collectionName}`);
      unsubscribe();
    };
  }, [collectionName, constraints, enabled, idField, queryClient, onSuccess, onError]);

  return queryResult;
}

/**
 * Hook for paginated queries of a Firestore collection
 * @param collectionName - The name of the Firestore collection
 * @param pageSize - Number of items per page
 * @param options - Query options
 */
export function usePaginatedFirestoreCollection<T extends DocumentData>(
  collectionName: string,
  pageSize: number = 10,
  options: CollectionQueryOptions = {}
) {
  const {
    constraints = [],
    idField = 'id',
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const [paginationState, setPaginationState] = useState<PaginationState>({
    lastDoc: undefined,
    hasMore: true,
  });

  // Function to fetch the next page of results
  const fetchNextPage = async (): Promise<{ data: T[], hasMore: boolean }> => {
    if (!paginationState.hasMore) return { data: [], hasMore: false };

    const collectionRef = collection(db, collectionName);
    
    // Create query with pagination
    let paginatedQuery;
    if (paginationState.lastDoc) {
      paginatedQuery = query(
        collectionRef,
        ...constraints,
        startAfter(paginationState.lastDoc),
        limit(pageSize)
      );
    } else {
      paginatedQuery = query(
        collectionRef,
        ...constraints,
        limit(pageSize)
      );
    }

    // Execute query
    const querySnapshot = await getDocs(paginatedQuery);
    const data = snapshotToData<T>(querySnapshot, idField);
    
    // Update pagination state
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const hasMore = querySnapshot.docs.length === pageSize;
    
    setPaginationState({
      lastDoc,
      hasMore,
    });

    return { data, hasMore };
  };

  // Query for the first page
  const queryOptions: UseQueryOptions<{ data: T[], hasMore: boolean }, Error> = {
    queryKey: ['firestore', 'collection', 'paginated', collectionName, constraints, pageSize],
    queryFn: fetchNextPage,
    enabled,
  };

  const result = useQuery<{ data: T[], hasMore: boolean }, Error>(queryOptions);

  // Handle success and error callbacks manually
  useEffect(() => {
    if (result.data && onSuccess) {
      onSuccess(result.data.data);
    }
    if (result.error && onError) {
      onError(result.error);
    }
  }, [result.data, result.error, onSuccess, onError]);

  return {
    ...result,
    data: result.data?.data || [],
    hasMore: result.data?.hasMore || false,
    fetchNextPage,
  };
}

// Helper functions to create Firestore query constraints
export const createQueryConstraints = {
  where: (field: string, operator: WhereFilterOp, value: any) => 
    where(field, operator, value),
  
  orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => 
    orderBy(field, direction),
  
  limit: (n: number) => 
    limit(n),
};
