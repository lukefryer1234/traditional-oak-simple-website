"use client";

import React, { useState } from "react";
import Link from "next/link";
import { withPermissionCheck } from "@/components/with-permission-check";
import { AdminSection, PermissionAction } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Calendar,
  Eye,
  Trash2,
  RefreshCw,
  CheckCheck,
  Bell,
  Loader2
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/notifications/use-notifications";
import { FirestoreNotification } from "@/lib/firestore-schema";
import { NotificationType, getNotificationIcon } from "@/components/admin/notifications-dropdown";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Extended notification interface with formatted properties
interface ExtendedNotification extends FirestoreNotification {
  formattedTimestamp?: string;
}

// Helper function to get badge variant based on notification type
const getNotificationTypeBadgeVariant = (type: NotificationType | string): "default" | "secondary" | "outline" | "destructive" => {
  switch (type) {
    case "order": return "default";
    case "stock": return "destructive";
    case "user": return "secondary";
    case "system": return "outline";
    case "payment": return "default";
    default: return "outline";
  }
};

// Helper function to format timestamp
const formatTimestamp = (timestamp: string | Date | undefined): string => {
  if (!timestamp) return 'N/A';
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return format(date, "MMM d, yyyy HH:mm:ss");
  } catch (error) {
    return 'Invalid date';
  }
};

// Helper function to get notification type display name
const getNotificationTypeDisplay = (type: NotificationType | string): string => {
  switch (type) {
    case "order": return "Order";
    case "stock": return "Stock";
    case "user": return "User";
    case "system": return "System";
    case "payment": return "Payment";
    default: return type as string;
  }
};

/**
 * Notifications Page Component
 */
function NotificationsPage() {
  // Use the real-time notifications hook
  const { 
    notifications: firestoreNotifications, 
    isLoading, 
    error, 
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotifications();
  
  // Process notifications to add formatted properties
  const notifications: ExtendedNotification[] = firestoreNotifications.map(notification => ({
    ...notification,
    formattedTimestamp: formatTimestamp(notification.createdAt)
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  // Filtering logic
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      (notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (notification.message?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'read' && notification.read) ||
      (filterStatus === 'unread' && !notification.read);
    
    // Date filtering
    let matchesDate = true;
    if (date && notification.createdAt) {
      const notificationDate = typeof notification.createdAt === 'string' 
        ? new Date(notification.createdAt) 
        : notification.createdAt;
      matchesDate = notificationDate.toDateString() === date.toDateString();
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
    setDate(undefined);
  };

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  // Handle clear all notifications
  const handleClearAllNotifications = async () => {
    await clearAllNotifications();
  };

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            View and manage your notifications
          </p>
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  notifications from your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearAllNotifications}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Notifications</CardTitle>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-8 sm:w-[250px]"
                />
              </div>
              
              {/* Date Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-shrink-0 justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Filter by Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              {/* Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-shrink-0">
                    <Filter className="mr-2 h-4 w-4" />
                    {filterType === 'all' ? 'Filter by Type' : getNotificationTypeDisplay(filterType)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterType('all')}>All Types</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('order')}>Order</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('stock')}>Stock</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('user')}>User</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('system')}>System</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('payment')}>Payment</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-shrink-0">
                    <Filter className="mr-2 h-4 w-4" />
                    {filterStatus === 'all' ? 'Filter by Status' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('read')}>Read</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('unread')}>Unread</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" size="icon" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading notifications...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-destructive">
              <p>Error loading notifications: {error.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <TableRow 
                      key={notification.id}
                      className={cn(!notification.read && "bg-muted/50")}
                    >
                      <TableCell>
                        <Badge variant={getNotificationTypeBadgeVariant(notification.type)}>
                          <div className="flex items-center gap-1">
                            {getNotificationIcon(notification.type)}
                            <span>{getNotificationTypeDisplay(notification.type)}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-muted-foreground">{notification.message}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{notification.formattedTimestamp}</div>
                      </TableCell>
                      <TableCell>
                        {notification.read ? (
                          <Badge variant="outline" className="bg-muted">Read</Badge>
                        ) : (
                          <Badge>Unread</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!notification.read && notification.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id as string)}
                              className="h-8 px-2"
                            >
                              <CheckCheck className="h-4 w-4" />
                              <span className="sr-only">Mark as read</span>
                            </Button>
                          )}
                          
                          {notification.link && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 px-2"
                            >
                              <Link href={notification.link}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this notification?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteNotification(notification.id as string)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {notifications.length === 0 
                        ? (
                          <div className="flex flex-col items-center justify-center">
                            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                            <p>No notifications yet</p>
                            <p className="text-sm text-muted-foreground">Notifications will appear here when you receive them</p>
                          </div>
                        ) 
                        : "No notifications found matching your criteria."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Export with permission check
export default withPermissionCheck(
  NotificationsPage,
  AdminSection.DASHBOARD,
  PermissionAction.VIEW,
);
