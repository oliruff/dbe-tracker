import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SearchFiltersProps {
  searchTerm: string;
  filters: {
    minAmount: string;
    maxAmount: string;
    startDate: string;
    endDate: string;
  };
  setSearchTerm: (term: string) => void;
  setFilters: (filters: {
    minAmount: string;
    maxAmount: string;
    startDate: string;
    endDate: string;
  }) => void;
}

export const SearchFilters = ({
  searchTerm,
  filters,
  setSearchTerm,
  setFilters,
}: SearchFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search contracts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="minAmount">Min Amount</Label>
        <Input
          id="minAmount"
          type="number"
          placeholder="Min amount"
          value={filters.minAmount}
          onChange={(e) =>
            setFilters({ ...filters, minAmount: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="maxAmount">Max Amount</Label>
        <Input
          id="maxAmount"
          type="number"
          placeholder="Max amount"
          value={filters.maxAmount}
          onChange={(e) =>
            setFilters({ ...filters, maxAmount: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="dateRange">Date Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
};