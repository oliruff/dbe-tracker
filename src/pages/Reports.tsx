import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Printer, Download, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format";
import type { Contract } from "@/types/contracts";

const Reports = () => {
  const [reportPeriod, setReportPeriod] = useState<string>("annual");
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);

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
      return data as Contract[];
    },
  });

  const calculateTotals = () => {
    if (!contracts) return {
      totalContracts: 0,
      totalAmount: 0,
      totalDBEAmount: 0,
      dbePercentage: 0,
      ethnicityGenderBreakdown: {} as Record<string, { count: number; amount: number }>,
    };

    const selectedContractsData = contracts.filter(
      contract => selectedContracts.length === 0 || selectedContracts.includes(contract.id)
    );

    const totalAmount = selectedContractsData.reduce(
      (sum, contract) => sum + contract.original_amount, 
      0
    );

    const ethnicityGenderBreakdown: Record<string, { count: number; amount: number }> = {};

    const totalDBEAmount = selectedContractsData.reduce((sum, contract) => {
      const subgrantTotal = contract.subgrants?.reduce((subSum, subgrant) => {
        if (subgrant.certified_dbe) {
          if (subgrant.ethnicity_gender) {
            if (!ethnicityGenderBreakdown[subgrant.ethnicity_gender]) {
              ethnicityGenderBreakdown[subgrant.ethnicity_gender] = { count: 0, amount: 0 };
            }
            ethnicityGenderBreakdown[subgrant.ethnicity_gender].count += 1;
            ethnicityGenderBreakdown[subgrant.ethnicity_gender].amount += subgrant.amount;
          }
          return subSum + subgrant.amount;
        }
        return subSum;
      }, 0) || 0;
      return sum + subgrantTotal;
    }, 0);

    return {
      totalContracts: selectedContractsData.length,
      totalAmount,
      totalDBEAmount,
      dbePercentage: totalAmount > 0 ? (totalDBEAmount / totalAmount) * 100 : 0,
      ethnicityGenderBreakdown,
    };
  };

  const totals = calculateTotals();

  const handleContractSelection = (contractId: string) => {
    setSelectedContracts(prev => 
      prev.includes(contractId)
        ? prev.filter(id => id !== contractId)
        : [...prev, contractId]
    );
  };

  const handleSelectAll = () => {
    if (contracts) {
      if (selectedContracts.length === contracts.length) {
        setSelectedContracts([]);
      } else {
        setSelectedContracts(contracts.map(c => c.id));
      }
    }
  };

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
                <>
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Contracts Selection</h3>
                      <Button variant="outline" onClick={handleSelectAll}>
                        {contracts && selectedContracts.length === contracts.length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {contracts?.map(contract => (
                        <div
                          key={contract.id}
                          className="flex items-center space-x-4 p-4 bg-white rounded-lg border"
                        >
                          <Checkbox
                            checked={selectedContracts.includes(contract.id)}
                            onCheckedChange={() => handleContractSelection(contract.id)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{contract.contract_number}</div>
                            <div className="text-sm text-gray-600">
                              {contract.prime_contractor} - {formatCurrency(contract.original_amount)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">DBE Participation by Ethnicity/Gender</h3>
                    <div className="space-y-2">
                      {Object.entries(totals.ethnicityGenderBreakdown).map(([category, data]) => (
                        <div
                          key={category}
                          className="flex justify-between items-center p-4 bg-white rounded-lg border"
                        >
                          <div>
                            <div className="font-medium">{category}</div>
                            <div className="text-sm text-gray-600">
                              {data.count} subgrant{data.count !== 1 ? "s" : ""}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(data.amount)}</div>
                            <div className="text-sm text-gray-600">
                              {((data.amount / totals.totalDBEAmount) * 100).toFixed(1)}% of DBE total
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

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
                </>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;