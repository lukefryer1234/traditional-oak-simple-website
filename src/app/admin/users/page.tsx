"use client";

import React from "react";
import Link from "next/link";
import { Users, UserPlus, UserCog } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { getEffectiveRole, canViewSection, AdminSection, UserRole } from "@/lib/permissions";

// User management category definition
interface UserManagementCategory {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  section: AdminSection;
  color: string;
}

// Define user management categories
const userManagementCategories: UserManagementCategory[] = [
  {
    title: "User Management",
    description: "View and manage user accounts, roles, and permissions",
    icon: UserCog,
    href: "/admin/users/management",
    section: AdminSection.USERS,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Add New User",
    description: "Create new user accounts and assign roles",
    icon: UserPlus,
    href: "/admin/users/management?action=new",
    section: AdminSection.USERS,
    color: "bg-green-500/10 text-green-500",
  },
];

// Mock data for recent users
const recentUsers = [
  {
    id: "user-001",
    name: "John Smith",
    email: "john@example.com",
    role: "Customer",
    lastLogin: "2025-05-23",
  },
  {
    id: "user-002",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "Customer",
    lastLogin: "2025-05-22",
  },
  {
    id: "user-003",
    name: "Michael Brown",
    email: "michael@example.com",
    role: "Manager",
    lastLogin: "2025-05-21",
  },
  {
    id: "user-004",
    name: "Emma Wilson",
    email: "emma@example.com",
    role: "Admin",
    lastLogin: "2025-05-20",
  },
  {
    id: "user-005",
    name: "David Thompson",
    email: "david@example.com",
    role: "Customer",
    lastLogin: "2025-05-19",
  },
];

export default function UsersPage() {
  const { currentUser } = useAuth();
  const userRole = getEffectiveRole(
    currentUser?.email || null,
    (currentUser as any)?.role || null,
  );

  // Check if user has permission to view this section
  const canViewUsers = canViewSection(userRole, AdminSection.USERS);

  if (!canViewUsers) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {userManagementCategories.map((category) => (
          <Card key={category.href} className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className={`rounded-full p-2 ${category.color}`}>
                  <category.icon className="h-5 w-5" />
                </div>
                <CardTitle>{category.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="min-h-[2.5rem]">
                {category.description}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={category.href}>{category.title}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recently Active Users</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium">Last Login</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-4">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span className={
                          user.role === "Admin" 
                            ? "text-blue-500" 
                            : user.role === "Manager" 
                              ? "text-amber-500" 
                              : "text-slate-500"
                        }>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">{user.lastLogin}</td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8"
                        >
                          <Link href={`/admin/users/management?id=${user.id}`}>
                            Edit
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
              <Link href="/admin/users/management">View All Users</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 border rounded-lg p-6 bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Total Users</h3>
            <p className="text-2xl font-bold">128</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">New This Month</h3>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Active Users</h3>
            <p className="text-2xl font-bold">86</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Admin Users</h3>
            <p className="text-2xl font-bold">3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
