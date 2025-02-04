import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SearchFilters } from "./dashboard/SearchFilters";
import { SubgrantTable } from "./dashboard/SubgrantTable";
import { formatCurrency, formatDate } from "@/lib/format";

interface Contract {
  id: string;
  tad_project_number: string;
  contract_number: string;
  prime_contractor: string;
  original_amount: number;
  dbe_percentage: number;
  final_report: boolean;
  created_at: string;
  subgrants?: Subgrant[];
}

interface Subgrant {
  id: string;
  dbe_firm_name: string;
  naics_code: string;
  amount: number;
  certified_dbe: boolean;
  created_at: string;
}

export const ContractDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedContract, setExpandedContract] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  });

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data: contracts, error } = await supabase
        .from("contracts")
        .select(`
          *,
          subgrants (
            id,
            dbe_firm_name,
            naics_code,
            amount,
            certified_dbe,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return contracts as Contract[];
    },
  });

  const updateFinalReport = async (contractId: string, value: boolean) => {
    const { error } = await supabase
      .from("contracts")
      .update({ final_report: value })
      .eq("id", contractId);

    if (error) {
      console.error("Error updating final report:", error);
    }
  };

  const updateSubgrantDBE = async (subgrantId: string, value: boolean) => {
    const { error } = await supabase
      .from("subgrants")
      .update({ certified_dbe: value })
      .eq("id", subgrantId);

    if (error) {
      console.error("Error updating certified DBE status:", error);
    }
  };

  const filteredContracts = contracts?.filter((contract) => {
    const matchesSearch =
      contract.tad_project_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.prime_contractor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAmount =
      (!filters.minAmount || contract.original_amount >= parseFloat(filters.minAmount)) &&
      (!filters.maxAmount || contract.original_amount <= parseFloat(filters.maxAmount));

    const contractDate = new Date(contract.created_at);
    const matchesDate =
      (!filters.startDate || contractDate >= new Date(filters.startDate)) &&
      (!filters.endDate || contractDate <= new Date(filters.endDate));

    return matchesSearch && matchesAmount && matchesDate;
  });

  if (isLoading) {
    return <div>Loading contracts...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <SearchFilters
          searchTerm={searchTerm}
          filters={filters}
          setSearchTerm={setSearchTerm}
          setFilters={setFilters}
        />
      </Card>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[150px]">TAD Project #</TableHead>
              <TableHead className="w-[150px]">Contract #</TableHead>
              <TableHead className="w-[200px]">Prime Contractor</TableHead>
              <TableHead className="w-[150px] text-right">Amount</TableHead>
              <TableHead className="w-[100px] text-right">DBE %</TableHead>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="w-[120px]">Final Report</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContracts?.map((contract) => (
              <Collapsible
                key={contract.id}
                open={expandedContract === contract.id}
                onOpenChange={() =>
                  setExpandedContract(
                    expandedContract === contract.id ? null : contract.id
                  )
                }
              >
                <TableRow>
                  <TableCell>{contract.tad_project_number}</TableCell>
                  <TableCell>{contract.contract_number}</TableCell>
                  <TableCell>{contract.prime_contractor}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(contract.original_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {contract.dbe_percentage}%
                  </TableCell>
                  <TableCell>{formatDate(contract.created_at)}</TableCell>
                  <TableCell>
                    <Select
                      value={contract.final_report ? "yes" : "no"}
                      onValueChange={(value) =>
                        updateFinalReport(contract.id, value === "yes")
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {expandedContract === contract.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </TableCell>
                </TableRow>
                <CollapsibleContent>
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Subgrants</h4>
                        <SubgrantTable
                          subgrants={contract.subgrants || []}
                          updateSubgrantDBE={updateSubgrantDBE}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};