import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Printer, Download } from "lucide-react";
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
      primeContracts: { amount: 0, count: 0 },
      subcontracts: { amount: 0, count: 0 },
      dbeBreakdown: {} as Record<string, { 
        women: { amount: number; count: number }; 
        men: { amount: number; count: number }; 
      }>,
    };

    const selectedContractsData = contracts.filter(
      contract => selectedContracts.length === 0 || selectedContracts.includes(contract.id)
    );

    const primeAmount = selectedContractsData.reduce(
      (sum, contract) => sum + contract.original_amount, 
      0
    );

    const dbeBreakdown: Record<string, { 
      women: { amount: number; count: number }; 
      men: { amount: number; count: number }; 
    }> = {
      "Black American": { women: { amount: 0, count: 0 }, men: { amount: 0, count: 0 } },
      "Hispanic American": { women: { amount: 0, count: 0 }, men: { amount: 0, count: 0 } },
      "Native American": { women: { amount: 0, count: 0 }, men: { amount: 0, count: 0 } },
      "Asian-Pacific American": { women: { amount: 0, count: 0 }, men: { amount: 0, count: 0 } },
      "Subcontinent Asian American": { women: { amount: 0, count: 0 }, men: { amount: 0, count: 0 } },
      "Non-Minority": { women: { amount: 0, count: 0 }, men: { amount: 0, count: 0 } },
    };

    let totalSubcontractAmount = 0;
    let totalSubcontractCount = 0;

    selectedContractsData.forEach(contract => {
      contract.subgrants?.forEach(subgrant => {
        if (subgrant.certified_dbe && subgrant.ethnicity_gender) {
          totalSubcontractAmount += subgrant.amount;
          totalSubcontractCount++;

          const [ethnicity, gender] = subgrant.ethnicity_gender.split('/');
          if (dbeBreakdown[ethnicity]) {
            const genderKey = gender.toLowerCase() === 'female' ? 'women' : 'men';
            dbeBreakdown[ethnicity][genderKey].amount += subgrant.amount;
            dbeBreakdown[ethnicity][genderKey].count += 1;
          }
        }
      });
    });

    return {
      primeContracts: { 
        amount: primeAmount, 
        count: selectedContractsData.length 
      },
      subcontracts: { 
        amount: totalSubcontractAmount, 
        count: totalSubcontractCount 
      },
      dbeBreakdown,
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
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-tdot-gray">DBE Achievement Report</h1>
              <p className="text-gray-600 mt-2">
                Uniform Report of DBE Awards/Commitments and Payments
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

          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Awards/Commitments this Reporting Period</h2>
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

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-2 text-left">Type</th>
                      <th className="border p-2 text-right">Total Dollars</th>
                      <th className="border p-2 text-right">Total Number</th>
                      <th className="border p-2 text-right">Total to DBEs (dollars)</th>
                      <th className="border p-2 text-right">Total to DBEs (number)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">Prime contracts awarded this period</td>
                      <td className="border p-2 text-right font-mono">
                        {formatCurrency(totals.primeContracts.amount)}
                      </td>
                      <td className="border p-2 text-right font-mono">
                        {totals.primeContracts.count}
                      </td>
                      <td className="border p-2 text-right font-mono">$0</td>
                      <td className="border p-2 text-right font-mono">0</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Subcontracts awarded/committed this period</td>
                      <td className="border p-2 text-right font-mono">
                        {formatCurrency(totals.subcontracts.amount)}
                      </td>
                      <td className="border p-2 text-right font-mono">
                        {totals.subcontracts.count}
                      </td>
                      <td className="border p-2 text-right font-mono">
                        {formatCurrency(totals.subcontracts.amount)}
                      </td>
                      <td className="border p-2 text-right font-mono">
                        {totals.subcontracts.count}
                      </td>
                    </tr>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="border p-2">TOTAL</td>
                      <td className="border p-2 text-right font-mono">
                        {formatCurrency(totals.primeContracts.amount + totals.subcontracts.amount)}
                      </td>
                      <td className="border p-2 text-right font-mono">
                        {totals.primeContracts.count + totals.subcontracts.count}
                      </td>
                      <td className="border p-2 text-right font-mono">
                        {formatCurrency(totals.subcontracts.amount)}
                      </td>
                      <td className="border p-2 text-right font-mono">
                        {totals.subcontracts.count}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Breakdown by Ethnicity & Gender</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-2 text-left">Category</th>
                        <th className="border p-2 text-right">Women Total ($)</th>
                        <th className="border p-2 text-right">Men Total ($)</th>
                        <th className="border p-2 text-right">Combined Total ($)</th>
                        <th className="border p-2 text-right">Women Count</th>
                        <th className="border p-2 text-right">Men Count</th>
                        <th className="border p-2 text-right">Total Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(totals.dbeBreakdown).map(([category, data]) => (
                        <tr key={category}>
                          <td className="border p-2">{category}</td>
                          <td className="border p-2 text-right font-mono">
                            {formatCurrency(data.women.amount)}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {formatCurrency(data.men.amount)}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {formatCurrency(data.women.amount + data.men.amount)}
                          </td>
                          <td className="border p-2 text-right font-mono">{data.women.count}</td>
                          <td className="border p-2 text-right font-mono">{data.men.count}</td>
                          <td className="border p-2 text-right font-mono">
                            {data.women.count + data.men.count}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td className="border p-2">TOTAL</td>
                        <td className="border p-2 text-right font-mono">
                          {formatCurrency(
                            Object.values(totals.dbeBreakdown).reduce(
                              (sum, data) => sum + data.women.amount,
                              0
                            )
                          )}
                        </td>
                        <td className="border p-2 text-right font-mono">
                          {formatCurrency(
                            Object.values(totals.dbeBreakdown).reduce(
                              (sum, data) => sum + data.men.amount,
                              0
                            )
                          )}
                        </td>
                        <td className="border p-2 text-right font-mono">
                          {formatCurrency(
                            Object.values(totals.dbeBreakdown).reduce(
                              (sum, data) => sum + data.women.amount + data.men.amount,
                              0
                            )
                          )}
                        </td>
                        <td className="border p-2 text-right font-mono">
                          {Object.values(totals.dbeBreakdown).reduce(
                            (sum, data) => sum + data.women.count,
                            0
                          )}
                        </td>
                        <td className="border p-2 text-right font-mono">
                          {Object.values(totals.dbeBreakdown).reduce(
                            (sum, data) => sum + data.men.count,
                            0
                          )}
                        </td>
                        <td className="border p-2 text-right font-mono">
                          {Object.values(totals.dbeBreakdown).reduce(
                            (sum, data) => sum + data.women.count + data.men.count,
                            0
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-8">Loading report data...</div>
              ) : (
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
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;