import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TableCell, TableRow } from "@/components/ui/table";
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
import { SubgrantTable } from "./SubgrantTable";
import type { Contract, Subgrant } from "./ContractTable";

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
      const { error } = await supabase.from("contracts").delete().eq("id", contractId);
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
    <Fragment>
      <TableRow className="group hover:bg-gray-50">
        <TableCell>{contract.tad_project_number}</TableCell>
        <TableCell>{contract.contract_number}</TableCell>
        <TableCell>{contract.prime_contractor}</TableCell>
        <TableCell className="text-right">{formatCurrency(contract.original_amount)}</TableCell>
        <TableCell className="text-right">{contract.dbe_percentage}%</TableCell>
        <TableCell>{formatDate(contract.award_date)}</TableCell>
        <TableCell>{formatDate(contract.report_date)}</TableCell>
        <TableCell className="text-center">
          <Select
            value={contract.final_report ? "yes" : "no"}
            onValueChange={(value) => updateFinalReport(contract.id, value === "yes")}
          >
            <SelectTrigger>
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
              onClick={() => handleDeleteContract(contract.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditContract(contract.id)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleExpand}>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={9}>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Subgrants</h4>
              <SubgrantTable
                subgrants={contract.subgrants || []}
                updateSubgrantDBE={updateSubgrantDBE}
              />
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
};