import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data states
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    restaurantName: "",
    phone: "",
  });

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const { error } = await signIn({
        email: loginData.email,
        password: loginData.password,
        rememberMe: loginData.rememberMe,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (signupData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp({
        email: signupData.email,
        password: signupData.password,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        restaurantName: signupData.restaurantName,
        phone: signupData.phone,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(
          "Account created successfully! Please check your email to verify your account.",
        );
        // Reset form
        setSignupData({
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          restaurantName: "",
          phone: "",
        });
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBackToHome}
          className="mb-6 text-gray-600 hover:text-gray-900 p-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <QrCode className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              yummo.ai
            </span>
          </div>
          <p className="text-gray-600">
            Welcome to the future of restaurant management
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Get Started
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Error/Success Messages */}
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="font-medium">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="font-medium">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-email"
                      className="text-sm font-medium"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="h-11"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-password"
                      className="text-sm font-medium"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        className="h-11 pr-10"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
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
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={loginData.rememberMe}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            rememberMe: e.target.checked,
                          })
                        }
                      />
                      <span className="text-gray-600">Remember me</span>
                    </label>
                    <a
                      href="#"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || loading}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    {isLoading || loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="first-name"
                        className="text-sm font-medium"
                      >
                        First Name
                      </Label>
                      <Input
                        id="first-name"
                        type="text"
                        placeholder="John"
                        required
                        className="h-11"
                        value={signupData.firstName}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="last-name"
                        className="text-sm font-medium"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="last-name"
                        type="text"
                        placeholder="Doe"
                        required
                        className="h-11"
                        value={signupData.lastName}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="restaurant-name"
                      className="text-sm font-medium"
                    >
                      Restaurant Name (Optional)
                    </Label>
                    <Input
                      id="restaurant-name"
                      type="text"
                      placeholder="Your Restaurant Name"
                      className="h-11"
                      value={signupData.restaurantName}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          restaurantName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number (Optional)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="h-11"
                      value={signupData.phone}
                      onChange={(e) =>
                        setSignupData({ ...signupData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-email"
                      className="text-sm font-medium"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="h-11"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="signup-password"
                      className="text-sm font-medium"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min. 8 characters)"
                        required
                        minLength={8}
                        className="h-11 pr-10"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            password: e.target.value,
                          })
                        }
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
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-sm font-medium"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        required
                        className="h-11 pr-10"
                        value={signupData.confirmPassword}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" className="rounded mt-1" required />
                    <span className="text-sm text-gray-600">
                      I agree to the{" "}
                      <a href="#" className="text-blue-600 hover:text-blue-700">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-blue-600 hover:text-blue-700">
                        Privacy Policy
                      </a>
                    </span>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || loading}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    {isLoading || loading
                      ? "Creating Account..."
                      : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-11 border-gray-300 hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-gray-300 hover:bg-gray-50"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Need help?{" "}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
