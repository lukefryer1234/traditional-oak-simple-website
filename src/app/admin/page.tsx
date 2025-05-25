"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Package, 
  Users, 
  Settings, 
  DollarSign, 
  BarChart, 
  ShoppingCart, 
  Clock, 
  AlertCircle,
  FileText,
  MessageSquare,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { getEffectiveRole, UserRole } from "@/lib/permissions";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, subDays, subMonths, isAfter } from "date-fns";

// Dashboard card type
interface DashboardCard {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

// Define dashboard cards
const dashboardCards: DashboardCard[] = [
  {
    title: "Orders",
    description: "Manage customer orders and track deliveries",
    icon: Package,
    href: "/admin/orders",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Products",
    description: "Manage your product catalog and pricing",
    icon: ShoppingCart,
    href: "/admin/products",
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Users",
    description: "Manage user accounts and permissions",
    icon: Users,
    href: "/admin/users",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Content",
    description: "Manage website content and gallery",
    icon: FileText,
    href: "/admin/content",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    title: "CRM",
    description: "Manage leads and customer relationships",
    icon: MessageSquare,
    href: "/admin/crm",
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    title: "Settings",
    description: "Configure system settings and preferences",
    icon: Settings,
    href: "/admin/settings",
    color: "bg-slate-500/10 text-slate-500",
  },
];

// Mock data for recent orders
const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Smith",
    date: "2025-05-23",
    amount: 1250.00,
    status: "Paid",
    statusColor: "text-green-500",
  },
  {
    id: "ORD-002",
    customer: "Sarah Johnson",
    date: "2025-05-22",
    amount: 3450.00,
    status: "Processing",
    statusColor: "text-amber-500",
  },
  {
    id: "ORD-003",
    customer: "Michael Brown",
    date: "2025-05-21",
    amount: 780.00,
    status: "Delivered",
    statusColor: "text-blue-500",
  },
  {
    id: "ORD-004",
    customer: "Emma Wilson",
    date: "2025-05-20",
    amount: 2100.00,
    status: "Pending",
    statusColor: "text-slate-500",
  },
];

// Mock data for recent leads
const recentLeads = [
  {
    id: "LEAD-001",
    name: "David Thompson",
    email: "david@example.com",
    phone: "07700 900123",
    date: "2025-05-23",
    status: "New",
    statusColor: "text-blue-500",
  },
  {
    id: "LEAD-002",
    name: "Lisa Anderson",
    email: "lisa@example.com",
    phone: "07700 900456",
    date: "2025-05-22",
    status: "Contacted",
    statusColor: "text-amber-500",
  },
  {
    id: "LEAD-003",
    name: "Robert Clark",
    email: "robert@example.com",
    phone: "07700 900789",
    date: "2025-05-21",
    status: "Qualified",
    statusColor: "text-green-500",
  },
  {
    id: "LEAD-004",
    name: "Jennifer Lewis",
    email: "jennifer@example.com",
    phone: "07700 900321",
    date: "2025-05-20",
    status: "Closed",
    statusColor: "text-slate-500",
  },
];

// Mock data for key metrics
const keyMetrics = [
  {
    title: "Total Sales",
    value: "£24,780",
    change: "+12%",
    changeType: "positive",
    icon: DollarSign,
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "New Orders",
    value: "18",
    change: "+5%",
    changeType: "positive",
    icon: ShoppingCart,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "New Leads",
    value: "24",
    change: "+15%",
    changeType: "positive",
    icon: Users,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Avg. Order Value",
    value: "£1,376",
    change: "+8%",
    changeType: "positive",
    icon: BarChart,
    color: "bg-amber-500/10 text-amber-500",
  },
];

// Mock data for alerts
const alerts = [
  {
    title: "Low Stock Alert",
    description: "3 products are running low on stock",
    icon: AlertCircle,
    color: "text-amber-500",
  },
  {
    title: "Pending Orders",
    description: "5 orders require processing",
    icon: Clock,
    color: "text-blue-500",
  },
];

// Mock data for sales trend chart
const salesTrendData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 8000 },
  { name: "May", sales: 7000 },
  { name: "Jun", sales: 9000 },
  { name: "Jul", sales: 11000 },
  { name: "Aug", sales: 12000 },
  { name: "Sep", sales: 14000 },
  { name: "Oct", sales: 16000 },
  { name: "Nov", sales: 18000 },
  { name: "Dec", sales: 24000 },
];

// Mock data for daily sales (last 30 days)
const generateDailySalesData = () => {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const formattedDate = format(date, "MMM dd");
    // Generate a somewhat realistic sales pattern with weekends having higher sales
    const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseSales = Math.floor(Math.random() * 500) + 500;
    const sales = isWeekend ? baseSales * 1.5 : baseSales;
    
    data.push({
      date: formattedDate,
      sales: Math.round(sales),
    });
  }
  return data;
};

const dailySalesData = generateDailySalesData();

// Mock data for product category distribution
const productCategoryData = [
  { name: "Garden Structures", value: 35 },
  { name: "Flooring", value: 25 },
  { name: "Porches", value: 20 },
  { name: "Garages", value: 15 },
  { name: "Custom Projects", value: 5 },
];

// Colors for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

// Mock data for customer acquisition
const customerAcquisitionData = [
  { name: "Jan", organic: 40, paid: 24 },
  { name: "Feb", organic: 30, paid: 13 },
  { name: "Mar", organic: 20, paid: 38 },
  { name: "Apr", organic: 27, paid: 39 },
  { name: "May", organic: 18, paid: 48 },
  { name: "Jun", organic: 23, paid: 38 },
  { name: "Jul", organic: 34, paid: 43 },
];

// Mock data for detailed metrics
const detailedMetrics = [
  {
    title: "Conversion Rate",
    value: "3.2%",
    change: "+0.4%",
    changeType: "positive",
    description: "Visitors who completed a purchase",
  },
  {
    title: "Cart Abandonment",
    value: "68%",
    change: "-2.3%",
    changeType: "positive",
    description: "Users who added items but didn't checkout",
  },
  {
    title: "Repeat Customers",
    value: "42%",
    change: "+5.1%",
    changeType: "positive",
    description: "Customers who made more than one purchase",
  },
  {
    title: "Avg. Fulfillment Time",
    value: "2.4 days",
    change: "-0.3 days",
    changeType: "positive",
    description: "Average time from order to shipping",
  },
];

// Filter options for date ranges
const dateRangeOptions = [
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "Last 90 Days", value: "90days" },
  { label: "This Year", value: "year" },
  { label: "Custom Range", value: "custom" },
];

// Helper function to filter data by date range
const filterDataByDateRange = (data: any[], range: string, startDate?: Date, endDate?: Date) => {
  const today = new Date();
  
  switch (range) {
    case "7days":
      return data.filter((_, index) => index >= data.length - 7);
    case "30days":
      return data;
    case "90days":
      // For demo purposes, we'll just return all data since our mock data is limited
      return data;
    case "year":
      return data;
    case "custom":
      if (startDate && endDate) {
        // In a real implementation, we would filter based on actual dates
        // For demo purposes, we'll just return a subset
        return data.slice(0, Math.floor(data.length / 2));
      }
      return data;
    default:
      return data;
  }
};

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const userRole = getEffectiveRole(
    currentUser?.email || null,
    (currentUser as any)?.role || null,
  );

  const isAdmin = userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN;
  const isManager = userRole === UserRole.MANAGER;
  
  // State for date range filtering
  const [dateRange, setDateRange] = useState("30days");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Filter data based on selected date range
  const filteredSalesData = filterDataByDateRange(dailySalesData, dateRange, startDate, endDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin'}
          </p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Select value={dateRange} onValueChange={(value) => {
            setDateRange(value);
            if (value !== "custom") {
              setStartDate(undefined);
              setEndDate(undefined);
            }
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {dateRange === "custom" && (
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  {startDate && endDate
                    ? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`
                    : "Select dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="range"
                  selected={{
                    from: startDate,
                    to: endDate,
                  }}
                  onSelect={(range) => {
                    setStartDate(range?.from);
                    setEndDate(range?.to);
                    if (range?.from && range?.to) {
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
          
          <Button variant="ghost" size="icon" onClick={() => {
            // Refresh data - in a real app, this would fetch fresh data
            // For demo purposes, we'll just reset the date range
            setDateRange("30days");
            setStartDate(undefined);
            setEndDate(undefined);
          }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </span>
                  <span className="text-2xl font-bold">{metric.value}</span>
                </div>
                <div className={`rounded-full p-2 ${metric.color}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span
                  className={
                    metric.changeType === "positive"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {metric.change}
                </span>
                <span className="ml-2 text-sm text-muted-foreground">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Trend Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
              Sales Trend
            </CardTitle>
            <CardDescription>
              Daily sales for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredSalesData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      // Show fewer ticks for better readability
                      const index = filteredSalesData.findIndex(item => item.date === value);
                      return index % 3 === 0 ? value : '';
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`£${value}`, 'Sales']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Product Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-green-500" />
              Product Categories
            </CardTitle>
            <CardDescription>
              Sales distribution by product category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={productCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Customer Acquisition & Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Customer Acquisition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-purple-500" />
              Customer Acquisition
            </CardTitle>
            <CardDescription>
              New customers by acquisition channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={customerAcquisitionData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="organic" stackId="a" fill="#8884d8" name="Organic" />
                  <Bar dataKey="paid" stackId="a" fill="#82ca9d" name="Paid" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Detailed Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-amber-500" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Detailed business performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {detailedMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <div className="font-medium">{metric.title}</div>
                    <div className="text-sm text-muted-foreground">{metric.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{metric.value}</div>
                    <div className={metric.changeType === "positive" ? "text-green-500 flex items-center justify-end" : "text-red-500 flex items-center justify-end"}>
                      {metric.changeType === "positive" ? (
                        <ArrowUpRight className="mr-1 h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-4 w-4" />
                      )}
                      {metric.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(isAdmin || isManager) && (
        <div className="grid gap-4 md:grid-cols-2">
          {alerts.map((alert, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-muted p-2">
                    <alert.icon className={`h-5 w-5 ${alert.color}`} />
                  </div>
                  <div>
                    <h3 className="font-medium">{alert.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {alert.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Access */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {dashboardCards.map((card, index) => (
            <Card key={index} className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={`rounded-full p-2 ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="min-h-[2.5rem]">
                  {card.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={card.href}>Manage {card.title}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="leads">Recent Leads</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Order ID</th>
                        <th className="text-left p-4 font-medium">Customer</th>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Amount</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="p-4">{order.id}</td>
                          <td className="p-4">{order.customer}</td>
                          <td className="p-4">{order.date}</td>
                          <td className="p-4">£{order.amount.toFixed(2)}</td>
                          <td className="p-4">
                            <span className={order.statusColor}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8"
                            >
                              <Link href={`/admin/orders?id=${order.id}`}>
                                View
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end p-4">
                <Button asChild variant="outline">
                  <Link href="/admin/orders">View All Orders</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="leads" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Lead ID</th>
                        <th className="text-left p-4 font-medium">Name</th>
                        <th className="text-left p-4 font-medium">Contact</th>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLeads.map((lead) => (
                        <tr key={lead.id} className="border-b">
                          <td className="p-4">{lead.id}</td>
                          <td className="p-4">{lead.name}</td>
                          <td className="p-4">
                            <div>{lead.email}</div>
                            <div className="text-sm text-muted-foreground">
                              {lead.phone}
                            </div>
                          </td>
                          <td className="p-4">{lead.date}</td>
                          <td className="p-4">
                            <span className={lead.statusColor}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8"
                            >
                              <Link href={`/admin/crm/lead/${lead.id}`}>
                                View
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end p-4">
                <Button asChild variant="outline">
                  <Link href="/admin/crm/leads">View All Leads</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
