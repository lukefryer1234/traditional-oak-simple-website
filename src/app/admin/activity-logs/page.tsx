"use client";

import React, { useState } from "react";
import { withPermissionCheck } from "@/components/with-permission-check";
import { AdminSection, PermissionAction, UserRole } from "@/lib/permissions";
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
  Download,
  RefreshCw,
  AlertCircle,
  Loader2,
  Trash2
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useActivityLogs } from "@/hooks/activity-logs/use-activity-logs";
import { FirestoreActivityLog } from "@/lib/firestore-schema";
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
import { toast } from "@/hooks/use-toast";

// Activity log types
type ActivityType = 
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'password_reset'
  | 'role_change'
  | 'settings_change'
  | 'view_sensitive';

// Activity log entity types
type EntityType = 
  | 'user'
  | 'order'
  | 'product'
  | 'content'
  | 'settings'
  | 'system';

// Extended activity log interface with formatted properties
interface ExtendedActivityLog extends FirestoreActivityLog {
  formattedTimestamp?: string;
}

// Helper function to get badge variant based on activity type
const getActivityTypeBadgeVariant = (type: ActivityType): "default" | "secondary" | "outline" | "destructive" => {
  switch (type) {
    case 'create': return "default";
    case 'update': return "secondary";
    case 'delete': return "destructive";
    case 'role_change': return "destructive";
    case 'settings_change': return "destructive";
    case 'view_sensitive': return "destructive";
    case 'password_reset': return "destructive";
    case 'login': return "outline";
    case 'logout': return "outline";
    case 'export': return "outline";
    case 'import': return "outline";
    default: return "outline";
  }
};

// Helper function to get badge variant based on severity
const getSeverityBadgeVariant = (severity: string): "default" | "secondary" | "outline" | "destructive" => {
  switch (severity) {
    case 'low': return "outline";
    case 'medium': return "secondary";
    case 'high': return "destructive";
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

// Helper function to get activity type display name
const getActivityTypeDisplay = (type: ActivityType): string => {
  switch (type) {
    case 'login': return "Login";
    case 'logout': return "Logout";
    case 'create': return "Create";
    case 'update': return "Update";
    case 'delete': return "Delete";
    case 'export': return "Export";
    case 'import': return "Import";
    case 'password_reset': return "Password Reset";
    case 'role_change': return "Role Change";
    case 'settings_change': return "Settings Change";
    case 'view_sensitive': return "View Sensitive Data";
    default: return type;
  }
};

// Helper function to get entity type display name
const getEntityTypeDisplay = (type: EntityType): string => {
  switch (type) {
    case 'user': return "User";
    case 'order': return "Order";
    case 'product': return "Product";
    case 'content': return "Content";
    case 'settings': return "Settings";
    case 'system': return "System";
    default: return type;
  }
};

/**
 * Activity Logs Page Component
 */
function ActivityLogsPage() {
  // Use the real-time activity logs hook
  const { 
    activityLogs: firestoreLogs, 
    isLoading, 
    error, 
    deleteActivityLog,
    clearActivityLogs
  } = useActivityLogs();
  
  // Process logs to add formatted properties
  const logs: ExtendedActivityLog[] = firestoreLogs.map(log => ({
    ...log,
    formattedTimestamp: formatTimestamp(log.createdAt)
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivityType, setFilterActivityType] = useState<ActivityType | 'all'>('all');
  const [filterEntityType, setFilterEntityType] = useState<EntityType | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<string | 'all'>('all');
  const [filterUser, setFilterUser] = useState<string | 'all'>('all');
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  // Get unique users for filtering
  const uniqueUsers = Array.from(new Set(logs.map(log => log.userName || '')));
  
  // Filtering logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (log.entityId && log.entityId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesActivityType = filterActivityType === 'all' || log.activityType === filterActivityType;
    const matchesEntityType = filterEntityType === 'all' || log.entityType === filterEntityType;
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchesUser = filterUser === 'all' || log.userName === filterUser;
    
    // Date filtering
    let matchesDate = true;
    if (date && log.createdAt) {
      const logDate = typeof log.createdAt === 'string' ? new Date(log.createdAt) : log.createdAt;
      matchesDate = logDate.toDateString() === date.toDateString();
    }
    
    return matchesSearch && matchesActivityType && matchesEntityType && matchesSeverity && matchesUser && matchesDate;
  });

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterActivityType('all');
    setFilterEntityType('all');
    setFilterSeverity('all');
    setFilterUser('all');
    setDate(undefined);
  };

  // Export logs as CSV
  const exportLogs = () => {
    // Create CSV content
    const headers = ["Timestamp", "User", "Email", "Activity", "Entity", "Entity ID", "Description", "Severity", "IP Address"];
    const csvRows = [headers];
    
    filteredLogs.forEach(log => {
      const row = [
        log.formattedTimestamp || '',
        log.userName || '',
        log.userEmail || '',
        log.activityType || '',
        log.entityType || '',
        log.entityId || '',
        log.description || '',
        log.severity || '',
        log.ipAddress || ''
      ];
      csvRows.push(row);
    });
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Logs Exported",
      description: `${filteredLogs.length} log entries exported to CSV.`
    });
  };

  // Handle delete log
  const handleDeleteLog = async (logId: string) => {
    await deleteActivityLog(logId);
  };

  // Handle clear all logs
  const handleClearLogs = async () => {
    await clearActivityLogs();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground">
            Track and monitor administrator activities
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetFilters}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
          <Button variant="outline" onClick={exportLogs} disabled={filteredLogs.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Logs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all activity logs
                  from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearLogs}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete All Logs
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>System Activity</CardTitle>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-8 sm:w-[250px] lg:w-[300px]"
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
              
              {/* Activity Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-shrink-0">
                    <Filter className="mr-2 h-4 w-4" />
                    {filterActivityType === 'all' ? 'Activity Type' : getActivityTypeDisplay(filterActivityType)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Activity</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterActivityType('all')}>All Activities</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterActivityType('login')}>Login</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterActivityType('logout')}>Logout</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterActivityType('create')}>Create</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterActivityType('update')}>Update</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterActivityType('delete')}>Delete</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterActivityType('export')}>Export</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterActivityType('import')}>Import</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterActivityType('password_reset')}>Password Reset</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterActivityType('role_change')}>Role Change</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterActivityType('settings_change')}>Settings Change</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterActivityType('view_sensitive')}>View Sensitive Data</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Entity Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-shrink-0">
                    <Filter className="mr-2 h-4 w-4" />
                    {filterEntityType === 'all' ? 'Entity Type' : getEntityTypeDisplay(filterEntityType)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Entity</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterEntityType('all')}>All Entities</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterEntityType('user')}>User</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterEntityType('order')}>Order</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterEntityType('product')}>Product</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterEntityType('content')}>Content</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterEntityType('settings')}>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterEntityType('system')}>System</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Severity Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-shrink-0">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    {filterSeverity === 'all' ? 'Severity' : filterSeverity.charAt(0).toUpperCase() + filterSeverity.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Severity</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterSeverity('all')}>All Severities</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterSeverity('low')}>Low</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterSeverity('medium')}>Medium</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterSeverity('high')}>High</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* User Filter */}
              {uniqueUsers.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-shrink-0">
                      <Filter className="mr-2 h-4 w-4" />
                      {filterUser === 'all' ? 'User' : filterUser}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by User</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilterUser('all')}>All Users</DropdownMenuItem>
                    {uniqueUsers.map((user) => (
                      <DropdownMenuItem key={user} onClick={() => setFilterUser(user)}>
                        {user}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading activity logs...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-destructive">
              <p>Error loading activity logs: {error.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">{log.formattedTimestamp}</TableCell>
                      <TableCell>
                        <div className="font-medium">{log.userName || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{log.userEmail || 'No email'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActivityTypeBadgeVariant(log.activityType as ActivityType)}>
                          {getActivityTypeDisplay(log.activityType as ActivityType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>{getEntityTypeDisplay(log.entityType as EntityType)}</div>
                        {log.entityId && (
                          <div className="text-xs text-muted-foreground">ID: {log.entityId}</div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{log.description}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityBadgeVariant(log.severity)}>
                          {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete Log</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this log entry?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this
                                  activity log entry from the database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteLog(log.id as string)}
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
                    <TableCell colSpan={7} className="h-24 text-center">
                      {logs.length === 0 
                        ? "No activity logs found. System activities will be recorded here." 
                        : "No activity logs found matching your criteria."}
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
  ActivityLogsPage,
  AdminSection.SETTINGS,
  PermissionAction.VIEW,
);
