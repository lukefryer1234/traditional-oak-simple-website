"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Save, 
  Clock, 
  Trash2,
  RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

// Filter operator types
export type FilterOperator = 
  | "equals" 
  | "not_equals" 
  | "contains" 
  | "not_contains" 
  | "starts_with" 
  | "ends_with" 
  | "greater_than" 
  | "less_than" 
  | "between" 
  | "in" 
  | "not_in"
  | "is_empty"
  | "is_not_empty"
  | "is_null"
  | "is_not_null";

// Filter value types
export type FilterValueType = 
  | "string" 
  | "number" 
  | "boolean" 
  | "date" 
  | "enum" 
  | "array";

// Filter definition
export interface FilterDefinition {
  id: string;
  label: string;
  type: FilterValueType;
  operators: FilterOperator[];
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultOperator?: FilterOperator;
}

// Active filter
export interface ActiveFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  displayValue?: string;
}

// Saved search
export interface SavedSearch {
  id: string;
  name: string;
  filters: ActiveFilter[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  createdAt: Date;
  updatedAt: Date;
}

// Props for the AdvancedSearch component
export interface AdvancedSearchProps {
  filterDefinitions: FilterDefinition[];
  onSearch: (filters: ActiveFilter[], sortBy?: string, sortDirection?: "asc" | "desc") => void;
  sortOptions?: { label: string; value: string }[];
  defaultSortBy?: string;
  defaultSortDirection?: "asc" | "desc";
  savedSearches?: SavedSearch[];
  onSaveSearch?: (search: Omit<SavedSearch, "id" | "createdAt" | "updatedAt">) => void;
  onDeleteSearch?: (searchId: string) => void;
  onLoadSearch?: (search: SavedSearch) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Advanced Search Component
 * 
 * A reusable component for advanced searching and filtering
 */
export function AdvancedSearch({
  filterDefinitions,
  onSearch,
  sortOptions = [],
  defaultSortBy,
  defaultSortDirection = "asc",
  savedSearches = [],
  onSaveSearch,
  onDeleteSearch,
  onLoadSearch,
  placeholder = "Search...",
  className = "",
}: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [sortBy, setSortBy] = useState<string | undefined>(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [savedSearchName, setSavedSearchName] = useState("");
  
  // Current filter being added
  const [currentFilterField, setCurrentFilterField] = useState<string>("");
  const [currentFilterOperator, setCurrentFilterOperator] = useState<FilterOperator | "">("");
  const [currentFilterValue, setCurrentFilterValue] = useState<any>("");
  
  // Get the current filter definition
  const currentFilterDefinition = filterDefinitions.find(
    (def) => def.id === currentFilterField
  );
  
  // Reset current filter
  const resetCurrentFilter = useCallback(() => {
    setCurrentFilterField("");
    setCurrentFilterOperator("");
    setCurrentFilterValue("");
  }, []);
  
  // Add a filter
  const addFilter = useCallback(() => {
    if (!currentFilterField || !currentFilterOperator) return;
    
    // Skip value validation for operators that don't require a value
    const requiresValue = !["is_empty", "is_not_empty", "is_null", "is_not_null"].includes(currentFilterOperator);
    
    if (requiresValue && (currentFilterValue === "" || currentFilterValue === null || currentFilterValue === undefined)) {
      toast({
        title: "Invalid Filter",
        description: "Please provide a value for the filter",
        variant: "destructive",
      });
      return;
    }
    
    const filterDef = filterDefinitions.find((def) => def.id === currentFilterField);
    if (!filterDef) return;
    
    let displayValue = String(currentFilterValue);
    
    // Format display value for enum types
    if (filterDef.type === "enum" && filterDef.options) {
      const option = filterDef.options.find((opt) => opt.value === currentFilterValue);
      if (option) {
        displayValue = option.label;
      }
    }
    
    // Format display value for boolean types
    if (filterDef.type === "boolean") {
      displayValue = currentFilterValue ? "Yes" : "No";
    }
    
    // Format display value for date types
    if (filterDef.type === "date" && currentFilterValue instanceof Date) {
      displayValue = currentFilterValue.toLocaleDateString();
    }
    
    const newFilter: ActiveFilter = {
      id: `${currentFilterField}-${Date.now()}`,
      field: currentFilterField,
      operator: currentFilterOperator as FilterOperator,
      value: currentFilterValue,
      displayValue,
    };
    
    setActiveFilters((prev) => [...prev, newFilter]);
    resetCurrentFilter();
    
    // Close the filter sheet on mobile
    if (window.innerWidth < 768) {
      setIsFilterSheetOpen(false);
    }
  }, [currentFilterField, currentFilterOperator, currentFilterValue, filterDefinitions, resetCurrentFilter]);
  
  // Remove a filter
  const removeFilter = useCallback((filterId: string) => {
    setActiveFilters((prev) => prev.filter((filter) => filter.id !== filterId));
  }, []);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveFilters([]);
    setSearchTerm("");
    setSortBy(defaultSortBy);
    setSortDirection(defaultSortDirection);
  }, [defaultSortBy, defaultSortDirection]);
  
  // Handle search
  const handleSearch = useCallback(() => {
    // Create a search term filter if there's a search term
    let filters = [...activeFilters];
    
    if (searchTerm) {
      // Add the search term as a filter that applies to all searchable fields
      // This is just a representation for the UI - the actual implementation
      // of how the search term is used is up to the onSearch handler
      filters.push({
        id: `search-term-${Date.now()}`,
        field: "search",
        operator: "contains",
        value: searchTerm,
        displayValue: searchTerm,
      });
    }
    
    onSearch(filters, sortBy, sortDirection);
  }, [activeFilters, searchTerm, sortBy, sortDirection, onSearch]);
  
  // Save search
  const saveSearch = useCallback(() => {
    if (!savedSearchName) {
      toast({
        title: "Invalid Name",
        description: "Please provide a name for the saved search",
        variant: "destructive",
      });
      return;
    }
    
    if (onSaveSearch) {
      onSaveSearch({
        name: savedSearchName,
        filters: activeFilters,
        sortBy,
        sortDirection,
      });
      
      setIsSaveDialogOpen(false);
      setSavedSearchName("");
      
      toast({
        title: "Search Saved",
        description: `Search "${savedSearchName}" has been saved`,
      });
    }
  }, [savedSearchName, activeFilters, sortBy, sortDirection, onSaveSearch]);
  
  // Load search
  const loadSearch = useCallback((search: SavedSearch) => {
    setActiveFilters(search.filters);
    setSortBy(search.sortBy);
    setSortDirection(search.sortDirection || "asc");
    
    if (onLoadSearch) {
      onLoadSearch(search);
    }
    
    toast({
      title: "Search Loaded",
      description: `Search "${search.name}" has been loaded`,
    });
  }, [onLoadSearch]);
  
  // Delete search
  const deleteSearch = useCallback((searchId: string, searchName: string) => {
    if (onDeleteSearch) {
      onDeleteSearch(searchId);
      
      toast({
        title: "Search Deleted",
        description: `Search "${searchName}" has been deleted`,
      });
    }
  }, [onDeleteSearch]);
  
  // Get operator display name
  const getOperatorDisplayName = (operator: FilterOperator): string => {
    switch (operator) {
      case "equals": return "equals";
      case "not_equals": return "does not equal";
      case "contains": return "contains";
      case "not_contains": return "does not contain";
      case "starts_with": return "starts with";
      case "ends_with": return "ends with";
      case "greater_than": return "is greater than";
      case "less_than": return "is less than";
      case "between": return "is between";
      case "in": return "is in";
      case "not_in": return "is not in";
      case "is_empty": return "is empty";
      case "is_not_empty": return "is not empty";
      case "is_null": return "is null";
      case "is_not_null": return "is not null";
      default: return operator;
    }
  };
  
  // Get field display name
  const getFieldDisplayName = (fieldId: string): string => {
    const field = filterDefinitions.find((def) => def.id === fieldId);
    return field ? field.label : fieldId;
  };
  
  // Trigger search on active filters change
  useEffect(() => {
    handleSearch();
  }, [activeFilters, sortBy, sortDirection, handleSearch]);
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-8"
          />
        </div>
        
        {/* Filter Button */}
        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex-shrink-0">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[500px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Add filters to narrow down your search results
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-4 space-y-4">
              {/* Filter Builder */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Field Selection */}
                  <div>
                    <Label htmlFor="filter-field">Field</Label>
                    <Select
                      value={currentFilterField}
                      onValueChange={setCurrentFilterField}
                    >
                      <SelectTrigger id="filter-field">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterDefinitions.map((def) => (
                          <SelectItem key={def.id} value={def.id}>
                            {def.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Operator Selection */}
                  {currentFilterField && (
                    <div>
                      <Label htmlFor="filter-operator">Operator</Label>
                      <Select
                        value={currentFilterOperator}
                        onValueChange={(value) => setCurrentFilterOperator(value as FilterOperator)}
                      >
                        <SelectTrigger id="filter-operator">
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentFilterDefinition?.operators.map((op) => (
                            <SelectItem key={op} value={op}>
                              {getOperatorDisplayName(op)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* Value Input */}
                  {currentFilterField && 
                   currentFilterOperator && 
                   !["is_empty", "is_not_empty", "is_null", "is_not_null"].includes(currentFilterOperator) && (
                    <div>
                      <Label htmlFor="filter-value">Value</Label>
                      
                      {/* String Input */}
                      {currentFilterDefinition?.type === "string" && (
                        <Input
                          id="filter-value"
                          value={currentFilterValue || ""}
                          onChange={(e) => setCurrentFilterValue(e.target.value)}
                          placeholder={currentFilterDefinition.placeholder || "Enter value"}
                        />
                      )}
                      
                      {/* Number Input */}
                      {currentFilterDefinition?.type === "number" && (
                        <Input
                          id="filter-value"
                          type="number"
                          value={currentFilterValue || ""}
                          onChange={(e) => setCurrentFilterValue(parseFloat(e.target.value))}
                          placeholder={currentFilterDefinition.placeholder || "Enter number"}
                        />
                      )}
                      
                      {/* Boolean Input */}
                      {currentFilterDefinition?.type === "boolean" && (
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="filter-value"
                            checked={Boolean(currentFilterValue)}
                            onCheckedChange={setCurrentFilterValue}
                          />
                          <Label htmlFor="filter-value">
                            {Boolean(currentFilterValue) ? "Yes" : "No"}
                          </Label>
                        </div>
                      )}
                      
                      {/* Enum Input */}
                      {currentFilterDefinition?.type === "enum" && (
                        <Select
                          value={currentFilterValue || ""}
                          onValueChange={setCurrentFilterValue}
                        >
                          <SelectTrigger id="filter-value">
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentFilterDefinition.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetCurrentFilter}>
                    Reset
                  </Button>
                  <Button onClick={addFilter} disabled={!currentFilterField || !currentFilterOperator}>
                    Add Filter
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              {/* Active Filters */}
              <div>
                <h3 className="text-sm font-medium mb-2">Active Filters</h3>
                {activeFilters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active filters</p>
                ) : (
                  <div className="space-y-2">
                    {activeFilters.map((filter) => (
                      <div
                        key={filter.id}
                        className="flex items-center justify-between bg-muted p-2 rounded-md"
                      >
                        <div className="text-sm">
                          <span className="font-medium">{getFieldDisplayName(filter.field)}</span>
                          {" "}
                          <span className="text-muted-foreground">
                            {getOperatorDisplayName(filter.operator)}
                          </span>
                          {" "}
                          {!["is_empty", "is_not_empty", "is_null", "is_not_null"].includes(filter.operator) && (
                            <span className="font-medium">{filter.displayValue}</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFilter(filter.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full mt-2"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Sort Options */}
              {sortOptions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Sort</h3>
                  <div className="flex gap-2">
                    <Select
                      value={sortBy || ""}
                      onValueChange={setSortBy}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={sortDirection}
                      onValueChange={(value: "asc" | "desc") => setSortDirection(value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            
            <SheetFooter>
              <div className="flex justify-between w-full">
                <Button
                  variant="outline"
                  onClick={() => setIsFilterSheetOpen(false)}
                >
                  Close
                </Button>
                
                {onSaveSearch && (
                  <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Save className="h-4 w-4 mr-2" />
                        Save Search
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save Search</DialogTitle>
                        <DialogDescription>
                          Save your current search filters for future use
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="search-name">Search Name</Label>
                        <Input
                          id="search-name"
                          value={savedSearchName}
                          onChange={(e) => setSavedSearchName(e.target.value)}
                          placeholder="Enter a name for this search"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={saveSearch}>Save</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        
        {/* Saved Searches */}
        {savedSearches.length > 0 && onLoadSearch && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-shrink-0">
                <Clock className="mr-2 h-4 w-4" />
                Saved Searches
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="end">
              <Command>
                <CommandInput placeholder="Search saved searches..." />
                <CommandList>
                  <CommandEmpty>No saved searches found</CommandEmpty>
                  <CommandGroup>
                    {savedSearches.map((search) => (
                      <CommandItem
                        key={search.id}
                        onSelect={() => loadSearch(search)}
                        className="flex justify-between"
                      >
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>{search.name}</span>
                        </div>
                        {onDeleteSearch && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSearch(search.id, search.name);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
        
        {/* Search Button */}
        <Button onClick={handleSearch} className="flex-shrink-0">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
      
      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <span className="font-medium">{getFieldDisplayName(filter.field)}</span>
              {" "}
              <span className="text-muted-foreground">
                {getOperatorDisplayName(filter.operator)}
              </span>
              {" "}
              {!["is_empty", "is_not_empty", "is_null", "is_not_null"].includes(filter.operator) && (
                <span className="font-medium">{filter.displayValue}</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter(filter.id)}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
