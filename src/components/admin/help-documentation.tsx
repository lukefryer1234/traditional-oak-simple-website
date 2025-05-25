"use client";

import React, { useState } from "react";
import { 
  HelpCircle, 
  Book, 
  FileText, 
  Video, 
  MessageSquare, 
  ExternalLink,
  Search,
  X,
  ChevronRight
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";

// Help article interface
interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  path?: string; // URL path this article is relevant to
}

// Help category interface
interface HelpCategory {
  id: string;
  name: string;
  icon: React.ElementType;
}

// Mock help categories
const helpCategories: HelpCategory[] = [
  { id: "getting-started", name: "Getting Started", icon: Book },
  { id: "products", name: "Products", icon: FileText },
  { id: "orders", name: "Orders", icon: FileText },
  { id: "users", name: "Users", icon: FileText },
  { id: "settings", name: "Settings", icon: FileText },
  { id: "tutorials", name: "Video Tutorials", icon: Video },
];

// Mock help articles
const helpArticles: HelpArticle[] = [
  {
    id: "dashboard-overview",
    title: "Dashboard Overview",
    content: `
      <h2>Dashboard Overview</h2>
      <p>The admin dashboard provides a comprehensive overview of your business at a glance. Here you can monitor key metrics, recent orders, and important alerts.</p>
      
      <h3>Key Features</h3>
      <ul>
        <li><strong>Key Metrics:</strong> View important business metrics like total sales, new orders, and average order value.</li>
        <li><strong>Recent Orders:</strong> See the most recent orders placed on your site.</li>
        <li><strong>Recent Leads:</strong> Track new customer inquiries and leads.</li>
        <li><strong>Quick Access:</strong> Easily navigate to the most common admin areas.</li>
      </ul>
      
      <h3>Tips</h3>
      <p>Use the date range selector at the top of the dashboard to filter data for specific time periods.</p>
    `,
    category: "getting-started",
    tags: ["dashboard", "overview", "metrics"],
    path: "/admin",
  },
  {
    id: "managing-products",
    title: "Managing Products",
    content: `
      <h2>Managing Products</h2>
      <p>The Products section allows you to manage your product catalog, including adding new products, updating existing ones, and managing product categories.</p>
      
      <h3>Key Features</h3>
      <ul>
        <li><strong>Product List:</strong> View and search all products in your catalog.</li>
        <li><strong>Add/Edit Products:</strong> Create new products or modify existing ones.</li>
        <li><strong>Product Photos:</strong> Manage product images and galleries.</li>
        <li><strong>Pricing:</strong> Set and update product prices, including configurable options.</li>
      </ul>
      
      <h3>Common Tasks</h3>
      <ol>
        <li>To add a new product, click the "Add Product" button in the top-right corner.</li>
        <li>To edit a product, click on its name in the product list.</li>
        <li>To delete a product, select it and click the "Delete" button.</li>
      </ol>
    `,
    category: "products",
    tags: ["products", "catalog", "inventory"],
    path: "/admin/products",
  },
  {
    id: "order-management",
    title: "Order Management",
    content: `
      <h2>Order Management</h2>
      <p>The Orders section allows you to view and manage customer orders, process payments, and handle shipping.</p>
      
      <h3>Order Statuses</h3>
      <ul>
        <li><strong>Pending:</strong> Order received but not yet processed.</li>
        <li><strong>Processing:</strong> Order is being prepared.</li>
        <li><strong>Shipped:</strong> Order has been shipped to the customer.</li>
        <li><strong>Delivered:</strong> Order has been delivered to the customer.</li>
        <li><strong>Cancelled:</strong> Order has been cancelled.</li>
      </ul>
      
      <h3>Common Tasks</h3>
      <ol>
        <li>To view order details, click on the order number in the orders list.</li>
        <li>To update an order's status, select the new status from the dropdown in the order details page.</li>
        <li>To generate an invoice, click the "Generate Invoice" button in the order details page.</li>
      </ol>
    `,
    category: "orders",
    tags: ["orders", "fulfillment", "shipping"],
    path: "/admin/orders",
  },
  {
    id: "user-management",
    title: "User Management",
    content: `
      <h2>User Management</h2>
      <p>The Users section allows you to manage customer accounts, admin users, and user permissions.</p>
      
      <h3>User Types</h3>
      <ul>
        <li><strong>Customers:</strong> Regular users who can place orders on your site.</li>
        <li><strong>Admins:</strong> Users who have access to the admin dashboard.</li>
        <li><strong>Super Admins:</strong> Users with full access to all admin features.</li>
      </ul>
      
      <h3>Common Tasks</h3>
      <ol>
        <li>To add a new admin user, click the "Add User" button and select the appropriate role.</li>
        <li>To edit a user's details, click on their name in the users list.</li>
        <li>To disable a user account, toggle the "Active" switch in the user details page.</li>
      </ol>
    `,
    category: "users",
    tags: ["users", "accounts", "permissions"],
    path: "/admin/users",
  },
  {
    id: "system-settings",
    title: "System Settings",
    content: `
      <h2>System Settings</h2>
      <p>The Settings section allows you to configure various aspects of your site, including payment methods, shipping options, and notification preferences.</p>
      
      <h3>Setting Categories</h3>
      <ul>
        <li><strong>Company:</strong> Basic company information and contact details.</li>
        <li><strong>Financial:</strong> Payment methods, tax settings, and currency options.</li>
        <li><strong>Delivery:</strong> Shipping methods, rates, and delivery zones.</li>
        <li><strong>Notifications:</strong> Email and system notification settings.</li>
        <li><strong>Permissions:</strong> User role and permission settings.</li>
      </ul>
      
      <h3>Tips</h3>
      <p>Remember to click the "Save Changes" button after modifying any settings to apply your changes.</p>
    `,
    category: "settings",
    tags: ["settings", "configuration", "preferences"],
    path: "/admin/settings",
  },
  {
    id: "getting-started-guide",
    title: "Getting Started Guide",
    content: `
      <h2>Getting Started with the Admin Dashboard</h2>
      <p>Welcome to the Oak Structures Admin Dashboard! This guide will help you get familiar with the basic features and functionality.</p>
      
      <h3>First Steps</h3>
      <ol>
        <li><strong>Explore the Dashboard:</strong> Start by familiarizing yourself with the main dashboard, which provides an overview of your business.</li>
        <li><strong>Set Up Your Profile:</strong> Update your user profile and preferences by clicking on your avatar in the bottom-left corner.</li>
        <li><strong>Configure Settings:</strong> Set up your company information, payment methods, and other essential settings in the Settings section.</li>
        <li><strong>Add Products:</strong> Begin adding your products to the catalog in the Products section.</li>
      </ol>
      
      <h3>Need Help?</h3>
      <p>If you need assistance at any time, click the Help button (question mark icon) in the top-right corner to access documentation and support resources.</p>
    `,
    category: "getting-started",
    tags: ["guide", "introduction", "tutorial"],
  },
  {
    id: "keyboard-shortcuts-guide",
    title: "Keyboard Shortcuts Guide",
    content: `
      <h2>Keyboard Shortcuts Guide</h2>
      <p>The admin dashboard supports various keyboard shortcuts to help you work more efficiently.</p>
      
      <h3>Global Shortcuts</h3>
      <ul>
        <li><strong>?</strong> - Show keyboard shortcuts</li>
        <li><strong>⌘K</strong> - Open global search</li>
        <li><strong>⌘S</strong> - Save changes</li>
        <li><strong>⌘R</strong> - Refresh page</li>
      </ul>
      
      <h3>Navigation Shortcuts</h3>
      <ul>
        <li><strong>G D</strong> - Go to Dashboard</li>
        <li><strong>G O</strong> - Go to Orders</li>
        <li><strong>G P</strong> - Go to Products</li>
        <li><strong>G U</strong> - Go to Users</li>
        <li><strong>G S</strong> - Go to Settings</li>
      </ul>
      
      <p>For a complete list of keyboard shortcuts, press the <strong>?</strong> key at any time.</p>
    `,
    category: "getting-started",
    tags: ["keyboard", "shortcuts", "productivity"],
  },
];

export function HelpDocumentation() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const pathname = usePathname();
  
  // Filter articles based on search query and selected category
  const filteredArticles = helpArticles.filter((article) => {
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get contextual help articles based on current path
  const contextualArticles = helpArticles.filter((article) => 
    article.path && pathname.startsWith(article.path)
  );
  
  // Reset state when closing the sheet
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSearchQuery("");
      setSelectedCategory(null);
      setSelectedArticle(null);
    }, 300);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Help & Documentation</span>
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Help & Documentation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Book className="mr-2 h-5 w-5" />
            Help & Documentation
          </SheetTitle>
          <SheetDescription>
            Find help articles, tutorials, and support resources.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        {selectedArticle ? (
          <div className="space-y-4">
            <Button
              variant="ghost"
              className="flex items-center text-primary"
              onClick={() => setSelectedArticle(null)}
            >
              <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
              Back to Articles
            </Button>
            
            <ScrollArea className="h-[calc(100vh-15rem)]">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />
            </ScrollArea>
          </div>
        ) : (
          <>
            {contextualArticles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Relevant to This Page</h3>
                <div className="space-y-2">
                  {contextualArticles.map((article) => (
                    <Button
                      key={article.id}
                      variant="outline"
                      className="w-full justify-start text-left"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <FileText className="mr-2 h-4 w-4 text-primary" />
                      {article.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 mb-6">
              {helpCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="flex items-center justify-start h-auto py-3"
                  onClick={() => 
                    setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )
                  }
                >
                  <category.icon className="mr-2 h-4 w-4" />
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
            
            <ScrollArea className="h-[calc(100vh-25rem)]">
              <div className="space-y-2">
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No articles found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or category filter
                    </p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredArticles.map((article) => (
                      <AccordionItem key={article.id} value={article.id}>
                        <AccordionTrigger className="text-left">
                          {article.title}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="prose prose-sm max-w-none dark:prose-invert line-clamp-3">
                            <div dangerouslySetInnerHTML={{ 
                              __html: article.content.split("</h2>")[1]?.split("<h3>")[0] || "" 
                            }} />
                          </div>
                          <Button
                            variant="link"
                            className="mt-2 h-auto p-0"
                            onClick={() => setSelectedArticle(article)}
                          >
                            Read More
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </ScrollArea>
          </>
        )}
        
        <SheetFooter className="flex-col sm:flex-row gap-2 mt-6 border-t pt-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => window.open("https://docs.example.com", "_blank")}
          >
            <Book className="mr-2 h-4 w-4" />
            Full Documentation
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => window.open("https://support.example.com", "_blank")}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
          <SheetClose asChild>
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={handleClose}
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
