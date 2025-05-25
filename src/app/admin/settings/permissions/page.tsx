"use client";

import React, { useState } from "react";
import { withPermissionCheck } from "@/components/with-permission-check";
import { AdminSection, PermissionAction, UserRole } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  Trash2, 
  Edit, 
  ShieldAlert,
  Clock,
  Calendar,
  Globe,
  Wifi,
  Lock,
  Unlock,
  RefreshCw,
  Loader2
} from "lucide-react";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useUsers } from "@/hooks/users/use-users";
import { useUserPermissions } from "@/hooks/permissions/use-user-permissions";
import { 
  Permission, 
  PermissionGroup, 
  PERMISSION_GROUPS,
  AccessRestriction,
  AccessRestrictionType,
  TimeRestriction,
  IpRestriction,
  GeoRestriction,
  UserPermissionAssignment,
  createPermissionKey
} from "@/lib/enhanced-permissions";

/**
 * Permissions Management Page Component
 */
function PermissionsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedPermissionGroup, setSelectedPermissionGroup] = useState<string | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  
  // New restriction form state
  const [newRestrictionType, setNewRestrictionType] = useState<AccessRestrictionType>(AccessRestrictionType.IP_ALLOW);
  const [ipAddresses, setIpAddresses] = useState('');
  const [timeRestriction, setTimeRestriction] = useState<TimeRestriction>({
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    startHour: 9,
    startMinute: 0,
    endHour: 17,
    endMinute: 0,
    timezone: 'Europe/London'
  });
  const [geoRestriction, setGeoRestriction] = useState<GeoRestriction>({
    countries: ['GB'],
    regions: []
  });
  
  // Fetch users
  const { users, isLoading: isLoadingUsers } = useUsers();
  
  // Fetch user permissions
  const { 
    userPermissions,
    isLoading: isLoadingPermissions,
    updateUserRole,
    grantPermission,
    denyPermission,
    resetPermission,
    addAccessRestriction,
    removeAccessRestriction,
    setExpirationDate: setUserExpirationDate
  } = useUserPermissions();
  
  // Get selected user
  const selectedUser = users.find(user => user.id === selectedUserId);
  
  // Get selected user's permissions
  const selectedUserPermissions = userPermissions.find(
    p => p.userId === selectedUserId
  );
  
  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle user selection
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab("permissions");
    
    // Reset expiration date
    const userPermission = userPermissions.find(p => p.userId === userId);
    setExpirationDate(userPermission?.expiresAt);
  };
  
  // Handle role change
  const handleRoleChange = async (userId: string, role: UserRole) => {
    await updateUserRole(userId, role);
  };
  
  // Handle permission change
  const handlePermissionChange = async (
    permission: Permission,
    status: 'grant' | 'deny' | 'reset'
  ) => {
    if (!selectedUserId) return;
    
    switch (status) {
      case 'grant':
        await grantPermission(selectedUserId, permission);
        break;
      case 'deny':
        await denyPermission(selectedUserId, permission);
        break;
      case 'reset':
        await resetPermission(selectedUserId, permission);
        break;
    }
  };
  
  // Handle adding a new restriction
  const handleAddRestriction = async () => {
    if (!selectedUserId) return;
    
    let restriction: AccessRestriction;
    
    switch (newRestrictionType) {
      case AccessRestrictionType.IP_ALLOW:
      case AccessRestrictionType.IP_DENY:
        restriction = {
          type: newRestrictionType,
          value: {
            ipAddresses: ipAddresses.split(',').map(ip => ip.trim())
          } as IpRestriction
        };
        break;
      case AccessRestrictionType.TIME_ALLOW:
      case AccessRestrictionType.TIME_DENY:
        restriction = {
          type: newRestrictionType,
          value: timeRestriction
        };
        break;
      case AccessRestrictionType.GEO_ALLOW:
      case AccessRestrictionType.GEO_DENY:
        restriction = {
          type: newRestrictionType,
          value: geoRestriction
        };
        break;
      default:
        return;
    }
    
    await addAccessRestriction(selectedUserId, restriction);
  };
  
  // Handle removing a restriction
  const handleRemoveRestriction = async (index: number) => {
    if (!selectedUserId) return;
    
    await removeAccessRestriction(selectedUserId, index);
  };
  
  // Handle setting expiration date
  const handleSetExpirationDate = async () => {
    if (!selectedUserId) return;
    
    await setUserExpirationDate(selectedUserId, expirationDate || null);
  };
  
  // Get permission status
  const getPermissionStatus = (
    permission: Permission,
    userPermission: UserPermissionAssignment | undefined
  ): 'granted' | 'denied' | 'default' => {
    if (!userPermission) return 'default';
    
    const permissionKey = createPermissionKey(permission);
    
    // Check if explicitly granted
    const isGranted = userPermission.customPermissions.granted.some(
      p => createPermissionKey(p) === permissionKey
    );
    
    if (isGranted) return 'granted';
    
    // Check if explicitly denied
    const isDenied = userPermission.customPermissions.denied.some(
      p => createPermissionKey(p) === permissionKey
    );
    
    if (isDenied) return 'denied';
    
    // Default to role-based permission
    return 'default';
  };
  
  // Format restriction for display
  const formatRestriction = (restriction: AccessRestriction): string => {
    switch (restriction.type) {
      case AccessRestrictionType.IP_ALLOW:
        return `Allow only from IPs: ${(restriction.value as IpRestriction).ipAddresses.join(', ')}`;
      case AccessRestrictionType.IP_DENY:
        return `Deny from IPs: ${(restriction.value as IpRestriction).ipAddresses.join(', ')}`;
      case AccessRestrictionType.TIME_ALLOW: {
        const time = restriction.value as TimeRestriction;
        const days = time.daysOfWeek.map(d => 
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]
        ).join(', ');
        return `Allow only during: ${days} ${time.startHour}:${time.startMinute.toString().padStart(2, '0')}-${time.endHour}:${time.endMinute.toString().padStart(2, '0')}`;
      }
      case AccessRestrictionType.TIME_DENY: {
        const time = restriction.value as TimeRestriction;
        const days = time.daysOfWeek.map(d => 
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]
        ).join(', ');
        return `Deny during: ${days} ${time.startHour}:${time.startMinute.toString().padStart(2, '0')}-${time.endHour}:${time.endMinute.toString().padStart(2, '0')}`;
      }
      case AccessRestrictionType.GEO_ALLOW: {
        const geo = restriction.value as GeoRestriction;
        return `Allow only from: ${geo.countries.join(', ')}${geo.regions && geo.regions.length > 0 ? ` (${geo.regions.join(', ')})` : ''}`;
      }
      case AccessRestrictionType.GEO_DENY: {
        const geo = restriction.value as GeoRestriction;
        return `Deny from: ${geo.countries.join(', ')}${geo.regions && geo.regions.length > 0 ? ` (${geo.regions.join(', ')})` : ''}`;
      }
      default:
        return 'Unknown restriction';
    }
  };
  
  // Get restriction icon
  const getRestrictionIcon = (type: AccessRestrictionType) => {
    switch (type) {
      case AccessRestrictionType.IP_ALLOW:
      case AccessRestrictionType.IP_DENY:
        return <Wifi className="h-4 w-4 mr-2" />;
      case AccessRestrictionType.TIME_ALLOW:
      case AccessRestrictionType.TIME_DENY:
        return <Clock className="h-4 w-4 mr-2" />;
      case AccessRestrictionType.GEO_ALLOW:
      case AccessRestrictionType.GEO_DENY:
        return <Globe className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };
  
  // Get permission badge variant
  const getPermissionBadgeVariant = (status: 'granted' | 'denied' | 'default'): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'granted': return "default";
      case 'denied': return "destructive";
      case 'default': return "outline";
    }
  };
  
  // Get permission badge icon
  const getPermissionBadgeIcon = (status: 'granted' | 'denied' | 'default') => {
    switch (status) {
      case 'granted': return <Unlock className="h-3 w-3 mr-1" />;
      case 'denied': return <Lock className="h-3 w-3 mr-1" />;
      case 'default': return null;
    }
  };
  
  // Get permission badge text
  const getPermissionBadgeText = (status: 'granted' | 'denied' | 'default'): string => {
    switch (status) {
      case 'granted': return "Granted";
      case 'denied': return "Denied";
      case 'default': return "Default";
    }
  };
  
  const isLoading = isLoadingUsers || isLoadingPermissions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Permissions Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions" disabled={!selectedUserId}>Permissions</TabsTrigger>
          <TabsTrigger value="restrictions" disabled={!selectedUserId}>Access Restrictions</TabsTrigger>
        </TabsList>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>User Accounts</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {/* Search Input */}
                  <div className="relative flex-grow sm:flex-grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-8 sm:w-[250px] lg:w-[300px]"
                    />
                  </div>
                  
                  {/* Role Filter */}
                  <Select 
                    value={filterRole} 
                    onValueChange={(value: UserRole | 'all') => setFilterRole(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                      <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                      <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                      <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
                      <SelectItem value={UserRole.GUEST}>Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading users...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Custom Permissions</TableHead>
                      <TableHead>Restrictions</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => {
                        const userPermission = userPermissions.find(p => p.userId === user.id);
                        const customPermissionsCount = userPermission 
                          ? userPermission.customPermissions.granted.length + userPermission.customPermissions.denied.length 
                          : 0;
                        const restrictionsCount = userPermission?.accessRestrictions.length || 0;
                        const expiresAt = userPermission?.expiresAt;
                        
                        return (
                          <TableRow key={user.id} className={user.id === selectedUserId ? "bg-muted/50" : ""}>
                            <TableCell>
                              <div className="font-medium">{user.displayName || user.email.split('@')[0]}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={user.role} 
                                onValueChange={(value: UserRole) => handleRoleChange(user.id as string, value)}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                                  <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                                  <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
                                  <SelectItem value={UserRole.GUEST}>Guest</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {customPermissionsCount > 0 ? (
                                <Badge variant="secondary">{customPermissionsCount} custom permissions</Badge>
                              ) : (
                                <span className="text-muted-foreground">None</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {restrictionsCount > 0 ? (
                                <Badge variant="secondary">{restrictionsCount} restrictions</Badge>
                              ) : (
                                <span className="text-muted-foreground">None</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {expiresAt ? (
                                <Badge variant="outline">
                                  {format(new Date(expiresAt), 'MMM d, yyyy')}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">Never</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSelectUser(user.id as string)}
                              >
                                <ShieldAlert className="h-4 w-4 mr-2" />
                                Manage Permissions
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No users found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          {selectedUser && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedUser.displayName || selectedUser.email.split('@')[0]}
                  </h2>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
                <Button variant="outline" onClick={() => setActiveTab("users")}>
                  Back to Users
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Permission Groups */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Permission Groups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {PERMISSION_GROUPS.map(group => (
                        <Button
                          key={group.id}
                          variant={selectedPermissionGroup === group.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedPermissionGroup(group.id)}
                        >
                          {group.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Permissions */}
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>
                      {selectedPermissionGroup 
                        ? PERMISSION_GROUPS.find(g => g.id === selectedPermissionGroup)?.name 
                        : "Select a Permission Group"}
                    </CardTitle>
                    <CardDescription>
                      {selectedPermissionGroup 
                        ? PERMISSION_GROUPS.find(g => g.id === selectedPermissionGroup)?.description 
                        : "Select a permission group from the left to manage permissions"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedPermissionGroup ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Permission</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {PERMISSION_GROUPS.find(g => g.id === selectedPermissionGroup)?.permissions.map(permission => {
                            const status = getPermissionStatus(permission, selectedUserPermissions);
                            
                            return (
                              <TableRow key={`${permission.section}:${permission.action}`}>
                                <TableCell>
                                  <div className="font-medium">{permission.action}</div>
                                  <div className="text-xs text-muted-foreground">{permission.section}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getPermissionBadgeVariant(status)}>
                                    <div className="flex items-center">
                                      {getPermissionBadgeIcon(status)}
                                      {getPermissionBadgeText(status)}
                                    </div>
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Change Permission</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handlePermissionChange(permission, 'grant')}>
                                        <Unlock className="h-4 w-4 mr-2" />
                                        Grant Permission
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handlePermissionChange(permission, 'deny')}>
                                        <Lock className="h-4 w-4 mr-2" />
                                        Deny Permission
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handlePermissionChange(permission, 'reset')}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Reset to Default
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex justify-center items-center h-64 text-muted-foreground">
                        Select a permission group from the left to manage permissions
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
        
        {/* Access Restrictions Tab */}
        <TabsContent value="restrictions" className="space-y-4">
          {selectedUser && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedUser.displayName || selectedUser.email.split('@')[0]}
                  </h2>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
                <Button variant="outline" onClick={() => setActiveTab("users")}>
                  Back to Users
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Restrictions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Access Restrictions</CardTitle>
                    <CardDescription>
                      Limit when and where this user can access the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedUserPermissions?.accessRestrictions.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Restriction</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedUserPermissions.accessRestrictions.map((restriction, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="flex items-center">
                                  {getRestrictionIcon(restriction.type)}
                                  <span>{formatRestriction(restriction)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleRemoveRestriction(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex justify-center items-center h-32 text-muted-foreground">
                        No access restrictions set
                      </div>
                    )}
                    
                    {/* Expiration Date */}
                    <div className="mt-6 border-t pt-4">
                      <h3 className="text-sm font-medium mb-2">Access Expiration</h3>
                      <div className="flex items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-[240px] justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {expirationDate ? format(expirationDate, "PPP") : "No expiration date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={expirationDate}
                              onSelect={setExpirationDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Button 
                          variant="outline" 
                          onClick={() => setExpirationDate(undefined)}
                          disabled={!expirationDate}
                        >
                          Clear
                        </Button>
                        <Button onClick={handleSetExpirationDate}>
                          Save
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Add New Restriction */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Restriction</CardTitle>
                    <CardDescription>
                      Create a new access restriction for this user
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="restriction-type">Restriction Type</Label>
                        <Select 
                          value={newRestrictionType} 
                          onValueChange={(value: AccessRestrictionType) => setNewRestrictionType(value)}
                        >
                          <SelectTrigger id="restriction-type">
                            <SelectValue placeholder="Select restriction type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={AccessRestrictionType.IP_ALLOW}>Allow only from IPs</SelectItem>
                            <SelectItem value={AccessRestrictionType.IP_DENY}>Deny from IPs</SelectItem>
                            <SelectItem value={AccessRestrictionType.TIME_ALLOW}>Allow only during times</SelectItem>
                            <SelectItem value={AccessRestrictionType.TIME_DENY}>Deny during times</SelectItem>
                            <SelectItem value={AccessRestrictionType.GEO_ALLOW}>Allow only from locations</SelectItem>
                            <SelectItem value={AccessRestrictionType.GEO_DENY}>Deny from locations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* IP Restriction Fields */}
                      {(newRestrictionType === AccessRestrictionType.IP_ALLOW || 
                        newRestrictionType === AccessRestrictionType.IP_DENY) && (
                        <div>
                          <Label htmlFor="ip-addresses">IP Addresses (comma separated)</Label>
                          <Input
                            id="ip-addresses"
                            value={ipAddresses}
                            onChange={(e) => setIpAddresses(e.target.value)}
                            placeholder="192.168.1.1, 10.0.0.1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter IP addresses separated by commas
                          </p>
                        </div>
                      )}
                      
                      {/* Time Restriction Fields */}
                      {(newRestrictionType === AccessRestrictionType.TIME_ALLOW || 
                        newRestrictionType === AccessRestrictionType.TIME_DENY) && (
                        <div className="space-y-4">
                          <div>
                            <Label>Days of Week</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                <div key={day} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`day-${index}`} 
                                    checked={timeRestriction.daysOfWeek.includes(index)}
                                    onCheckedChange={(checked) => {
                                      const newDays = [...timeRestriction.daysOfWeek];
                                      if (checked) {
                                        if (!newDays.includes(index)) {
                                          newDays.push(index);
                                        }
                                      } else {
                                        const dayIndex = newDays.indexOf(index);
                                        if (dayIndex !== -1) {
                                          newDays.splice(dayIndex, 1);
                                        }
                                      }
                                      setTimeRestriction({
                                        ...timeRestriction,
                                        daysOfWeek: newDays
                                      });
                                    }}
                                  />
                                  <Label htmlFor={`day-${index}`}>{day}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Start Time</Label>
                              <div className="flex items-center gap-2 mt-2">
                                <Input
                                  type="number"
                                  min={0}
                                  max={23}
                                  value={timeRestriction.startHour}
                                  onChange={(e) => setTimeRestriction({
                                    ...timeRestriction,
                                    startHour: parseInt(e.target.value)
                                  })}
                                  className="w-20"
                                />
                                <span>:</span>
                                <Input
                                  type="number"
                                  min={0}
                                  max={59}
                                  value={timeRestriction.startMinute}
                                  onChange={(e) => setTimeRestriction({
                                    ...timeRestriction,
                                    startMinute: parseInt(e.target.value)
                                  })}
                                  className="w-20"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label>End Time</Label>
                              <div className="flex items-center gap-2 mt-2">
                                <Input
                                  type="number"
                                  min={0}
                                  max={23}
                                  value={timeRestriction.endHour}
                                  onChange={(e) => setTimeRestriction({
                                    ...timeRestriction,
                                    endHour: parseInt(e.target.value)
                                  })}
                                  className="w-20"
                                />
                                <span>:</span>
                                <Input
                                  type="number"
                                  min={0}
                                  max={59}
                                  value={timeRestriction.endMinute}
                                  onChange={(e) => setTimeRestriction({
                                    ...timeRestriction,
                                    endMinute: parseInt(e.target.value)
                                  })}
                                  className="w-20"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Geo Restriction Fields */}
                      {(newRestrictionType === AccessRestrictionType.GEO_ALLOW || 
                        newRestrictionType === AccessRestrictionType.GEO_DENY) && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="countries">Countries (comma separated)</Label>
                            <Input
                              id="countries"
                              value={geoRestriction.countries.join(', ')}
                              onChange={(e) => setGeoRestriction({
                                ...geoRestriction,
                                countries: e.target.value.split(',').map(c => c.trim())
                              })}
                              placeholder="GB, US, CA"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter country codes separated by commas
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor="regions">Regions (optional, comma separated)</Label>
                            <Input
                              id="regions"
                              value={geoRestriction.regions?.join(', ') || ''}
                              onChange={(e) => setGeoRestriction({
                                ...geoRestriction,
                                regions: e.target.value ? e.target.value.split(',').map(r => r.trim()) : []
                              })}
                              placeholder="England, Scotland"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter region names separated by commas
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <Button onClick={handleAddRestriction} className="w-full">
                        Add Restriction
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Export with permission check
export default withPermissionCheck(
  PermissionsManagementPage,
  AdminSection.SETTINGS_ROLES,
  PermissionAction.VIEW,
);
