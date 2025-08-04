import { useState } from "react";
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Login() {
  const [loginType, setLoginType] = useState<"login_id" | "phone">("login_id");
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credential || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await login({ credential, password, loginType });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-gray-50">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
          <GraduationCap className="text-white text-2xl h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Student Portal</h1>
        <p className="text-gray-600">Access your academic information</p>
      </div>

      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Login Method
              </Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={loginType === "login_id" ? "default" : "secondary"}
                  className="flex-1"
                  onClick={() => setLoginType("login_id")}
                >
                  Login ID
                </Button>
                <Button
                  type="button"
                  variant={loginType === "phone" ? "default" : "secondary"}
                  className="flex-1"
                  onClick={() => setLoginType("phone")}
                >
                  Phone
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="credential">
                {loginType === "login_id" ? "Login ID" : "Phone Number"}
              </Label>
              <Input
                id="credential"
                type={loginType === "phone" ? "tel" : "text"}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder={
                  loginType === "login_id" 
                    ? "Enter your Login ID" 
                    : "Enter your Phone Number"
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center mt-4">
              <Button variant="link" className="text-sm">
                Forgot Password?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
