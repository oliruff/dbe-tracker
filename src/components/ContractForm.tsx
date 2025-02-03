import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export const ContractForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    tadProjectNumber: "",
    contractNumber: "",
    primeContractor: "",
    originalAmount: "",
    dbePercentage: "0.00",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Contract Submitted",
      description: "The contract has been successfully recorded.",
    });
  };

  return (
    <Card className="p-6 animate-fadeIn">
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="originalAmount">Original Contract Amount ($)</Label>
            <Input
              id="originalAmount"
              type="number"
              value={formData.originalAmount}
              onChange={(e) =>
                setFormData({ ...formData, originalAmount: e.target.value })
              }
              className="w-full"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            type="submit"
            className="bg-tdot-red hover:bg-tdot-red/90 text-white"
          >
            Submit Contract
          </Button>
        </div>
      </form>
    </Card>
  );
};