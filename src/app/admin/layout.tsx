"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Loader2, LayoutDashboard, Package, Settings, 
  Users, BarChart, FileText, Image, DollarSign, Truck, 
  Bell, WrenchIcon, CreditCard, Sparkles, PieChart, MessageSquare } from 'lucide-react';
import { NotificationsDropdown } from '@/components/admin/notifications-dropdown';
import { GlobalSearch } from '@/components/admin/global-search';
import { UserPreferences } from '@/components/admin/user-preferences';
import { KeyboardShortcuts } from '@/components/admin/keyboard-shortcuts';
import { HelpDocumentation } from '@/components/admin/help-documentation';
import { useAuth } from '@/context/auth-context';
import { getEffectiveRole, canViewSection, AdminSection, UserRole } from '@/lib/permissions';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarMenuSub, 
  SidebarMenuSubButton, 
  SidebarMenuSubItem, 
  SidebarProvider, 
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define admin menu structure
interface AdminMenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
  section: AdminSection;
  submenu?: AdminMenuItem[];
}

const adminMenuItems: AdminMenuItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    section: AdminSection.DASHBOARD,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart,
    section: AdminSection.DASHBOARD,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: Package,
    section: AdminSection.ORDERS,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
    section: AdminSection.PRODUCTS,
    submenu: [
      {
        title: 'All Products',
        href: '/admin/products',
        icon: Package,
        section: AdminSection.PRODUCTS,
      },
      {
        title: 'Configurable Prices',
        href: '/admin/products/configurable-prices',
        icon: DollarSign,
        section: AdminSection.PRODUCTS_PRICES,
      },
      {
        title: 'Unit Prices',
        href: '/admin/products/unit-prices',
        icon: DollarSign,
        section: AdminSection.PRODUCTS_PRICES,
      },
      {
        title: 'Product Photos',
        href: '/admin/products/photos',
        icon: Image,
        section: AdminSection.PRODUCTS_PHOTOS,
      },
      {
        title: 'Special Deals',
        href: '/admin/products/special-deals',
        icon: Sparkles,
        section: AdminSection.PRODUCTS_SPECIAL_DEALS,
      },
    ],
  },
  {
    title: 'Content',
    href: '/admin/content',
    icon: FileText,
    section: AdminSection.CONTENT,
    submenu: [
      {
        title: 'Gallery',
        href: '/admin/content/gallery',
        icon: Image,
        section: AdminSection.CONTENT_GALLERY,
      },
      {
        title: 'SEO',
        href: '/admin/content/seo',
        icon: BarChart,
        section: AdminSection.CONTENT_SEO,
      },
      {
        title: 'Custom Order Text',
        href: '/admin/content/custom-order-text',
        icon: FileText,
        section: AdminSection.CONTENT,
      },
    ],
  },
  {
    title: 'CRM',
    href: '/admin/crm',
    icon: MessageSquare,
    section: AdminSection.CRM,
    submenu: [
      {
        title: 'Leads',
        href: '/admin/crm/leads',
        icon: Users,
        section: AdminSection.CRM_LEADS,
      },
    ],
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    section: AdminSection.USERS,
    submenu: [
      {
        title: 'User Management',
        href: '/admin/users/management',
        icon: Users,
        section: AdminSection.USERS,
      },
    ],
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    section: AdminSection.SETTINGS,
    submenu: [
      {
        title: 'Company',
        href: '/admin/settings/company',
        icon: FileText,
        section: AdminSection.SETTINGS_COMPANY,
      },
      {
        title: 'Legal Documents',
        href: '/admin/legal',
        icon: FileText,
        section: AdminSection.SETTINGS_COMPANY,
      },
      {
        title: 'Financial',
        href: '/admin/settings/financial',
        icon: DollarSign,
        section: AdminSection.SETTINGS_FINANCIAL,
      },
      {
        title: 'Delivery',
        href: '/admin/settings/delivery',
        icon: Truck,
        section: AdminSection.SETTINGS_DELIVERY,
      },
      {
        title: 'Payments',
        href: '/admin/settings/payments',
        icon: CreditCard,
        section: AdminSection.SETTINGS_PAYMENTS,
      },
      {
        title: 'Analytics',
        href: '/admin/settings/analytics',
        icon: PieChart,
        section: AdminSection.SETTINGS_ANALYTICS,
      },
      {
        title: 'Notifications',
        href: '/admin/settings/notifications',
        icon: Bell,
        section: AdminSection.SETTINGS_NOTIFICATIONS,
      },
      {
        title: 'Permissions',
        href: '/admin/settings/permissions',
        icon: ShieldAlert,
        section: AdminSection.SETTINGS_ROLES,
      },
    ],
  },
  {
    title: 'Tools',
    href: '/admin/tools',
    icon: WrenchIcon,
    section: AdminSection.TOOLS,
    submenu: [
      {
        title: 'Exports',
        href: '/admin/tools/exports',
        icon: FileText,
        section: AdminSection.TOOLS_EXPORTS,
      },
    ],
  },
  {
    title: 'Activity Logs',
    href: '/admin/activity-logs',
    icon: FileText,
    section: AdminSection.SETTINGS,
  },
  {
    title: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    section: AdminSection.DASHBOARD,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading: authLoading, currentUser } = useAuth();
  const pathname = usePathname();

  // Get user role
  const userRole = getEffectiveRole(
    currentUser?.email || null,
    (currentUser as any)?.role || null,
  );

  // Check if user is admin
  const isAdmin = userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN;

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-muted/20">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading User Information...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-muted/20">
        <div className="w-full max-w-lg bg-card shadow-xl rounded-lg">
          <div className="text-center p-6">
            <ShieldAlert className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You do not have permission to view this page. Please log in with an administrator account.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild>
                <Link href="/login?redirect=/admin">Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Return to Homepage</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter menu items based on user permissions
  const filteredMenuItems = adminMenuItems.filter(item => 
    canViewSection(userRole, item.section)
  ).map(item => ({
    ...item,
    submenu: item.submenu?.filter(subItem => 
      canViewSection(userRole, subItem.section)
    )
  }));

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              <div className="font-semibold text-lg">Oak Structures Admin</div>
              <div className="ml-auto flex items-center gap-2">
                <GlobalSearch />
                <NotificationsDropdown />
                <UserPreferences />
                <KeyboardShortcuts />
                <HelpDocumentation />
                <SidebarTrigger />
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <SidebarMenu>
                {filteredMenuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === item.href ||
                        (item.submenu && item.submenu.some(subItem => pathname === subItem.href))
                      }
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-2" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    
                    {item.submenu && item.submenu.length > 0 && (
                      <SidebarMenuSub>
                        {item.submenu.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.href}
                            >
                              <Link href={subItem.href}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarContent>
          
          <SidebarFooter>
            <Separator />
            <div className="p-2">
              <div className="flex items-center gap-2 p-2">
                <Avatar>
                  <AvatarImage src={currentUser?.photoURL || undefined} />
                  <AvatarFallback>
                    {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {currentUser?.displayName || currentUser?.email || 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {userRole}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  asChild 
                  className="ml-auto"
                >
                  <Link href="/">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  </Link>
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
