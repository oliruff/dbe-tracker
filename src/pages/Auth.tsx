import { useState, useEffect, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkAndClearSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      if (session) {
        navigate("/");
      }
    };
    checkAndClearSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation for sign-up
    if (isSignUp) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation
        if (!emailRegex.test(email)) {
            toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRequirements.test(password)) {
            toast({ title: "Weak Password", description: "Password must be at least 6 characters long and include uppercase, lowercase, digits, and symbols.", variant: "destructive" });
            setIsLoading(false);
            return;
        }
    }

    try {
        const { error } = isSignUp
            ? await supabase.auth.signUp({ email, password })
            : await supabase.auth.signIn({ email, password });

        if (error) {
            if (error.message.includes("User not found")) {
                toast({ title: "No Account", description: "No account found with this email. Please sign up.", variant: "destructive" });
            } else {
                toast({ title: "Authentication Error", description: error.message, variant: "destructive" });
            }
            throw error;
        }
        navigate(location.state?.from || "/");
    } catch (error) {
        toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            src="/lovable-uploads/tad-logo.png"
            alt="TDOT Logo"
            className="mx-auto h-16 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-tdot-red hover:bg-tdot-red/90"
              disabled={isLoading}
            >
              {isLoading
                ? "Loading..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-tdot-red hover:text-tdot-red/90"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Need an account? Sign up"}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default Auth;
