
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Mail } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({ 
    username: "", 
    email: "", 
    password: "",
    password2: ""
  });

  // Redirect if already authenticated
  if (user) {
    navigate("/admin/dashboard");
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(credentials.username, credentials.password);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      navigate("/admin/dashboard");
    }

    setIsLoading(false);
  };

  // const handleSignUp = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   if (credentials.password !== credentials.password2) {
  //     toast({
  //       title: "Passwords don't match",
  //       description: "Please make sure both passwords are identical.",
  //       variant: "destructive",
  //     });
  //     setIsLoading(false);
  //     return;
  //   }

  //   const { error } = await signUp(credentials.username, credentials.email, credentials.password, credentials.password2);

  //   if (error) {
  //     toast({
  //       title: "Sign up failed",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   } else {
  //     toast({
  //       title: "Account created!",
  //       description: "Please check your email to verify your account.",
  //     });
  //   }

  //   setIsLoading(false);
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Authentication</CardTitle>
          <CardDescription>
            Sign in to your account 
            {/* or create a new one */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              {/* <TabsTrigger value="signup">Sign Up</TabsTrigger> */}
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-username">Username</Label>
                  <Input
                    id="signin-username"
                    type="text"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Mail className="w-4 h-4 mr-2" />
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            {/* <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    minLength={6}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password2">Confirm Password</Label>
                  <Input
                    id="signup-password2"
                    type="password"
                    placeholder="Confirm your password"
                    value={credentials.password2}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password2: e.target.value }))}
                    minLength={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Mail className="w-4 h-4 mr-2" />
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent> */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
