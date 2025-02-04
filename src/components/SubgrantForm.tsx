import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubgrantFormProps {
  contractId: string;
}

export const SubgrantForm = ({ contractId }: SubgrantFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    dbeFirmName: "",
    naicsCode: "",
    amount: "",
    contractType: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate NAICS code format (6 digits)
    if (!/^\d{6}$/.test(formData.naicsCode)) {
      toast({
        title: "Invalid NAICS Code",
        description: "NAICS code must be exactly 6 digits.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("subgrants").insert({
        contract_id: contractId,
        dbe_firm_name: formData.dbeFirmName,
        naics_code: formData.naicsCode,
        amount: parseFloat(formData.amount),
        created_by: user.id
      });

      if (error) throw error;

      setFormData({
        dbeFirmName: "",
        naicsCode: "",
        amount: "",
        contractType: "",
      });

      toast({
        title: "Subgrant Added",
        description: "The subgrant has been successfully recorded.",
      });
    } catch (error) {
      console.error("Error submitting subgrant:", error);
      toast({
        title: "Error",
        description: "There was an error submitting the subgrant. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-tdot-gray">Add Subgrant</h2>
        <p className="text-sm text-gray-600">Add DBE subgrants for this contract</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="dbeFirmName">DBE Firm Name</Label>
            <Input
              id="dbeFirmName"
              value={formData.dbeFirmName}
              onChange={(e) =>
                setFormData({ ...formData, dbeFirmName: e.target.value })
              }
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractType">Type of Contract</Label>
              <select
                id="contractType"
                value={formData.contractType}
                onChange={(e) =>
                  setFormData({ ...formData, contractType: e.target.value })
                }
                className="w-full border rounded p-2"
                required
              >
                <option value="">Select a contract type</option>
                <option value="Subcontract">Subcontract</option>
                <option value="Supplier">Supplier</option>
                <option value="Manufacturer">Manufacturer</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="naicsCode">NAICS Code (6 digits)</Label>
            <Input
              id="naicsCode"
              value={formData.naicsCode}
              onChange={(e) =>
                setFormData({ ...formData, naicsCode: e.target.value })
              }
              pattern="\d{6}"
              maxLength={6}
              placeholder="Enter 6-digit NAICS code"
              className="w-full font-mono"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full"
              required
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            type="submit"
            className="bg-tdot-blue hover:bg-tdot-blue/90 text-white"
          >
            Add Subgrant
          </Button>
        </div>
      </form>
    </Card>
  );
};