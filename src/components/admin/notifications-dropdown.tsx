"use client";

import React from "react";
import Link from "next/link";
import { 
  Bell, 
  Check, 
  ShoppingCart, 
  AlertCircle, 
  Package, 
  Users, 
  Settings,
  CheckCheck,
  Loader2
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/notifications/use-notifications";

// Re-export notification type from schema
export type { FirestoreNotification as Notification } from "@/lib/firestore-schema";
export type NotificationType = "order" | "stock" | "user" | "system" | "payment";

// Helper function to get icon based on notification type
export const getNotificationIcon = (type: NotificationType | string) => {
  switch (type) {
    case "order":
      return <ShoppingCart className="h-4 w-4 text-blue-500" />;
    case "stock":
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    case "user":
      return <Users className="h-4 w-4 text-purple-500" />;
    case "system":
      return <Settings className="h-4 w-4 text-slate-500" />;
    case "payment":
      return <Package className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

// Helper function to format timestamp
const formatTimestamp = (timestamp: string | Date | undefined): string => {
  if (!timestamp) return '';
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'some time ago';
  }
};

export function NotificationsDropdown() {
  // Use the notifications hook for real-time updates
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs flex items-center gap-1"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="py-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="py-6 text-center text-destructive">
              <p className="text-sm">Error loading notifications</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start p-3 cursor-default",
                  !notification.read && "bg-muted/50"
                )}
                onSelect={(e) => {
                  e.preventDefault();
                  if (notification.id) {
                    markAsRead(notification.id);
                  }
                }}
              >
                <div className="flex w-full gap-2">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                      <div className="flex gap-2">
                        {!notification.read && notification.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id as string);
                            }}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark read
                          </Button>
                        )}
                        {notification.link && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            asChild
                          >
                            <Link href={notification.link}>View</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center cursor-default">
          <Link 
            href="/admin/notifications" 
            className="w-full text-center text-sm font-medium py-1.5"
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
