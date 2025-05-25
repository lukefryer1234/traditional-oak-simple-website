"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  File, 
  Settings, 
  Users, 
  Package, 
  ShoppingCart,
  FileText,
  MessageSquare,
  Image,
  BarChart,
  Command,
  Keyboard
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Search result types
type SearchResultType = 
  | "order"
  | "product"
  | "user"
  | "content"
  | "setting"
  | "lead"
  | "page";

// Search result item
interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  url: string;
  icon?: React.ElementType;
}

// Mock search results - in a real app, this would come from an API
const mockSearchResults: SearchResult[] = [
  {
    id: "order-1",
    type: "order",
    title: "Order #ORD-001",
    description: "John Smith - £1,250.00",
    url: "/admin/orders?id=ORD-001",
    icon: ShoppingCart,
  },
  {
    id: "order-2",
    type: "order",
    title: "Order #ORD-002",
    description: "Sarah Johnson - £3,450.00",
    url: "/admin/orders?id=ORD-002",
    icon: ShoppingCart,
  },
  {
    id: "product-1",
    type: "product",
    title: "Garden Gazebo",
    description: "Wooden garden gazebo",
    url: "/admin/products?id=product-1",
    icon: Package,
  },
  {
    id: "product-2",
    type: "product",
    title: "Oak Flooring",
    description: "Premium oak flooring",
    url: "/admin/products?id=product-2",
    icon: Package,
  },
  {
    id: "user-1",
    type: "user",
    title: "John Smith",
    description: "john@example.com",
    url: "/admin/users/management?id=user-1",
    icon: Users,
  },
  {
    id: "user-2",
    type: "user",
    title: "Sarah Johnson",
    description: "sarah@example.com",
    url: "/admin/users/management?id=user-2",
    icon: Users,
  },
  {
    id: "content-1",
    type: "content",
    title: "Homepage Banner",
    description: "Main homepage banner",
    url: "/admin/content?id=content-1",
    icon: Image,
  },
  {
    id: "setting-1",
    type: "setting",
    title: "Payment Settings",
    description: "Configure payment providers",
    url: "/admin/settings/payments",
    icon: Settings,
  },
  {
    id: "lead-1",
    type: "lead",
    title: "David Thompson",
    description: "New lead from contact form",
    url: "/admin/crm/leads?id=lead-1",
    icon: MessageSquare,
  },
  {
    id: "page-1",
    type: "page",
    title: "Dashboard",
    description: "Admin dashboard",
    url: "/admin",
    icon: BarChart,
  },
  {
    id: "page-2",
    type: "page",
    title: "Analytics",
    description: "View analytics data",
    url: "/admin/analytics",
    icon: BarChart,
  },
  {
    id: "page-3",
    type: "page",
    title: "Orders",
    description: "Manage orders",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    id: "page-4",
    type: "page",
    title: "Products",
    description: "Manage products",
    url: "/admin/products",
    icon: Package,
  },
  {
    id: "page-5",
    type: "page",
    title: "Users",
    description: "Manage users",
    url: "/admin/users",
    icon: Users,
  },
  {
    id: "page-6",
    type: "page",
    title: "Content",
    description: "Manage content",
    url: "/admin/content",
    icon: FileText,
  },
  {
    id: "page-7",
    type: "page",
    title: "CRM",
    description: "Customer relationship management",
    url: "/admin/crm",
    icon: MessageSquare,
  },
  {
    id: "page-8",
    type: "page",
    title: "Settings",
    description: "Configure system settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

// In a real app, this would be a function that calls an API
const searchItems = async (query: string): Promise<SearchResult[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  
  return mockSearchResults.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      (item.description && item.description.toLowerCase().includes(lowerQuery))
  );
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  // Search handler
  const handleSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const searchResults = await searchItems(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Update search results when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        handleSearch(query);
      } else {
        setResults([]);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [query, handleSearch]);
  
  // Handle keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  
  // Handle item selection
  const handleSelect = useCallback((url: string) => {
    setOpen(false);
    router.push(url);
  }, [router]);
  
  // Group results by type
  const groupedResults = results.reduce<Record<string, SearchResult[]>>(
    (groups, result) => {
      const group = result.type;
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(result);
      return groups;
    },
    {}
  );
  
  // Get group label
  const getGroupLabel = (type: string): string => {
    switch (type) {
      case "order":
        return "Orders";
      case "product":
        return "Products";
      case "user":
        return "Users";
      case "content":
        return "Content";
      case "setting":
        return "Settings";
      case "lead":
        return "Leads";
      case "page":
        return "Pages";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <span className="sr-only">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search for anything..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Searching..." : "No results found."}
          </CommandEmpty>
          
          {Object.entries(groupedResults).map(([type, items]) => (
            <CommandGroup key={type} heading={getGroupLabel(type)}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.url)}
                >
                  {item.icon && (
                    <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          
          <CommandSeparator />
          
          <CommandGroup heading="Shortcuts">
            <CommandItem onSelect={() => router.push("/admin")}>
              <BarChart className="mr-2 h-4 w-4" />
              <span>Go to Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => router.push("/admin/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Open Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => window.location.href = "/"}>
              <File className="mr-2 h-4 w-4" />
              <span>Visit Website</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Help">
            <CommandItem onSelect={() => window.open("https://docs.example.com", "_blank")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Documentation</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => window.open("https://support.example.com", "_blank")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Support</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <Keyboard className="mr-2 h-4 w-4" />
              <span>View Keyboard Shortcuts</span>
              <CommandShortcut>?</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
