import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { SubgrantForm } from "./SubgrantForm";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ContractForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    tadProjectNumber: "",
    contractNumber: "",
    primeContractor: "",
    originalAmount: "",
    dbePercentage: "",
    awardDate: "",
    reportDate: "",
    finalReport: "no", // New field for Final Report ("yes" or "no")
  });
  const [contractId, setContractId] = useState<string | null>(null);
  const [showSubgrantForm, setShowSubgrantForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Insert the contract along with the new date fields
      const { data: contract, error } = await supabase
        .from("contracts")
        .insert({
          tad_project_number: formData.tadProjectNumber,
          contract_number: formData.contractNumber,
          prime_contractor: formData.primeContractor,
          original_amount: parseFloat(formData.originalAmount),
          dbe_percentage: parseFloat(formData.dbePercentage || "0"),
          final_report: formData.finalReport === "yes", // Convert select to boolean
          award_date: formData.awardDate, // New field
          report_date: formData.reportDate, // New field
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setContractId(contract.id);
      setShowSubgrantForm(true);
      
      toast({
        title: "Contract Submitted",
        description: "The contract has been successfully recorded. You can now add subgrants.",
      });
    } catch (error) {
      console.error("Error submitting contract:", error);
      toast({
        title: "Error",
        description: "There was an error submitting the contract. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Existing Fields */}
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
            {/* New Final Report Select */}
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
            {/* New Date Fields */}
            <div className="space-y-2">
              <Label htmlFor="awardDate">Contract Award Date</Label>
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
              <Label htmlFor="reportDate">Date Report Prepared</Label>
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
          <div className="flex justify-end">
            <Button 
              type="submit"
              className="bg-tdot-red hover:bg-tdot-red/90 text-white"
              disabled={showSubgrantForm}
            >
              Submit Contract
            </Button>
          </div>
        </form>
      </Card>

      {showSubgrantForm && contractId && (
        <SubgrantForm contractId={contractId} />
      )}
    </div>
  );
};
