import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Table } from "@/components/ui/table";
import { ContractTableRow } from "./ContractTableRow";
import type { Contract } from "./ContractTable";

export interface Subgrant {
  id: string;
  contract_id: string;
  dbe_firm_name: string;
  naics_code: string;
  amount: number;
  certified_dbe: boolean;
  contract_type: string;
  award_date: string;
  ethnicity_gender: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const ContractTable = () => {
  const { toast } = useToast();
  const { data: contracts, isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contracts").select(`
        *,
        subgrants (*)
      `);
      if (error) {
        toast({
          title: "Error fetching contracts",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data as Contract[];
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>TAD Project Number</th>
          <th>Contract Number</th>
          <th>Prime Contractor</th>
          <th>Original Amount</th>
          <th>DBE Percentage</th>
          <th>Award Date</th>
          <th>Report Date</th>
          <th>Final Report</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {contracts.map((contract) => (
          <ContractTableRow
            key={contract.id}
            contract={contract}
            isExpanded={false}
            onToggleExpand={() => {}}
            updateSubgrantDBE={() => {}}
          />
        ))}
      </tbody>
    </Table>
  );
};
