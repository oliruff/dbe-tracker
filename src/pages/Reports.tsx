import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Printer, Download } from "lucide-react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format";

const Reports = () => {
  const [reportPeriod, setReportPeriod] = useState<string>("annual");

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          subgrants (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const calculateTotals = () => {
    if (!contracts) return {
      totalContracts: 0,
      totalAmount: 0,
      totalDBEAmount: 0,
      dbePercentage: 0,
    };

    const totalAmount = contracts.reduce((sum, contract) => sum + contract.original_amount, 0);
    const totalDBEAmount = contracts.reduce((sum, contract) => {
      const subgrantTotal = contract.subgrants?.reduce((subSum, subgrant) => 
        subgrant.certified_dbe ? subSum + subgrant.amount : subSum, 0) || 0;
      return sum + subgrantTotal;
    }, 0);

    return {
      totalContracts: contracts.length,
      totalAmount,
      totalDBEAmount,
      dbePercentage: totalAmount > 0 ? (totalDBEAmount / totalAmount) * 100 : 0,
    };
  };

  const totals = calculateTotals();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-tdot-gray">DBE Achievement Reports</h1>
              <p className="text-gray-600 mt-2">
                View and generate DBE participation reports
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          <Card className="p-6 animate-fadeIn">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Uniform Report of DBE Commitments/Awards and Payments</h2>
                <Select value={reportPeriod} onValueChange={setReportPeriod}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual Report</SelectItem>
                    <SelectItem value="june">June Report</SelectItem>
                    <SelectItem value="december">December Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">Total Contracts</div>
                  <div className="text-2xl font-bold">{totals.totalContracts}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">Total Amount</div>
                  <div className="text-2xl font-bold">{formatCurrency(totals.totalAmount)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">DBE Amount</div>
                  <div className="text-2xl font-bold">{formatCurrency(totals.totalDBEAmount)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">DBE Percentage</div>
                  <div className="text-2xl font-bold">{totals.dbePercentage.toFixed(2)}%</div>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-8">Loading report data...</div>
              ) : (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Report Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Recipient Name</label>
                        <div className="font-medium">State of Tennessee Block Grant - TN DOT</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Address</label>
                        <div className="font-medium">
                          505 Deaderick Street
                          <br />
                          Nashville TN 37243
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;