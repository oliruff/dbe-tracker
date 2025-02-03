import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";

const Reports = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-tdot-gray">Reports</h1>
            <p className="text-gray-600">
              View and generate DBE participation reports
            </p>
          </div>
          <Card className="p-6 animate-fadeIn">
            <p className="text-center text-gray-600">
              Report functionality coming soon
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;