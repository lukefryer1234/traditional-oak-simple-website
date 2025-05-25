"use client";

import React, { useState } from "react";
import { withPermissionCheck } from "@/components/with-permission-check";
import { AdminSection, PermissionAction } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays } from "date-fns";
import { useAnalyticsData } from "@/hooks/analytics/use-analytics-data";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag, PercentIcon } from "lucide-react";

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

/**
 * Analytics Dashboard Page Component
 */
function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Use the analytics data hook
  const { 
    analyticsData,
    isLoading,
    error,
    getAnalyticsForPeriod,
    getSummaryMetrics
  } = useAnalyticsData();
  
  // Get data for the selected time range
  const days = parseInt(timeRange);
  const periodData = getAnalyticsForPeriod(days);
  
  // Get summary metrics
  const metrics = getSummaryMetrics(days);
  
  // Format data for charts
  const salesData = periodData.map(item => ({
    date: typeof item.date === 'string' 
      ? format(new Date(item.date), 'MMM dd') 
      : format(item.date, 'MMM dd'),
    sales: item.sales,
    orders: item.orders
  })).reverse(); // Reverse to show oldest to newest
  
  const visitorData = periodData.map(item => ({
    date: typeof item.date === 'string' 
      ? format(new Date(item.date), 'MMM dd') 
      : format(item.date, 'MMM dd'),
    visitors: item.visitors,
    pageViews: item.pageViews
  })).reverse(); // Reverse to show oldest to newest
  
  // Format top products data for chart
  const topProductsData = metrics.topProducts.map(product => ({
    name: product.productName,
    value: product.sales
  }));
  
  // Format top categories data for chart
  const topCategoriesData = metrics.topCategories.map(category => ({
    name: category.category,
    value: category.sales
  }));
  
  // Calculate percent change from previous period
  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return 100; // If previous was 0, show 100% increase
    return ((current - previous) / previous) * 100;
  };
  
  // Get data for previous period
  const previousPeriodData = getAnalyticsForPeriod(days * 2).slice(0, days);
  const previousMetrics = {
    totalSales: previousPeriodData.reduce((total, item) => total + item.sales, 0),
    totalOrders: previousPeriodData.reduce((total, item) => total + item.orders, 0),
    totalVisitors: previousPeriodData.reduce((total, item) => total + item.visitors, 0),
    averageOrderValue: previousPeriodData.reduce((total, item) => total + item.sales, 0) / 
                       (previousPeriodData.reduce((total, item) => total + item.orders, 0) || 1)
  };
  
  // Calculate percent changes
  const salesChange = calculatePercentChange(metrics.totalSales, previousMetrics.totalSales);
  const ordersChange = calculatePercentChange(metrics.totalOrders, previousMetrics.totalOrders);
  const visitorsChange = calculatePercentChange(metrics.totalVisitors, previousMetrics.totalVisitors);
  const aovChange = calculatePercentChange(metrics.averageOrderValue, previousMetrics.averageOrderValue);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
  };
  
  // Format percent
  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('sales') 
                ? formatCurrency(entry.value) 
                : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor key metrics and performance indicators
          </p>
        </div>
        
        <Select value={timeRange} onValueChange={(value: "7" | "30" | "90") => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading analytics data...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 text-destructive">
          <p>Error loading analytics data: {error.message}</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sales Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
                    <div className="text-2xl font-bold">{formatCurrency(metrics.totalSales)}</div>
                  </div>
                  <div className={`flex items-center ${salesChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {salesChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span>{formatPercent(Math.abs(salesChange))}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Compared to previous {days} days
                </p>
              </CardContent>
            </Card>
            
            {/* Orders Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground mr-2" />
                    <div className="text-2xl font-bold">{metrics.totalOrders.toLocaleString()}</div>
                  </div>
                  <div className={`flex items-center ${ordersChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {ordersChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span>{formatPercent(Math.abs(ordersChange))}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Compared to previous {days} days
                </p>
              </CardContent>
            </Card>
            
            {/* Visitors Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Visitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-muted-foreground mr-2" />
                    <div className="text-2xl font-bold">{metrics.totalVisitors.toLocaleString()}</div>
                  </div>
                  <div className={`flex items-center ${visitorsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {visitorsChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span>{formatPercent(Math.abs(visitorsChange))}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Compared to previous {days} days
                </p>
              </CardContent>
            </Card>
            
            {/* Average Order Value Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Order Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PercentIcon className="h-5 w-5 text-muted-foreground mr-2" />
                    <div className="text-2xl font-bold">{formatCurrency(metrics.averageOrderValue)}</div>
                  </div>
                  <div className={`flex items-center ${aovChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {aovChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span>{formatPercent(Math.abs(aovChange))}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Compared to previous {days} days
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs for different analytics views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="visitors">Visitors</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Sales & Orders Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sales & Orders</CardTitle>
                    <CardDescription>
                      Sales and order trends over the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={salesData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="sales"
                            name="Sales (£)"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="orders"
                            name="Orders"
                            stroke="#82ca9d"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Top Products Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>
                      Best-selling products by revenue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={topProductsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {topProductsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Sales Tab */}
            <TabsContent value="sales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trends</CardTitle>
                  <CardDescription>
                    Detailed sales data over the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={salesData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="sales" name="Sales (£)" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Categories</CardTitle>
                    <CardDescription>
                      Best-selling categories by revenue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={topCategoriesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {topCategoriesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Rate</CardTitle>
                    <CardDescription>
                      Percentage of visitors who made a purchase
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center h-[300px]">
                    <div className="text-5xl font-bold mb-4">
                      {formatPercent(metrics.conversionRate)}
                    </div>
                    <p className="text-muted-foreground text-center">
                      {metrics.conversionRate > 3 
                        ? "Above industry average" 
                        : "Below industry average"}
                    </p>
                    <div className={`flex items-center mt-4 ${metrics.conversionRate >= 2 ? 'text-green-500' : 'text-amber-500'}`}>
                      {metrics.conversionRate >= 2 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span>
                        {metrics.conversionRate >= 2 
                          ? "Good conversion rate" 
                          : "Needs improvement"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Visitors Tab */}
            <TabsContent value="visitors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Visitor Trends</CardTitle>
                  <CardDescription>
                    Visitor and page view data over the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={visitorData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="visitors"
                          name="Visitors"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="pageViews"
                          name="Page Views"
                          stroke="#82ca9d"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Average Pages per Visit</CardTitle>
                    <CardDescription>
                      Average number of pages viewed per session
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center h-[300px]">
                    <div className="text-5xl font-bold mb-4">
                      {(periodData.reduce((total, item) => total + item.pageViews, 0) / 
                        (periodData.reduce((total, item) => total + item.visitors, 0) || 1)).toFixed(2)}
                    </div>
                    <p className="text-muted-foreground text-center">
                      Pages per visitor
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Acquisition</CardTitle>
                    <CardDescription>
                      How visitors are finding your site
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Organic', value: 45 },
                              { name: 'Direct', value: 30 },
                              { name: 'Referral', value: 15 },
                              { name: 'Social', value: 10 },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {COLORS.map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Products Tab */}
            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>
                    Best-performing products by revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metrics.topProducts.map(product => ({
                          name: product.productName,
                          sales: product.sales,
                          quantity: product.quantity
                        }))}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="sales" name="Sales (£)" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products by Quantity</CardTitle>
                  <CardDescription>
                    Best-performing products by units sold
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metrics.topProducts.map(product => ({
                          name: product.productName,
                          quantity: product.quantity
                        }))}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="quantity" name="Units Sold" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

// Export with permission check
export default withPermissionCheck(
  AnalyticsDashboardPage,
  AdminSection.DASHBOARD,
  PermissionAction.VIEW,
);
