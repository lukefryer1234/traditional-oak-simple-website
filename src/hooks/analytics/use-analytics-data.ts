import { useState, useCallback } from 'react';
import { useFirestoreCollectionRealtime } from '@/hooks/firebase/useFirestoreCollection';
import { FirestoreAnalyticsData, COLLECTIONS } from '@/lib/firestore-schema';
import FirebaseServices from '@/services/firebase';
import { toast } from '@/hooks/use-toast';

/**
 * Custom hook for managing analytics data with real-time updates
 */
export function useAnalyticsData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch analytics data with real-time updates
  const { 
    data: analyticsData = [], 
    isLoading: isLoadingData, 
    isError, 
    error: queryError,
    refetch
  } = useFirestoreCollectionRealtime<FirestoreAnalyticsData>(
    COLLECTIONS.ANALYTICS,
    {
      constraints: [
        FirebaseServices.firestore.constraints.orderBy('date', 'desc')
      ],
      onError: (err) => {
        console.error('Error fetching analytics data:', err);
        setError(err);
      }
    }
  );

  // Get analytics data for a specific date range
  const getAnalyticsForDateRange = useCallback((startDate: Date, endDate: Date) => {
    return analyticsData.filter(data => {
      const dataDate = typeof data.date === 'string' ? new Date(data.date) : data.date;
      return dataDate >= startDate && dataDate <= endDate;
    });
  }, [analyticsData]);

  // Get analytics data for a specific period (last 7 days, last 30 days, etc.)
  const getAnalyticsForPeriod = useCallback((days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return getAnalyticsForDateRange(startDate, endDate);
  }, [getAnalyticsForDateRange]);

  // Calculate total sales for a period
  const calculateTotalSales = useCallback((data: FirestoreAnalyticsData[]) => {
    return data.reduce((total, item) => total + item.sales, 0);
  }, []);

  // Calculate total orders for a period
  const calculateTotalOrders = useCallback((data: FirestoreAnalyticsData[]) => {
    return data.reduce((total, item) => total + item.orders, 0);
  }, []);

  // Calculate total visitors for a period
  const calculateTotalVisitors = useCallback((data: FirestoreAnalyticsData[]) => {
    return data.reduce((total, item) => total + item.visitors, 0);
  }, []);

  // Calculate average order value for a period
  const calculateAverageOrderValue = useCallback((data: FirestoreAnalyticsData[]) => {
    const totalSales = calculateTotalSales(data);
    const totalOrders = calculateTotalOrders(data);
    return totalOrders > 0 ? totalSales / totalOrders : 0;
  }, [calculateTotalSales, calculateTotalOrders]);

  // Calculate conversion rate for a period
  const calculateConversionRate = useCallback((data: FirestoreAnalyticsData[]) => {
    const totalOrders = calculateTotalOrders(data);
    const totalVisitors = calculateTotalVisitors(data);
    return totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0;
  }, [calculateTotalOrders, calculateTotalVisitors]);

  // Get top products for a period
  const getTopProducts = useCallback((data: FirestoreAnalyticsData[], limit: number = 5) => {
    // Collect all product data
    const allProducts = data.flatMap(item => item.topProducts || []);
    
    // Group by product ID and sum sales
    const productMap = new Map<string, { productId: string, productName: string, sales: number, quantity: number }>();
    
    allProducts.forEach(product => {
      const existing = productMap.get(product.productId);
      if (existing) {
        existing.sales += product.sales;
        existing.quantity += product.quantity;
      } else {
        productMap.set(product.productId, { ...product });
      }
    });
    
    // Convert to array and sort by sales
    return Array.from(productMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  }, []);

  // Get top categories for a period
  const getTopCategories = useCallback((data: FirestoreAnalyticsData[], limit: number = 5) => {
    // Collect all category data
    const allCategories = data.flatMap(item => item.topCategories || []);
    
    // Group by category and sum sales
    const categoryMap = new Map<string, { category: string, sales: number }>();
    
    allCategories.forEach(category => {
      const existing = categoryMap.get(category.category);
      if (existing) {
        existing.sales += category.sales;
      } else {
        categoryMap.set(category.category, { ...category });
      }
    });
    
    // Convert to array and sort by sales
    return Array.from(categoryMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  }, []);

  // Add new analytics data
  const addAnalyticsData = useCallback(async (data: Omit<FirestoreAnalyticsData, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create the analytics data
      const dataId = await FirebaseServices.firestore.addDocument(COLLECTIONS.ANALYTICS, data);
      
      return dataId;
    } catch (err) {
      console.error('Error creating analytics data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Adding Analytics Data",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update analytics data
  const updateAnalyticsData = useCallback(async (dataId: string, data: Partial<FirestoreAnalyticsData>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await FirebaseServices.firestore.updateDocument(
        COLLECTIONS.ANALYTICS,
        dataId,
        data
      );
      
      return true;
    } catch (err) {
      console.error('Error updating analytics data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        variant: "destructive",
        title: "Error Updating Analytics Data",
        description: err instanceof Error ? err.message : String(err)
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get summary metrics for a period
  const getSummaryMetrics = useCallback((days: number) => {
    const data = getAnalyticsForPeriod(days);
    
    return {
      totalSales: calculateTotalSales(data),
      totalOrders: calculateTotalOrders(data),
      totalVisitors: calculateTotalVisitors(data),
      averageOrderValue: calculateAverageOrderValue(data),
      conversionRate: calculateConversionRate(data),
      topProducts: getTopProducts(data),
      topCategories: getTopCategories(data)
    };
  }, [
    getAnalyticsForPeriod, 
    calculateTotalSales, 
    calculateTotalOrders, 
    calculateTotalVisitors, 
    calculateAverageOrderValue, 
    calculateConversionRate,
    getTopProducts,
    getTopCategories
  ]);

  return {
    analyticsData,
    isLoading: isLoading || isLoadingData,
    isError: isError || error !== null,
    error: error || queryError,
    getAnalyticsForDateRange,
    getAnalyticsForPeriod,
    calculateTotalSales,
    calculateTotalOrders,
    calculateTotalVisitors,
    calculateAverageOrderValue,
    calculateConversionRate,
    getTopProducts,
    getTopCategories,
    getSummaryMetrics,
    addAnalyticsData,
    updateAnalyticsData,
    refetch
  };
}
