import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 fixed top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/tad-logo.png" 
            alt="TDOT Logo" 
            className="h-10 w-auto"
          />
          <h1 className="text-xl font-semibold text-tdot-gray hidden sm:block">
            DBE Contract Reporting
          </h1>
        </div>
        <nav className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-tdot-gray hover:text-tdot-red transition-colors"
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/reports")}
            className="text-tdot-gray hover:text-tdot-red transition-colors"
          >
            Reports
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-tdot-gray hover:text-tdot-red transition-colors"
          >
            Logout
          </Button>
        </nav>
      </div>
    </header>
  );
};