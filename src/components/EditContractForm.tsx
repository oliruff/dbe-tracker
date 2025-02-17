import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Contract, Subgrant } from "@/types/contracts";

export const EditContractForm = memo(() => {
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
    finalReport: "no", // Added final report field
  });

  const [subgrants, setSubgrants] = useState<Subgrant[]>([]);

  const { data: contract, isLoading } = useQuery({
    queryKey: ["contract", contractId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          subgrants (*)
        `)
        .eq("id", contractId)
        .single();

      if (error) throw error;
      return data as Contract;
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
        finalReport: contract.final_report ? "yes" : "no", // Set final report value
      });
      setSubgrants(contract.subgrants || []);
    }
  }, [contract]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tadProjectNumber || !formData.contractNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    try {
      const { error: contractError } = await supabase
        .from("contracts")
        .update({
          tad_project_number: formData.tadProjectNumber,
          contract_number: formData.contractNumber,
          prime_contractor: formData.primeContractor,
          original_amount: parseFloat(formData.originalAmount),
          dbe_percentage: parseFloat(formData.dbePercentage || "0"),
          award_date: formData.awardDate,
          report_date: formData.reportDate,
          final_report: formData.finalReport === "yes", // Include final report in update
        })
        .eq("id", contractId);

      if (contractError) throw contractError;

      for (const subgrant of subgrants) {
        const { error: subgrantError } = await supabase
          .from("subgrants")
          .update({
            dbe_firm_name: subgrant.dbe_firm_name,
            naics_code: subgrant.naics_code,
            amount: subgrant.amount,
            certified_dbe: subgrant.certified_dbe,
            contract_type: subgrant.contract_type,
            award_date: subgrant.award_date,
            ethnicity_gender: subgrant.ethnicity_gender,
          })
          .eq("id", subgrant.id);

        if (subgrantError) throw subgrantError;
      }

      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({
        title: "Contract Updated",
        description: "The contract and its subgrants have been successfully updated.",
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
  }, [formData, queryClient, toast, navigate]);

  const handleSubgrantChange = useCallback((index: number, field: keyof Subgrant, value: any) => {
    const updatedSubgrants = [...subgrants];
    updatedSubgrants[index] = {
      ...updatedSubgrants[index],
      [field]: value,
    };
    setSubgrants(updatedSubgrants);
  }, [subgrants]);

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
          <div className="space-y-2">
            <Label htmlFor="finalReport">Final Report</Label>
            <Select
              value={formData.finalReport}
              onValueChange={(value) =>
                setFormData({ ...formData, finalReport: value })
              }
            >
              <SelectTrigger id="finalReport" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="awardDate">Award Date</Label>
            <Input
              id="awardDate"
              type="date"
              value={formData.awardDate}
              onChange={(e) =>
                setFormData({ ...formData, awardDate: e.target.value })
              }
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reportDate">Report Date</Label>
            <Input
              id="reportDate"
              type="date"
              value={formData.reportDate}
              onChange={(e) =>
                setFormData({ ...formData, reportDate: e.target.value })
              }
              className="w-full"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Subgrants</h3>
          {subgrants.map((subgrant, index) => (
            <Card key={subgrant.id} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>DBE Firm Name</Label>
                  <Input
                    value={subgrant.dbe_firm_name}
                    onChange={(e) =>
                      handleSubgrantChange(index, "dbe_firm_name", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>NAICS Code</Label>
                  <Input
                    value={subgrant.naics_code}
                    onChange={(e) =>
                      handleSubgrantChange(index, "naics_code", e.target.value)
                    }
                    pattern="\d{6}"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={subgrant.amount}
                    onChange={(e) =>
                      handleSubgrantChange(index, "amount", parseFloat(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contract Type</Label>
                  <Select
                    value={subgrant.contract_type}
                    onValueChange={(value) =>
                      handleSubgrantChange(index, "contract_type", value)
                    }
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
                </div>
                <div className="space-y-2">
                  <Label>Ethnicity/Gender</Label>
                  <Select
                    value={subgrant.ethnicity_gender || ""}
                    onValueChange={(value) =>
                      handleSubgrantChange(index, "ethnicity_gender", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ethnicity/gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Black American/Female">Black American Female</SelectItem>
                      <SelectItem value="Black American/Male">Black American Male</SelectItem>
                      <SelectItem value="Hispanic American/Female">Hispanic American Female</SelectItem>
                      <SelectItem value="Hispanic American/Male">Hispanic American Male</SelectItem>
                      <SelectItem value="Native American/Female">Native American Female</SelectItem>
                      <SelectItem value="Native American/Male">Native American Male</SelectItem>
                      <SelectItem value="Asian-Pacific American/Female">Asian-Pacific American Female</SelectItem>
                      <SelectItem value="Asian-Pacific American/Male">Asian-Pacific American Male</SelectItem>
                      <SelectItem value="Subcontinent Asian American/Female">Subcontinent Asian American Female</SelectItem>
                      <SelectItem value="Subcontinent Asian American/Male">Subcontinent Asian American Male</SelectItem>
                      <SelectItem value="Non-Minority/Female">Non-Minority Female</SelectItem>
                      <SelectItem value="Non-Minority/Male">Non-Minority Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Award Date</Label>
                  <Input
                    type="date"
                    value={subgrant.award_date}
                    onChange={(e) =>
                      handleSubgrantChange(index, "award_date", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>DBE Certified</Label>
                  <Select
                    value={subgrant.certified_dbe ? "yes" : "no"}
                    onValueChange={(value) =>
                      handleSubgrantChange(index, "certified_dbe", value === "yes")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ))}
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
});
