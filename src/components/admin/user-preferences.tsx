"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  Layout, 
  Eye, 
  EyeOff,
  Save,
  RotateCcw,
  X
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

// Theme options
type ThemeOption = "light" | "dark" | "system";

// Dashboard layout options
type LayoutOption = "default" | "compact" | "comfortable";

// User preferences interface
interface UserPreferences {
  theme: ThemeOption;
  layout: LayoutOption;
  sidebarCollapsed: boolean;
  enableAnimations: boolean;
  enableNotifications: boolean;
  dashboardWidgets: string[];
}

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: "system",
  layout: "default",
  sidebarCollapsed: false,
  enableAnimations: true,
  enableNotifications: true,
  dashboardWidgets: ["sales", "orders", "customers", "products"],
};

// Available dashboard widgets
const availableWidgets = [
  { id: "sales", label: "Sales Overview" },
  { id: "orders", label: "Recent Orders" },
  { id: "customers", label: "Customer Activity" },
  { id: "products", label: "Product Performance" },
  { id: "leads", label: "Recent Leads" },
  { id: "tasks", label: "My Tasks" },
  { id: "analytics", label: "Analytics Summary" },
  { id: "calendar", label: "Upcoming Events" },
];

export function UserPreferences() {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [originalPreferences, setOriginalPreferences] = useState<UserPreferences>(defaultPreferences);
  const router = useRouter();
  const { toast } = useToast();
  
  // Load preferences from localStorage on mount
  useEffect(() => {
    const storedPreferences = localStorage.getItem("adminPreferences");
    if (storedPreferences) {
      try {
        const parsedPreferences = JSON.parse(storedPreferences);
        setPreferences(parsedPreferences);
        setOriginalPreferences(parsedPreferences);
        
        // Apply theme immediately
        applyTheme(parsedPreferences.theme);
      } catch (error) {
        console.error("Error parsing stored preferences:", error);
      }
    }
  }, []);
  
  // Apply theme to document
  const applyTheme = (theme: ThemeOption) => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    
    // Apply selected theme
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };
  
  // Handle theme change
  const handleThemeChange = (theme: ThemeOption) => {
    setPreferences((prev) => ({ ...prev, theme }));
    applyTheme(theme);
  };
  
  // Handle widget toggle
  const toggleWidget = (widgetId: string) => {
    setPreferences((prev) => {
      const currentWidgets = [...prev.dashboardWidgets];
      
      if (currentWidgets.includes(widgetId)) {
        return {
          ...prev,
          dashboardWidgets: currentWidgets.filter((id) => id !== widgetId),
        };
      } else {
        return {
          ...prev,
          dashboardWidgets: [...currentWidgets, widgetId],
        };
      }
    });
  };
  
  // Save preferences
  const savePreferences = () => {
    localStorage.setItem("adminPreferences", JSON.stringify(preferences));
    setOriginalPreferences(preferences);
    
    toast({
      title: "Preferences Saved",
      description: "Your preferences have been saved successfully.",
    });
    
    setIsOpen(false);
    
    // Refresh the page to apply changes
    // In a real app, you might use a context provider instead
    router.refresh();
  };
  
  // Reset preferences
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    applyTheme(defaultPreferences.theme);
    
    toast({
      title: "Preferences Reset",
      description: "Your preferences have been reset to default values.",
    });
  };
  
  // Cancel changes
  const cancelChanges = () => {
    setPreferences(originalPreferences);
    applyTheme(originalPreferences.theme);
    setIsOpen(false);
  };
  
  // Check if preferences have changed
  const hasChanges = JSON.stringify(preferences) !== JSON.stringify(originalPreferences);
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Settings className="h-4 w-4" />
                <span className="sr-only">User Preferences</span>
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Preferences</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <SheetContent side="right" className="w-full sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>User Preferences</SheetTitle>
          <SheetDescription>
            Customize your admin dashboard experience
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          {/* Theme Settings */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Appearance</h3>
            <Separator />
            
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) => handleThemeChange(value as ThemeOption)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center">
                        <Monitor className="mr-2 h-4 w-4" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="layout">Layout Density</Label>
                <Select
                  value={preferences.layout}
                  onValueChange={(value) => 
                    setPreferences((prev) => ({ ...prev, layout: value as LayoutOption }))
                  }
                >
                  <SelectTrigger id="layout">
                    <SelectValue placeholder="Select layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="animations">Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable UI animations and transitions
                  </p>
                </div>
                <Switch
                  id="animations"
                  checked={preferences.enableAnimations}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, enableAnimations: checked }))
                  }
                />
              </div>
            </div>
          </div>
          
          {/* Notifications Settings */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Notifications</h3>
            <Separator />
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications in the admin dashboard
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={preferences.enableNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, enableNotifications: checked }))
                  }
                />
              </div>
            </div>
          </div>
          
          {/* Dashboard Widgets */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Dashboard Widgets</h3>
            <Separator />
            
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Select which widgets to display on your dashboard
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {availableWidgets.map((widget) => (
                  <div key={widget.id} className="flex items-center justify-between">
                    <Label htmlFor={`widget-${widget.id}`} className="flex items-center">
                      {preferences.dashboardWidgets.includes(widget.id) ? (
                        <Eye className="mr-2 h-4 w-4 text-primary" />
                      ) : (
                        <EyeOff className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      {widget.label}
                    </Label>
                    <Switch
                      id={`widget-${widget.id}`}
                      checked={preferences.dashboardWidgets.includes(widget.id)}
                      onCheckedChange={() => toggleWidget(widget.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <SheetFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-2">
          <div className="flex space-x-2 mb-4 sm:mb-0">
            <Button
              variant="outline"
              onClick={resetPreferences}
              className="flex-1 sm:flex-none"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Default
            </Button>
            
            <SheetClose asChild>
              <Button
                variant="outline"
                onClick={cancelChanges}
                className="flex-1 sm:flex-none"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </SheetClose>
          </div>
          
          <Button
            onClick={savePreferences}
            disabled={!hasChanges}
            className="flex-1 sm:flex-none"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
