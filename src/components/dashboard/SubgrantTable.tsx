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
import "@/App.css"; // Adjust the path as necessary
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;


interface Subgrant {
  id: string;
  dbe_firm_name: string;
  naics_code: string;
  amount: number;
  certified_dbe: boolean;
  created_at: string;
}

interface SubgrantTableProps {
  subgrants: Subgrant[];
  updateSubgrantDBE: (subgrantId: string, value: boolean) => void;
}

export const SubgrantTable = ({ subgrants, updateSubgrantDBE }: SubgrantTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDeleteSubgrant = async (subgrantId: string) => {
    try {
      const { error } = await supabase
        .from("subgrants")
        .delete()
        .eq("id", subgrantId);

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
          <TableHead className="w-[200px]">DBE Firm</TableHead>
          <TableHead className="w-[150px]">NAICS Code</TableHead>
          <TableHead className="w-[150px] text-right">Amount</TableHead>
          <TableHead className="w-[120px]">Date</TableHead>
          <TableHead className="w-[120px]">Certified DBE</TableHead>
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subgrants.map((subgrant) => (
          <TableRow key={subgrant.id} className="group">
            <TableCell>{subgrant.dbe_firm_name}</TableCell>
            <TableCell className="font-mono">{subgrant.naics_code}</TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(subgrant.amount)}
            </TableCell>
            <TableCell>{formatDate(subgrant.created_at)}</TableCell>
            <TableCell>
              <Select
                value={subgrant.certified_dbe ? "yes" : "no"}
                onValueChange={(value) =>
                  updateSubgrantDBE(subgrant.id, value === "yes")
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
                  onClick={() => handleDeleteSubgrant(subgrant.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
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