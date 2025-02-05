import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { SearchFilters } from "./dashboard/SearchFilters";
import { ContractTable } from "./dashboard/ContractTable";
import type { Contract, Subgrant } from "./dashboard/ContractTable";

export const ContractDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedContract, setExpandedContract] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  });

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data: contracts, error } = await supabase
        .from("contracts")
        .select(`
          *,
          subgrants (
            id,
            dbe_firm_name,
            naics_code,
            amount,
            certified_dbe,
            contract_type,
            award_date,
            created_at,
            created_by,
            updated_at,
            contract_id
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return contracts as Contract[];
    },
  });

  const updateSubgrantDBE = async (subgrantId: string, value: boolean) => {
    const { error } = await supabase
      .from("subgrants")
      .update({ certified_dbe: value })
      .eq("id", subgrantId);

    if (error) {
      console.error("Error updating certified DBE status:", error);
    }
  };

  const filteredContracts = contracts?.filter((contract) => {
    const matchesSearch =
      contract.tad_project_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.prime_contractor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAmount =
      (!filters.minAmount || contract.original_amount >= parseFloat(filters.minAmount)) &&
      (!filters.maxAmount || contract.original_amount <= parseFloat(filters.maxAmount));

    const contractDate = new Date(contract.created_at);
    const matchesDate =
      (!filters.startDate || contractDate >= new Date(filters.startDate)) &&
      (!filters.endDate || contractDate <= new Date(filters.endDate));

    return matchesSearch && matchesAmount && matchesDate;
  });

  if (isLoading) {
    return <div>Loading contracts...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <SearchFilters
          searchTerm={searchTerm}
          filters={filters}
          setSearchTerm={setSearchTerm}
          setFilters={setFilters}
        />
      </Card>

      <Card className="p-6">
        <ContractTable
          contracts={filteredContracts || []}
          expandedContract={expandedContract}
          setExpandedContract={setExpandedContract}
          updateSubgrantDBE={updateSubgrantDBE}
        />
      </Card>
    </div>
  );
};