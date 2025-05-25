"use client";

import React from "react";
import Link from "next/link";
import { 
  Settings, 
  FileText, 
  DollarSign, 
  Truck, 
  CreditCard, 
  BarChart, 
  Bell, 
  ShieldAlert 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { getEffectiveRole, canViewSection, AdminSection, UserRole } from "@/lib/permissions";

// Settings category definition
interface SettingsCategory {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  section: AdminSection;
  color: string;
}

// Define all settings categories
const settingsCategories: SettingsCategory[] = [
  {
    title: "Company",
    description: "Manage company information, contact details, and branding",
    icon: FileText,
    href: "/admin/settings/company",
    section: AdminSection.SETTINGS_COMPANY,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Financial",
    description: "Configure VAT rates, pricing rules, and payment settings",
    icon: DollarSign,
    href: "/admin/settings/financial",
    section: AdminSection.SETTINGS_FINANCIAL,
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Delivery",
    description: "Set up delivery zones, rates, and shipping options",
    icon: Truck,
    href: "/admin/settings/delivery",
    section: AdminSection.SETTINGS_DELIVERY,
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    title: "Payments",
    description: "Configure payment gateways and processing options",
    icon: CreditCard,
    href: "/admin/settings/payments",
    section: AdminSection.SETTINGS_PAYMENTS,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Analytics",
    description: "Set up tracking codes and analytics integrations",
    icon: BarChart,
    href: "/admin/settings/analytics",
    section: AdminSection.SETTINGS_ANALYTICS,
    color: "bg-indigo-500/10 text-indigo-500",
  },
  {
    title: "Notifications",
    description: "Configure email templates and notification settings",
    icon: Bell,
    href: "/admin/settings/notifications",
    section: AdminSection.SETTINGS_NOTIFICATIONS,
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    title: "Roles",
    description: "Manage user roles and permissions",
    icon: ShieldAlert,
    href: "/admin/settings/roles",
    section: AdminSection.SETTINGS_ROLES,
    color: "bg-red-500/10 text-red-500",
  },
];

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const userRole = getEffectiveRole(
    currentUser?.email || null,
    (currentUser as any)?.role || null,
  );

  // Filter settings categories based on user permissions
  const filteredCategories = settingsCategories.filter(category => 
    canViewSection(userRole, category.section)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure system settings and preferences
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
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
                <Link href={category.href}>Manage {category.title}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 border rounded-lg p-6 bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">System Information</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Version</h3>
            <p>Oak Structures Admin v1.0.0</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
            <p>May 24, 2025</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Environment</h3>
            <p>Production</p>
          </div>
        </div>
      </div>
    </div>
  );
}
