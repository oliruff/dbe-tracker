import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { ChevronDown, ChevronUp, Trash2, Edit2 } from "lucide-react";
import { SearchFilters } from "./dashboard/SearchFilters";
import { SubgrantTable } from "./dashboard/SubgrantTable";
import { formatCurrency, formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const handleDeleteContract = async (contractId: string) => {
    try {
      const { error } = await supabase
        .from("contracts")
        .delete()
        .eq("id", contractId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({
        title: "Contract Deleted",
        description: "The contract has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting contract:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the contract.",
        variant: "destructive",
      });
    }
  };

  const handleEditContract = (contractId: string) => {
    navigate(`/edit-contract/${contractId}`);
  };

  const updateFinalReport = async (contractId: string, value: boolean) => {
    const { error } = await supabase
      .from("contracts")
      .update({ final_report: value })
      .eq("id", contractId);

    if (error) {
      console.error("Error updating final report:", error);
      toast({
        title: "Error",
        description: "There was an error updating the final report status.",
        variant: "destructive",
      });
    }
  };

  const updateSubgrantDBE = async (subgrantId: string, value: boolean) => {
    const { error } = await supabase
      .from("subgrants")
      .update({ certified_dbe: value })
      .eq("id", subgrantId);

    if (error) {
      console.error("Error updating certified DBE status:", error);
      toast({
        title: "Error",
        description: "There was an error updating the DBE certification status.",
        variant: "destructive",
      });
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
              <TableHead className="w-[150px] whitespace-nowrap">TAD Project #</TableHead>
              <TableHead className="w-[150px] whitespace-nowrap">Contract #</TableHead>
              <TableHead className="w-[200px] whitespace-nowrap">Prime Contractor</TableHead>
              <TableHead className="w-[150px] text-right whitespace-nowrap">Amount</TableHead>
              <TableHead className="w-[100px] text-right whitespace-nowrap">DBE %</TableHead>
              <TableHead className="w-[120px] whitespace-nowrap">Date</TableHead>
              <TableHead className="w-[120px] whitespace-nowrap">Final Report</TableHead>
              <TableHead className="w-[120px] text-right whitespace-nowrap">Actions</TableHead>
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
                <TableRow className="group">
                  <TableCell className="font-medium">{contract.tad_project_number}</TableCell>
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
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteContract(contract.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditContract(contract.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {expandedContract === contract.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
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