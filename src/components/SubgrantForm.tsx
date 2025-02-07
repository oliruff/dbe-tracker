
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

interface SubgrantFormProps {
  contractId: string;
}

export const SubgrantForm = ({ contractId }: SubgrantFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    dbeFirmName: "",
    naicsCode: "",
    amount: "",
    contractType: "",
    certifiedDbe: "no",
    awardDate: "",
    ethnicityGender: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        certified_dbe: formData.certifiedDbe === "yes",
        contract_type: formData.contractType,
        award_date: formData.awardDate,
        ethnicity_gender: formData.ethnicityGender || null,
        created_by: user.id,
      });

      if (error) throw error;

      setFormData({
        dbeFirmName: "",
        naicsCode: "",
        amount: "",
        contractType: "",
        certifiedDbe: "no",
        awardDate: "",
        ethnicityGender: "",
      });

      queryClient.invalidateQueries({ queryKey: ["contracts"] });

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
            <Select
              value={formData.contractType}
              onValueChange={(value) =>
                setFormData({ ...formData, contractType: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a contract type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Subcontract">Subcontract</SelectItem>
                <SelectItem value="Supplier">Supplier</SelectItem>
                <SelectItem value="Manufacturer">Manufacturer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ethnicityGender">Ethnicity/Gender</Label>
            <Select
              value={formData.ethnicityGender}
              onValueChange={(value) =>
                setFormData({ ...formData, ethnicityGender: value })
              }
            >
              <SelectTrigger className="w-full">
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
            <Label htmlFor="awardDate">Date of Award</Label>
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
          <div className="space-y-2">
            <Label htmlFor="certifiedDbe">DBE Certified</Label>
            <Select
              value={formData.certifiedDbe}
              onValueChange={(value) =>
                setFormData({ ...formData, certifiedDbe: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
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
