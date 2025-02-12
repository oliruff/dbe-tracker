
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
import { Trash2, Edit2, Check, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { Subgrant } from "@/types/contracts";

interface SubgrantTableProps {
  subgrants: Subgrant[];
  updateSubgrantDBE: (subgrantId: string, value: boolean) => void;
}

export const SubgrantTable = ({ subgrants, updateSubgrantDBE }: SubgrantTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Subgrant>>({});

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

  const startEditing = (subgrant: Subgrant) => {
    setEditingId(subgrant.id);
    setEditForm({
      dbe_firm_name: subgrant.dbe_firm_name,
      naics_code: subgrant.naics_code,
      amount: subgrant.amount,
      contract_type: subgrant.contract_type,
      award_date: subgrant.award_date,
      certified_dbe: subgrant.certified_dbe,
      ethnicity_gender: subgrant.ethnicity_gender,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (subgrantId: string) => {
    try {
      if (!editForm.dbe_firm_name || !editForm.naics_code || !editForm.amount) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("subgrants")
        .update({
          dbe_firm_name: editForm.dbe_firm_name,
          naics_code: editForm.naics_code,
          amount: editForm.amount,
          contract_type: editForm.contract_type,
          award_date: editForm.award_date,
          certified_dbe: editForm.certified_dbe,
          ethnicity_gender: editForm.ethnicity_gender,
        })
        .eq("id", subgrantId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({
        title: "Subgrant Updated",
        description: "The subgrant has been successfully updated.",
      });
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error("Error updating subgrant:", error);
      toast({
        title: "Error",
        description: "There was an error updating the subgrant.",
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
            <TableCell>
              {editingId === subgrant.id ? (
                <Input
                  value={editForm.dbe_firm_name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dbe_firm_name: e.target.value })
                  }
                  className="w-full"
                />
              ) : (
                subgrant.dbe_firm_name
              )}
            </TableCell>
            <TableCell className="font-mono">
              {editingId === subgrant.id ? (
                <Input
                  value={editForm.naics_code || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, naics_code: e.target.value })
                  }
                  pattern="\d{6}"
                  maxLength={6}
                  className="w-full font-mono"
                />
              ) : (
                subgrant.naics_code
              )}
            </TableCell>
            <TableCell className="text-right font-mono">
              {editingId === subgrant.id ? (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.amount || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, amount: parseFloat(e.target.value) })
                  }
                  className="w-full text-right font-mono"
                />
              ) : (
                formatCurrency(subgrant.amount)
              )}
            </TableCell>
            <TableCell>
              <Select
                value={editingId === subgrant.id ? editForm.contract_type : subgrant.contract_type}
                onValueChange={(value) =>
                  editingId === subgrant.id
                    ? setEditForm({ ...editForm, contract_type: value })
                    : console.log("Contract type changed:", value)
                }
                disabled={editingId !== subgrant.id}
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
            <TableCell>
              {editingId === subgrant.id ? (
                <Input
                  type="date"
                  value={editForm.award_date || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, award_date: e.target.value })
                  }
                  className="w-full"
                />
              ) : (
                formatDate(subgrant.award_date)
              )}
            </TableCell>
            <TableCell>{formatDate(subgrant.created_at)}</TableCell>
            <TableCell className="text-center">
              <Select
                value={
                  editingId === subgrant.id
                    ? editForm.certified_dbe ? "yes" : "no"
                    : subgrant.certified_dbe ? "yes" : "no"
                }
                onValueChange={(value) =>
                  editingId === subgrant.id
                    ? setEditForm({ ...editForm, certified_dbe: value === "yes" })
                    : updateSubgrantDBE(subgrant.id, value === "yes")
                }
                disabled={editingId !== subgrant.id}
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
                {editingId === subgrant.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveEdit(subgrant.id)}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditing}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubgrant(subgrant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(subgrant)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
