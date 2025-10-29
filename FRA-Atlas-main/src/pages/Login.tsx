import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Phone, Key, Shield, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Validation schemas
const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[+]?[0-9]{10,15}$/, "Please enter a valid phone number"),
  rememberMe: z.boolean().default(false),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^[0-9]+$/, "OTP must contain only numbers"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user?.isAuthenticated) {
      navigate("/atlas");
    }
  }, [user, navigate]);

  // Phone form
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
      rememberMe: false,
    },
  });

  // OTP form
  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Timer for resend OTP
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handlePhoneSubmit = async (data: PhoneFormData) => {
    if (attempts >= maxAttempts) {
      toast.error("Too many attempts. Please try again later.");
      return;
    }

    setLoading(true);
    try {
      // Mock OTP request
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setPhoneNumber(data.phone);
      setStep("otp");
      setResendTimer(30); // 30 second cooldown for resend
      toast.success("OTP sent successfully!");
      
      // Store in localStorage if remember me is checked
      if (data.rememberMe) {
        localStorage.setItem("rememberedPhone", data.phone);
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
      setAttempts(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (data: OtpFormData) => {
    if (attempts >= maxAttempts) {
      toast.error("Too many attempts. Account temporarily locked.");
      return;
    }

    setLoading(true);
    try {
      // Mock OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      if (data.otp === "123456") {
        toast.success("Login successful! Redirecting...");
        
        // Use auth context login method
        login(phoneNumber);
        
        // Redirect to appropriate dashboard
        setTimeout(() => {
          navigate("/atlas");
        }, 1000);
      } else {
        toast.error("Invalid OTP. Demo OTP is: 123456");
        setAttempts(prev => prev + 1);
        
        if (attempts + 1 >= maxAttempts) {
          toast.error("Account temporarily locked due to multiple failed attempts.");
        }
      }
    } catch (error) {
      toast.error("Verification failed. Please try again.");
      setAttempts(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResendTimer(30);
      toast.success("OTP resent successfully!");
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const goBackToPhone = () => {
    setStep("phone");
    setAttempts(0);
    otpForm.reset();
  };

  // Load remembered phone number on mount
  React.useEffect(() => {
    const rememberedPhone = localStorage.getItem("rememberedPhone");
    if (rememberedPhone) {
      phoneForm.setValue("phone", rememberedPhone);
      phoneForm.setValue("rememberMe", true);
    }
  }, [phoneForm]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-forest" />
            </div>
            <h1 className="text-2xl font-bold">FRA Atlas Login</h1>
            <p className="text-muted-foreground">Secure access for patta holders and officials</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {step === "phone" ? (
                  <>
                    <Phone className="w-5 h-5" />
                    Enter Phone Number
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Verify OTP
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === "phone" ? (
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
                    <FormField
                      control={phoneForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+91 98765 43210" {...field} />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter your registered mobile number
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between">
                      <FormField
                        control={phoneForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <div className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <label className="cursor-pointer">Remember this device</label>
                          </div>
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => toast.info("Contact support at support@example.com")}
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" /> Need help?
                      </button>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(handleOTPSubmit)} className="space-y-4">
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enter OTP</FormLabel>
                          <FormControl>
                            <Input type="text" maxLength={6} placeholder="123456" inputMode="numeric" {...field} />
                          </FormControl>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">
                              OTP sent to {phoneNumber || "your phone"}
                            </p>
                            <Badge variant="secondary" className="bg-success/10 text-success inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Demo: 123456
                            </Badge>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        onClick={goBackToPhone}
                        className="text-muted-foreground hover:underline"
                      >
                        Change Number
                      </button>
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendTimer > 0 || loading}
                        className="text-primary hover:underline disabled:opacity-50"
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                      </button>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Verifying..." : "Login"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Demo Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Demo Access:</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Use any phone number and OTP: <strong>123456</strong>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;