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
import { formatCurrency, formatDate } from "@/lib/format";

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
        </TableRow>
      </TableHeader>
      <TableBody>
        {subgrants.map((subgrant) => (
          <TableRow key={subgrant.id}>
            <TableCell>{subgrant.dbe_firm_name}</TableCell>
            <TableCell>{subgrant.naics_code}</TableCell>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};