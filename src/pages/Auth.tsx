import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Password validation function
  const validatePassword = (password: string) => {
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 6;

    if (!isLongEnough) {
      return "Password must be at least 6 characters long";
    }
    if (!hasLowerCase) {
      return "Password must include at least one lowercase letter";
    }
    if (!hasUpperCase) {
      return "Password must include at least one uppercase letter";
    }
    if (!hasDigit) {
      return "Password must include at least one number";
    }
    if (!hasSymbol) {
      return "Password must include at least one symbol";
    }
    return null;
  };

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted"); // Debug log
    setIsLoading(true);

    try {
      // Validate email
      if (!validateEmail(email)) {
        toast.error("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      // Validate password for sign up
      if (isSignUp) {
        const passwordError = validatePassword(password);
        if (passwordError) {
          toast.error(passwordError);
          setIsLoading(false);
          return;
        }
      }

      // Attempt authentication
      const { error } = isSignUp
        ? await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`
            }
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.includes("Invalid login credentials") || 
            error.message.includes("User not found")) {
          if (!isSignUp) {
            toast.error("No account found with this email. Would you like to create one?");
            setIsSignUp(true); // Switch to sign up mode
          } else {
            toast.error(error.message);
          }
        } else {
          toast.error(error.message);
        }
        throw error;
      }

      if (isSignUp) {
        toast.success("Check your email to confirm your account");
      } else {
        toast.success("Successfully signed in");
        navigate(location.state?.from || "/");
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAndClearSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        toast.error(error.message);
      }
      if (session) {
        navigate("/");
      }
    };
    checkAndClearSession();
  }, [navigate]);

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
};

export default Auth;
