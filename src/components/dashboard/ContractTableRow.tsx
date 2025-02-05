import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SubgrantTable } from "./SubgrantTable";

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

interface ContractTableRowProps {
  contract: Contract;
  isExpanded: boolean;
  onToggleExpand: () => void;
  updateSubgrantDBE: (subgrantId: string, value: boolean) => void;
}

export const ContractTableRow = ({
  contract,
  isExpanded,
  onToggleExpand,
  updateSubgrantDBE,
}: ContractTableRowProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
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
                {isExpanded ? (
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
  );
};