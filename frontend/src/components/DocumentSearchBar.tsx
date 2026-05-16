import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Document } from "@/lib/documents-context";
import { SearchFilters } from "@/hooks/useDocumentSearch";

interface DocumentSearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export function DocumentSearchBar({
  filters,
  onFiltersChange,
}: DocumentSearchBarProps) {
  const handleSearchChange = (query: string) => {
    onFiltersChange({ ...filters, searchQuery: query });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === "all" ? undefined : (status as Document["status"]),
    });
  };

  const handleMinFilesChange = (value: string) => {
    onFiltersChange({
      ...filters,
      minFiles: value ? parseInt(value) : undefined,
    });
  };

  const handleMaxFilesChange = (value: string) => {
    onFiltersChange({
      ...filters,
      maxFiles: value ? parseInt(value) : undefined,
    });
  };

  const handleHasCommentsChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      hasComments: checked ? true : undefined,
    });
  };

  const handleResetFilters = () => {
    onFiltersChange({
      searchQuery: "",
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      minFiles: undefined,
      maxFiles: undefined,
      hasComments: undefined,
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
      {/* Search Input */}
      <div>
        <Label htmlFor="search" className="text-sm">
          Search Documents
        </Label>
        <Input
          id="search"
          placeholder="Search by title or description..."
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Filters Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Status Filter */}
        <div>
          <Label htmlFor="status" className="text-sm">
            Status
          </Label>
          <Select
            value={filters.status || "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger id="status" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min Files Filter */}
        <div>
          <Label htmlFor="minFiles" className="text-sm">
            Min Files
          </Label>
          <Input
            id="minFiles"
            type="number"
            min="0"
            placeholder="0"
            value={filters.minFiles || ""}
            onChange={(e) => handleMinFilesChange(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Max Files Filter */}
        <div>
          <Label htmlFor="maxFiles" className="text-sm">
            Max Files
          </Label>
          <Input
            id="maxFiles"
            type="number"
            min="0"
            placeholder="Any"
            value={filters.maxFiles || ""}
            onChange={(e) => handleMaxFilesChange(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Has Comments Filter */}
        <div className="flex items-end">
          <div className="flex items-center gap-2">
            <Checkbox
              id="hasComments"
              checked={filters.hasComments === true}
              onCheckedChange={handleHasCommentsChange}
            />
            <Label htmlFor="hasComments" className="text-sm cursor-pointer">
              Has Comments
            </Label>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
