"use client";

import React, { useState, useEffect } from "react";
import { withPermissionCheck } from "@/components/with-permission-check";
import { AdminSection, PermissionAction, UserRole } from "@/lib/permissions";
import { useUsers } from "@/hooks/users/use-users";
import { FirestoreUser } from "@/lib/firestore-schema";
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  Trash2, 
  Edit, 
  ShieldAlert,
  Mail,
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
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Extended user interface with display properties
interface ExtendedUser extends FirestoreUser {
  displayName?: string;
  formattedLastLogin?: string;
  formattedCreatedAt?: string;
}

// Helper function to get badge variant based on role
const getRoleBadgeVariant = (role: UserRole | string): "default" | "secondary" | "outline" | "destructive" => {
  switch (role) {
    case UserRole.SUPER_ADMIN: return "destructive";
    case UserRole.ADMIN: return "default";
    case UserRole.MANAGER: return "secondary";
    default: return "outline";
  }
};

// Helper function to get badge variant based on status
const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case 'active': return "secondary";
    case 'inactive': return "outline";
    case 'pending': return "default";
    default: return "outline";
  }
};

// Helper function to format date
const formatDate = (date: string | Date | undefined): string => {
  if (!date) return 'N/A';
  try {
    return typeof date === 'string' 
      ? format(new Date(date), 'yyyy-MM-dd')
      : format(date, 'yyyy-MM-dd');
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * User Management Page Component
 */
function UserManagementPage() {
  // Use the real-time users hook
  const { 
    users: firestoreUsers, 
    isLoading, 
    error, 
    createUser, 
    updateUser, 
    deleteUser 
  } = useUsers();
  
  // Process users to add display properties
  const processedUsers: ExtendedUser[] = firestoreUsers.map(user => ({
    ...user,
    displayName: user.displayName || user.email.split('@')[0],
    formattedLastLogin: formatDate(user.lastLogin),
    formattedCreatedAt: formatDate(user.createdAt)
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | string | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string | 'all'>('all');
  
  // For the edit/create user dialog
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  
  // Form state for new/edit user
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    role: UserRole.CUSTOMER,
    status: 'active' as 'active' | 'inactive' | 'pending'
  });

  // Filtering logic
  const filteredUsers = processedUsers.filter(user => {
    const matchesSearch = 
      (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      displayName: '',
      email: '',
      role: UserRole.CUSTOMER,
      status: 'active'
    });
  };

  // Open create user dialog
  const handleCreateUser = () => {
    setIsEditMode(false);
    setCurrentUser(null);
    resetFormData();
  };

  // Open edit user dialog
  const handleEditUser = (user: ExtendedUser) => {
    setIsEditMode(true);
    setCurrentUser(user);
    setFormData({
      displayName: user.displayName || '',
      email: user.email,
      role: user.role as UserRole,
      status: user.status as 'active' | 'inactive' | 'pending'
    });
  };

  // Handle form input changes
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save user (create or update)
  const handleSaveUser = async () => {
    if (isEditMode && currentUser) {
      // Update existing user
      await updateUser(currentUser.id as string, {
        displayName: formData.displayName,
        email: formData.email,
        role: formData.role,
        status: formData.status
      });
    } else {
      // Create new user
      await createUser({
        displayName: formData.displayName,
        email: formData.email,
        role: formData.role,
        status: formData.status
      });
    }
    
    resetFormData();
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  // Send password reset email
  const handlePasswordReset = (email: string) => {
    // This would call an API to send a password reset email
    toast({
      title: "Password Reset Email Sent",
      description: `A password reset link has been sent to ${email}.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        {/* Create User Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={handleCreateUser}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit User' : 'Create New User'}</DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? "Update user details and permissions." 
                  : "Add a new user to the system."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="displayName" className="text-right">
                  Name
                </Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleFormChange('displayName', e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleFormChange('role', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                    <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                    <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'active' | 'inactive' | 'pending') => handleFormChange('status', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleSaveUser}>Save</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Users</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-8 sm:w-[250px] lg:w-[300px]"
                />
              </div>
              
              {/* Role Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-shrink-0">
                    <Filter className="mr-2 h-4 w-4" />
                    {filterRole === 'all' ? 'Filter Role' : filterRole}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterRole('all')}>All Roles</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole(UserRole.SUPER_ADMIN)}>Super Admin</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole(UserRole.ADMIN)}>Admin</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole(UserRole.MANAGER)}>Manager</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole(UserRole.CUSTOMER)}>Customer</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-shrink-0">
                    <Filter className="mr-2 h-4 w-4" />
                    {filterStatus === 'all' ? 'Filter Status' : filterStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>All Statuses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('active')}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>Inactive</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('pending')}>Pending</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-destructive">
              <p>Error loading users: {error.message}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.displayName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.formattedLastLogin || 'Never'}</TableCell>
                      <TableCell>{user.formattedCreatedAt || 'Unknown'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">User Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            
                            {/* Edit User */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    handleEditUser(user);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit User
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Edit User</DialogTitle>
                                  <DialogDescription>
                                    Update user details and permissions.
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-displayName" className="text-right">
                                      Name
                                    </Label>
                                    <Input
                                      id="edit-displayName"
                                      value={formData.displayName}
                                      onChange={(e) => handleFormChange('displayName', e.target.value)}
                                      className="col-span-3"
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-email" className="text-right">
                                      Email
                                    </Label>
                                    <Input
                                      id="edit-email"
                                      type="email"
                                      value={formData.email}
                                      onChange={(e) => handleFormChange('email', e.target.value)}
                                      className="col-span-3"
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-role" className="text-right">
                                      Role
                                    </Label>
                                    <Select 
                                      value={formData.role} 
                                      onValueChange={(value) => handleFormChange('role', value)}
                                    >
                                      <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a role" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                                        <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                                        <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                                        <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-status" className="text-right">
                                      Status
                                    </Label>
                                    <Select 
                                      value={formData.status} 
                                      onValueChange={(value: 'active' | 'inactive' | 'pending') => handleFormChange('status', value)}
                                    >
                                      <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <DialogClose asChild>
                                    <Button onClick={handleSaveUser}>Save Changes</Button>
                                  </DialogClose>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Reset Password */}
                            <DropdownMenuItem onClick={() => handlePasswordReset(user.email)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Password Reset
                            </DropdownMenuItem>
                            
                            {/* Change Role */}
                            <DropdownMenuItem>
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              Manage Permissions
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Delete User */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  className="text-destructive" 
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user
                                    account and remove their data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteUser(user.id as string)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No users found matching your criteria.
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
  UserManagementPage,
  AdminSection.USERS,
  PermissionAction.VIEW,
);
