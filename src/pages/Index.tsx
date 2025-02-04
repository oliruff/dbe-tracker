import { useState } from "react";
import { Header } from "@/components/Header";
import { ContractForm } from "@/components/ContractForm";
import { ContractDashboard } from "@/components/ContractDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-tdot-gray">
              DBE Tracking and Reporting
            </h1>
            <p className="text-gray-600">
              TDOT Aeronautics
            </p>
          </div>
          
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="new-contract">New Contract</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6">
              <ContractDashboard />
            </TabsContent>
            
            <TabsContent value="new-contract" className="space-y-6">
              <ContractForm />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;