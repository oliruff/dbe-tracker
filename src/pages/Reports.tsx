import { useState, useEffect, memo } from "react";
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

const Reports = memo(() => {
  const [reportPeriod, setReportPeriod] = useState<string>("annual");
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);

  const { data: contracts, isLoading, error } = useQuery({
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
      if (contract.subgrants) {
        contract.subgrants.forEach(subgrant => {
          if (subgrant.certified_dbe) {
            totalSubcontractAmount += subgrant.amount;
            totalSubcontractCount++;

            if (subgrant.ethnicity_gender) {
              const [ethnicity, gender] = subgrant.ethnicity_gender.split('/');
              if (dbeBreakdown[ethnicity]) {
                const genderKey = gender.toLowerCase() === 'female' ? 'women' : 'men';
                dbeBreakdown[ethnicity][genderKey].amount += subgrant.amount;
                dbeBreakdown[ethnicity][genderKey].count += 1;
              }
            }
          }
        });
      }
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

  const calculatePayments = () => {
    if (!contracts) return {
      ongoingContracts: { count: 0, amount: 0, dbeAmount: 0, dbeCount: 0 },
      completedContracts: { 
        raceConscious: { count: 0, amount: 0, dbeNeeded: 0, dbeParticipation: 0 },
        raceNeutral: { count: 0, amount: 0, dbeNeeded: 0, dbeParticipation: 0 }
      }
    };

    const selectedContractsData = contracts.filter(
      contract => selectedContracts.length === 0 || selectedContracts.includes(contract.id)
    );

    const ongoingContracts = selectedContractsData.filter(c => !c.final_report);
    const ongoingDbeCounts = ongoingContracts.reduce((acc, contract) => {
      if (contract.subgrants) {
        acc.dbeCount += contract.subgrants.filter(s => s.certified_dbe).length;
        acc.dbeAmount += contract.subgrants.reduce((sum, s) => s.certified_dbe ? sum + s.amount : sum, 0);
      }
      return acc;
    }, { dbeCount: 0, dbeAmount: 0 });

    const completedContracts = selectedContractsData.filter(c => c.final_report);
    const completedContractTotals = completedContracts.reduce((acc, contract) => {
      const isRaceConscious = contract.dbe_percentage > 0;
      const category = isRaceConscious ? 'raceConscious' : 'raceNeutral';
      
      acc[category].count += 1;
      acc[category].amount += contract.original_amount;
      acc[category].dbeNeeded += (contract.original_amount * contract.dbe_percentage / 100);
      if (contract.subgrants) {
        acc[category].dbeParticipation += contract.subgrants
          .filter(s => s.certified_dbe)
          .reduce((sum, s) => sum + s.amount, 0);
      }
      
      return acc;
    }, {
      raceConscious: { count: 0, amount: 0, dbeNeeded: 0, dbeParticipation: 0 },
      raceNeutral: { count: 0, amount: 0, dbeNeeded: 0, dbeParticipation: 0 }
    });

    return {
      ongoingContracts: {
        count: ongoingContracts.length,
        amount: ongoingContracts.reduce((sum, c) => sum + c.original_amount, 0),
        ...ongoingDbeCounts
      },
      completedContracts: completedContractTotals
    };
  };

  const totals = calculateTotals();
  const payments = calculatePayments();

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching contracts: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container max-w-[1400px] mx-auto px-6 pt-24 pb-12">
        <div className="space-y-8">
          {/* Report Header Section */}
          <div className="relative bg-white rounded-lg shadow-sm p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold text-tdot-gray text-center mb-8">
                UNIFORM REPORT OF DBE COMMITMENTS/AWARDS AND PAYMENTS
              </h1>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* AIP Numbers */}
                  <div className="space-y-2">
                    <p className="font-semibold text-sm text-gray-700">1. FAA AIP Numbers:</p>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border rounded-md bg-gray-50 focus:ring-2 focus:ring-tdot-blue focus:border-transparent" 
                      placeholder="Enter AIP Numbers" 
                    />
                  </div>
                  
                  {/* DBE Goals */}
                  <div className="space-y-3">
                    <p className="font-semibold text-sm text-gray-700">2. Annual DBE Goal(s):</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm w-28">Race Conscious:</span>
                        <input
                          type="number"
                          className="p-2 border rounded-md w-24 bg-gray-50 focus:ring-2 focus:ring-tdot-blue focus:border-transparent"
                          placeholder="0.00"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                        <span className="text-sm">%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm w-28">Race Neutral:</span>
                        <input
                          type="number"
                          className="p-2 border rounded-md w-24 bg-gray-50 focus:ring-2 focus:ring-tdot-blue focus:border-transparent"
                          placeholder="0.00"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agency Selection */}
                <div className="space-y-2">
                  <p className="font-semibold text-sm text-gray-700">3. Agency:</p>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="submittedTo"
                      className="w-4 h-4 text-tdot-blue"
                      value="FAA"
                      checked
                      readOnly
                    />
                    FAA
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-8 right-8 flex gap-3">
              <Button variant="outline" onClick={handlePrint} className="h-9">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button className="h-9">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Report Content */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="space-y-6">
              {/* Period Selection */}
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-800">Awards/Commitments this Reporting Period</h2>
                <Select value={reportPeriod} onValueChange={setReportPeriod}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="june">Report due June 1 (Oct 1-Mar 31)</SelectItem>
                    <SelectItem value="december">Report due Dec 1 (Apr 1-Sep 30)</SelectItem>
                    <SelectItem value="annual">FAA annual report due Dec 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tables */}
              <div className="space-y-8">
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-sm">
                        <th className="border-b p-3 text-left font-medium text-gray-600">Type</th>
                        <th className="border-b p-3 text-right font-medium text-gray-600">Total Dollars</th>
                        <th className="border-b p-3 text-right font-medium text-gray-600">Total Number</th>
                        <th className="border-b p-3 text-right font-medium text-gray-600 whitespace-nowrap">Total to DBEs ($)</th>
                        <th className="border-b p-3 text-right font-medium text-gray-600 whitespace-nowrap">Total to DBEs (#)</th>
                        <th className="border-b p-3 text-right font-medium text-gray-600 whitespace-nowrap">Total to DBE/Race Conscious ($)</th>
                        <th className="border-b p-3 text-right font-medium text-gray-600 whitespace-nowrap">Total to DBE/Race Conscious (#)</th>
                        <th className="border-b p-3 text-right font-medium text-gray-600 whitespace-nowrap">Total to DBE/Race Neutral ($)</th>
                        <th className="border-b p-3 text-right font-medium text-gray-600 whitespace-nowrap">Total to DBE/Race Neutral (#)</th>
                        <th className="border-b p-3 text-right font-medium text-gray-600 whitespace-nowrap">% of Total Dollars to DBEs</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr>
                        <td className="border-b p-3">Prime contracts awarded this period</td>
                        <td className="border-b p-3 text-right font-mono">
                          {formatCurrency(totals.primeContracts.amount)}
                        </td>
                        <td className="border-b p-3 text-right font-mono">
                          {totals.primeContracts.count}
                        </td>
                        <td className="border-b p-3 text-right font-mono">$0</td>
                        <td className="border-b p-3 text-right font-mono">0</td>
                        <td className="border-b p-3 text-right font-mono">$0</td>
                        <td className="border-b p-3 text-right font-mono">0</td>
                        <td className="border-b p-3 text-right font-mono">$0</td>
                        <td className="border-b p-3 text-right font-mono">0</td>
                        <td className="border-b p-3 text-right font-mono">0%</td>
                      </tr>
                      <tr>
                        <td className="border-b p-3">Subcontracts awarded/committed this period</td>
                        <td className="border-b p-3 text-right font-mono">
                          {formatCurrency(totals.subcontracts.amount)}
                        </td>
                        <td className="border-b p-3 text-right font-mono">
                          {totals.subcontracts.count}
                        </td>
                        <td className="border-b p-3 text-right font-mono">
                          {formatCurrency(totals.subcontracts.amount)}
                        </td>
                        <td className="border-b p-3 text-right font-mono">
                          {totals.subcontracts.count}
                        </td>
                        <td className="border-b p-3 text-right font-mono">
                          {formatCurrency(totals.subcontracts.amount)}
                        </td>
                        <td className="border-b p-3 text-right font-mono">
                          {totals.subcontracts.count}
                        </td>
                        <td className="border-b p-3 text-right font-mono">$0</td>
                        <td className="border-b p-3 text-right font-mono">0</td>
                        <td className="border-b p-3 text-right font-mono">
                          {totals.primeContracts.amount > 0 
                            ? `${((totals.subcontracts.amount / totals.primeContracts.amount) * 100).toFixed(2)}%`
                            : '0%'}
                        </td>
                      </tr>
                      <tr className="bg-gray-50 font-medium">
                        <td className="border-b p-3">TOTAL</td>
                        <td className="border-b p-3 text-right font-mono">
                          {formatCurrency(totals.primeContracts.amount + totals.subcontracts.amount)}
                        </td>
                        <td className="border-b p-3 text-right font-mono">
                          {totals.primeContracts.count + totals.subcontracts.count}
                        </td>
                        <td className="border-b p-3 text-right font-mono">
                          {formatCurrency(totals.subcontracts.amount)}
                        </td>
                        <td className="border-b p-3 text-right font-mono">
                          {totals.subcontracts.count}
                        </td>
                        <td className="border-b p-3 text-right font-mono">
                          {formatCurrency(totals.subcontracts.amount)}
                        </td>
                        <td className="border-b p-3 text-right font-mono">
                          {totals.subcontracts.count}
                        </td>
                        <td className="border-b p-3 text-right font-mono">$0</td>
                        <td className="border-b p-3 text-right font-mono">0</td>
                        <td className="border-b p-3 text-right font-mono">
                          {totals.primeContracts.amount > 0 
                            ? `${((totals.subcontracts.amount / totals.primeContracts.amount) * 100).toFixed(2)}%`
                            : '0%'}
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
                          <th className="border p-2 text-right">% of Total DBE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(totals.dbeBreakdown).map(([category, data]) => {
                          const categoryTotal = data.women.amount + data.men.amount;
                          const dbePercentage = totals.subcontracts.amount > 0
                            ? ((categoryTotal / totals.subcontracts.amount) * 100).toFixed(2)
                            : '0';
                          
                          return (
                            <tr key={category}>
                              <td className="border p-2">{category}</td>
                              <td className="border p-2 text-right font-mono">
                                {formatCurrency(data.women.amount)}
                              </td>
                              <td className="border p-2 text-right font-mono">
                                {formatCurrency(data.men.amount)}
                              </td>
                              <td className="border p-2 text-right font-mono">
                                {formatCurrency(categoryTotal)}
                              </td>
                              <td className="border p-2 text-right font-mono">{data.women.count}</td>
                              <td className="border p-2 text-right font-mono">{data.men.count}</td>
                              <td className="border p-2 text-right font-mono">
                                {data.women.count + data.men.count}
                              </td>
                              <td className="border p-2 text-right font-mono">{dbePercentage}%</td>
                            </tr>
                          );
                        })}
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
                            {formatCurrency(totals.subcontracts.amount)}
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
                            {totals.subcontracts.count}
                          </td>
                          <td className="border p-2 text-right font-mono">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Payments Made this Period</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border p-2 text-left">Payment Type</th>
                          <th className="border p-2 text-right">Total Number</th>
                          <th className="border p-2 text-right">Total Dollars</th>
                          <th className="border p-2 text-right">DBE Payments ($)</th>
                          <th className="border p-2 text-right">DBE Firms Paid</th>
                          <th className="border p-2 text-right">% to DBE</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2">Prime and subcontracts currently in progress</td>
                          <td className="border p-2 text-right font-mono">
                            {payments.ongoingContracts.count}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {formatCurrency(payments.ongoingContracts.amount)}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {formatCurrency(payments.ongoingContracts.dbeAmount)}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {payments.ongoingContracts.dbeCount}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {payments.ongoingContracts.amount > 0 
                              ? `${((payments.ongoingContracts.dbeAmount / payments.ongoingContracts.amount) * 100).toFixed(2)}%`
                              : '0%'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Total Payments on Completed Contracts</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border p-2 text-left">Category</th>
                          <th className="border p-2 text-right">Number of Contracts</th>
                          <th className="border p-2 text-right">Total Value</th>
                          <th className="border p-2 text-right">DBE Goal Amount</th>
                          <th className="border p-2 text-right">DBE Participation</th>
                          <th className="border p-2 text-right">% to DBE</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2">Race Conscious</td>
                          <td className="border p-2 text-right font-mono">
                            {payments.completedContracts.raceConscious.count}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {formatCurrency(payments.completedContracts.raceConscious.amount)}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {formatCurrency(payments.completedContracts.raceConscious.dbeNeeded)}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {formatCurrency(payments.completedContracts.raceConscious.dbeParticipation)}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {payments.completedContracts.raceConscious.amount > 0 
                              ? `${((payments.completedContracts.raceConscious.dbeParticipation / payments.completedContracts.raceConscious.amount) * 100).toFixed(2)}%`
                              : '0%'}
                          </td>
                        </tr>
                        <tr>
                          <td className="border p-2">Race Neutral</td>
                          <td className="border p-2 text-right font-mono">
                            {payments.completedContracts.raceNeutral.count}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {formatCurrency(payments.completedContracts.raceNeutral.amount)}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {formatCurrency(payments.completedContracts.raceNeutral.dbeNeeded)}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {formatCurrency(payments.completedContracts.raceNeutral.dbeParticipation)}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {payments.completedContracts.raceNeutral.amount > 0 
                              ? `${((payments.completedContracts.raceNeutral.dbeParticipation / payments.completedContracts.raceNeutral.amount) * 100).toFixed(2)}%`
                              : '0%'}
                          </td>
                        </tr>
                        <tr className="bg-gray-50 font-semibold">
                          <td className="border p-2">Total</td>
                          <td className="border p-2 text-right font-mono">
                            {payments.completedContracts.raceConscious.count + 
                             payments.completedContracts.raceNeutral.count}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {formatCurrency(
                              payments.completedContracts.raceConscious.amount + 
                              payments.completedContracts.raceNeutral.amount
                            )}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {formatCurrency(
                              payments.completedContracts.raceConscious.dbeNeeded + 
                              payments.completedContracts.raceNeutral.dbeNeeded
                            )}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {formatCurrency(
                              payments.completedContracts.raceConscious.dbeParticipation + 
                              payments.completedContracts.raceNeutral.dbeParticipation
                            )}
                          </td>
                          <td className="border p-2 text-right font-mono">
                            {(payments.completedContracts.raceConscious.amount + 
                              payments.completedContracts.raceNeutral.amount) > 0 
                              ? `${(((payments.completedContracts.raceConscious.dbeParticipation + 
                                     payments.completedContracts.raceNeutral.dbeParticipation) / 
                                    (payments.completedContracts.raceConscious.amount + 
                                     payments.completedContracts.raceNeutral.amount)) * 100).toFixed(2)}%`
                              : '0%'}
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
});

export default Reports;
