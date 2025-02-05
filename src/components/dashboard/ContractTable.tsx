import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContractTableRow } from "./ContractTableRow";

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
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-auto">TAD Project #</TableHead>
            <TableHead className="w-auto">Contract #</TableHead>
            <TableHead className="w-auto">Prime Contractor</TableHead>
            <TableHead className="w-auto">Amount</TableHead>
            <TableHead className="w-auto">DBE %</TableHead>
            <TableHead className="w-auto">Date</TableHead>
            <TableHead className="w-auto">Final Report</TableHead>
            <TableHead className="w-auto">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <ContractTableRow
              key={contract.id}
              contract={contract}
              isExpanded={expandedContract === contract.id}
              onToggleExpand={() =>
                setExpandedContract(
                  expandedContract === contract.id ? null : contract.id
                )
              }
              updateSubgrantDBE={updateSubgrantDBE}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};