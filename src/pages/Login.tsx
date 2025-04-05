
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  fullName: z.string().min(2, { message: "Full name is required" }),
  pharmacyName: z.string().optional(),
});

export default function Login() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get("tab");
  
  const [activeTab, setActiveTab] = useState<"login" | "register">(
    tabFromUrl === "register" ? "register" : "login"
  );
  
  const { signIn, signUp, isAuthenticated, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      pharmacyName: "",
    },
  });

  async function handleLogin(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);
    try {
      await signIn(values.email, values.password);
      // No need to navigate here - the effect will handle it
      toast({
        title: "Signed in successfully",
        description: "Redirecting to dashboard...",
      });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(values: z.infer<typeof registerSchema>) {
    setIsSubmitting(true);
    try {
      await signUp(values.email, values.password, values.fullName, values.pharmacyName);
      // Stay on login tab after registration for email confirmation
      setActiveTab("login");
      registerForm.reset();
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading state if checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-800 mb-4" />
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, don't render the login form
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">You're already signed in!</p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="absolute top-4 left-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/")} 
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
      <Card className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="mail@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 border-t px-6 pt-4">
              <div className="text-sm text-muted-foreground">
                Don't have an account? <Link to="/login" onClick={() => setActiveTab("register")} className="text-red-900 hover:underline">Register</Link>
              </div>
            </CardFooter>
          </TabsContent>

          <TabsContent value="register">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>
                Register to access your pharmacy dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="mail@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="pharmacyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pharmacy Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Community Pharmacy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 border-t px-6 pt-4">
              <div className="text-sm text-muted-foreground">
                Already have an account? <Link to="/login" onClick={() => setActiveTab("login")} className="text-red-900 hover:underline">Login</Link>
              </div>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
