import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContractTableRow } from "./ContractTableRow";

export interface Contract {
  id: string;
  tad_project_number: string;
  contract_number: string;
  prime_contractor: string;
  original_amount: number;
  dbe_percentage: number;
  final_report: boolean;
  award_date: string;
  report_date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  subgrants?: Subgrant[];
}

export interface Subgrant {
  id: string;
  dbe_firm_name: string;
  naics_code: string;
  amount: number;
  certified_dbe: boolean;
  contract_type: string;
  award_date: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  contract_id: string;
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
            <th className="h-12 px-4 text-left font-medium text-muted-foreground w-auto">
              TAD Project #
            </th>
            <th className="h-12 px-4 text-left font-medium text-muted-foreground w-auto">
              Contract #
            </th>
            <th className="h-12 px-4 text-left font-medium text-muted-foreground w-auto">
              Prime Contractor
            </th>
            <th className="h-12 px-4 text-right font-medium text-muted-foreground w-auto">
              Amount
            </th>
            <th className="h-12 px-4 text-right font-medium text-muted-foreground w-auto">
              DBE %
            </th>
            <th className="h-12 px-4 text-left font-medium text-muted-foreground w-auto">
              Award Date
            </th>
            <th className="h-12 px-4 text-left font-medium text-muted-foreground w-auto">
              Report Date
            </th>
            <th className="h-12 px-4 text-center font-medium text-muted-foreground w-auto">
              Final Report
            </th>
            <th className="h-12 px-4 text-right font-medium text-muted-foreground w-auto">
              Actions
            </th>
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
    </div>
  );
};