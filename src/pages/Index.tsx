import { Header } from "@/components/Header";
import { ContractForm } from "@/components/ContractForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-tdot-gray">
              DBE Tracking and Reporting
            </h1>
            <p className="text-gray-600">
              TDOT Aeronautics
            </p>
          </div>
          <ContractForm />
        </div>
      </main>
    </div>
  );
};

export default Index;