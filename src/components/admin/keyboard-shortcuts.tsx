"use client";

import React, { useState, useEffect } from "react";
import { 
  Keyboard, 
  Search, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ArrowRight,
  HelpCircle,
  X
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

// Shortcut category
interface ShortcutCategory {
  name: string;
  shortcuts: Shortcut[];
}

// Shortcut definition
interface Shortcut {
  keys: string[];
  description: string;
}

// Keyboard shortcut categories
const shortcutCategories: ShortcutCategory[] = [
  {
    name: "Global",
    shortcuts: [
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["⌘", "K"], description: "Open global search" },
      { keys: ["⌘", "S"], description: "Save changes" },
      { keys: ["⌘", "R"], description: "Refresh page" },
      { keys: ["⌘", "/"], description: "Focus search" },
      { keys: ["Esc"], description: "Close modal / Cancel" },
    ],
  },
  {
    name: "Navigation",
    shortcuts: [
      { keys: ["G", "D"], description: "Go to Dashboard" },
      { keys: ["G", "O"], description: "Go to Orders" },
      { keys: ["G", "P"], description: "Go to Products" },
      { keys: ["G", "U"], description: "Go to Users" },
      { keys: ["G", "S"], description: "Go to Settings" },
      { keys: ["G", "A"], description: "Go to Analytics" },
    ],
  },
  {
    name: "Actions",
    shortcuts: [
      { keys: ["N"], description: "New item" },
      { keys: ["E"], description: "Edit selected item" },
      { keys: ["⌘", "⌫"], description: "Delete selected item" },
      { keys: ["⌘", "Z"], description: "Undo" },
      { keys: ["⌘", "⇧", "Z"], description: "Redo" },
    ],
  },
  {
    name: "Table Navigation",
    shortcuts: [
      { keys: ["↑"], description: "Previous row" },
      { keys: ["↓"], description: "Next row" },
      { keys: ["←"], description: "Previous page" },
      { keys: ["→"], description: "Next page" },
      { keys: ["Home"], description: "First row" },
      { keys: ["End"], description: "Last row" },
      { keys: ["Space"], description: "Select row" },
      { keys: ["⌘", "A"], description: "Select all rows" },
    ],
  },
  {
    name: "Sidebar",
    shortcuts: [
      { keys: ["["], description: "Collapse sidebar" },
      { keys: ["]"], description: "Expand sidebar" },
      { keys: ["⌘", "B"], description: "Toggle sidebar" },
    ],
  },
];

// Key display mapping
const keyDisplayMap: Record<string, string> = {
  "⌘": "⌘",
  "⇧": "⇧",
  "⌥": "⌥",
  "⌃": "⌃",
  "↑": "↑",
  "↓": "↓",
  "←": "←",
  "→": "→",
  "⌫": "⌫",
  "Esc": "Esc",
  "Tab": "Tab",
  "Space": "Space",
  "Enter": "↵",
  "Home": "Home",
  "End": "End",
  "PgUp": "PgUp",
  "PgDn": "PgDn",
};

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Handle keyboard shortcut to open dialog
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  
  // Render key
  const renderKey = (key: string) => {
    const display = keyDisplayMap[key] || key;
    
    return (
      <kbd
        key={key}
        className="inline-flex h-6 items-center justify-center rounded border bg-muted px-2 text-xs font-medium"
      >
        {display}
      </kbd>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Keyboard className="h-4 w-4" />
                <span className="sr-only">Keyboard Shortcuts</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Keyboard Shortcuts</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Keyboard className="mr-2 h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Keyboard shortcuts to help you navigate and work more efficiently.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 py-4">
            {shortcutCategories.map((category) => (
              <div key={category.name} className="space-y-2">
                <h3 className="text-lg font-medium">{category.name}</h3>
                <div className="rounded-md border">
                  <div className="divide-y">
                    {category.shortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3"
                      >
                        <span className="text-sm">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              {keyIndex > 0 && <span className="text-muted-foreground">+</span>}
                              {renderKey(key)}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
