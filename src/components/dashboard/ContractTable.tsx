import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContractTableRow } from "./ContractTableRow";
import type { Contract } from "@/types/contracts";

interface ContractTableProps {
  contracts: Contract[];
  expandedContract: string | null;
  setExpandedContract: (id: string | null) => void;
  updateSubgrantDBE: (subgrantId: string, value: boolean) => void;
}

export const ContractTable = ({
  contracts,
  expandedContract,
  setExpandedContract,
  updateSubgrantDBE,
}: ContractTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>TAD Project Number</TableHead>
          <TableHead>Contract Number</TableHead>
          <TableHead>Prime Contractor</TableHead>
          <TableHead>Original Amount</TableHead>
          <TableHead>DBE Percentage</TableHead>
          <TableHead>Award Date</TableHead>
          <TableHead>Report Date</TableHead>
          <TableHead>Final Report</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.map((contract) => (
          <ContractTableRow
            key={contract.id}
            contract={contract}
            isExpanded={expandedContract === contract.id}
            onToggleExpand={() =>
              setExpandedContract(expandedContract === contract.id ? null : contract.id)
            }
            updateSubgrantDBE={updateSubgrantDBE}
          />
        ))}
      </TableBody>
    </Table>
  );
};