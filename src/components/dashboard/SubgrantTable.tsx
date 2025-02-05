import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
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
import { Trash2, Edit2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/use-toast";
import type { Subgrant } from "./ContractTable";

interface SubgrantTableProps {
  subgrants: Subgrant[];
  updateSubgrantDBE: (subgrantId: string, value: boolean) => void;
}

export const SubgrantTable = ({ subgrants, updateSubgrantDBE }: SubgrantTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDeleteSubgrant = async (subgrantId: string) => {
    try {
      const { error } = await supabase.from("subgrants").delete().eq("id", subgrantId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({
        title: "Subgrant Deleted",
        description: "The subgrant has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting subgrant:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the subgrant.",
        variant: "destructive",
      });
    }
  };

  if (!subgrants || subgrants.length === 0) {
    return <p className="text-gray-500">No subgrants found</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-12 px-4 text-left font-medium text-muted-foreground w-auto">
            DBE Firm
          </TableHead>
          <TableHead className="h-12 px-4 text-left font-medium text-muted-foreground w-auto">
            NAICS Code
          </TableHead>
          <TableHead className="h-12 px-4 text-right font-medium text-muted-foreground w-auto">
            Amount
          </TableHead>
          <TableHead className="h-12 px-4 text-left font-medium text-muted-foreground w-auto">
            Contract Type
          </TableHead>
          <TableHead className="h-12 px-4 text-left font-medium text-muted-foreground w-auto">
            Award Date
          </TableHead>
          <TableHead className="h-12 px-4 text-left font-medium text-muted-foreground w-auto">
            Date Created
          </TableHead>
          <TableHead className="h-12 px-4 text-center font-medium text-muted-foreground w-auto">
            DBE Certified
          </TableHead>
          <TableHead className="h-12 px-4 text-right font-medium text-muted-foreground w-auto">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subgrants.map((subgrant) => (
          <TableRow key={subgrant.id} className="group">
            <TableCell>{subgrant.dbe_firm_name}</TableCell>
            <TableCell className="font-mono">{subgrant.naics_code}</TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(subgrant.amount)}</TableCell>
            <TableCell>
              <Select
                value={subgrant.contract_type}
                onValueChange={(value) => {
                  // Handle contract type change
                  console.log("Contract type changed:", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Subcontract">Subcontract</SelectItem>
                  <SelectItem value="Supplier">Supplier</SelectItem>
                  <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>{formatDate(subgrant.award_date)}</TableCell>
            <TableCell>{formatDate(subgrant.created_at)}</TableCell>
            <TableCell className="text-center">
              <Select
                value={subgrant.certified_dbe ? "yes" : "no"}
                onValueChange={(value) => updateSubgrantDBE(subgrant.id, value === "yes")}
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
                  onClick={() => handleDeleteSubgrant(subgrant.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};