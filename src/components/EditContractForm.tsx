import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export const EditContractForm = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    tadProjectNumber: "",
    contractNumber: "",
    primeContractor: "",
    originalAmount: "",
    dbePercentage: "",
    awardDate: "",
    reportDate: "",
  });

  const { data: contract, isLoading } = useQuery({
    queryKey: ["contract", contractId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (contract) {
      setFormData({
        tadProjectNumber: contract.tad_project_number,
        contractNumber: contract.contract_number,
        primeContractor: contract.prime_contractor,
        originalAmount: contract.original_amount.toString(),
        dbePercentage: contract.dbe_percentage.toString(),
        awardDate: contract.award_date || "",
        reportDate: contract.report_date || "",
      });
    }
  }, [contract]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("contracts")
        .update({
          tad_project_number: formData.tadProjectNumber,
          contract_number: formData.contractNumber,
          prime_contractor: formData.primeContractor,
          original_amount: parseFloat(formData.originalAmount),
          dbe_percentage: parseFloat(formData.dbePercentage || "0"),
        })
        .eq("id", contractId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({
        title: "Contract Updated",
        description: "The contract has been successfully updated.",
      });
      navigate("/");
    } catch (error) {
      console.error("Error updating contract:", error);
      toast({
        title: "Error",
        description: "There was an error updating the contract. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tadProjectNumber">TAD Project Number</Label>
            <Input
              id="tadProjectNumber"
              value={formData.tadProjectNumber}
              onChange={(e) =>
                setFormData({ ...formData, tadProjectNumber: e.target.value })
              }
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractNumber">Contract Number</Label>
            <Input
              id="contractNumber"
              value={formData.contractNumber}
              onChange={(e) =>
                setFormData({ ...formData, contractNumber: e.target.value })
              }
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primeContractor">Prime Contractor Name</Label>
            <Input
              id="primeContractor"
              value={formData.primeContractor}
              onChange={(e) =>
                setFormData({ ...formData, primeContractor: e.target.value })
              }
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="originalAmount">Original Contract Amount ($)</Label>
            <Input
              id="originalAmount"
              type="number"
              step="0.01"
              min="0"
              value={formData.originalAmount}
              onChange={(e) =>
                setFormData({ ...formData, originalAmount: e.target.value })
              }
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dbePercentage">DBE Percentage (%)</Label>
            <Input
              id="dbePercentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.dbePercentage}
              onChange={(e) =>
                setFormData({ ...formData, dbePercentage: e.target.value })
              }
              className="w-full"
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-tdot-red hover:bg-tdot-red/90 text-white"
          >
            Update Contract
          </Button>
        </div>
      </form>
    </Card>
  );
};