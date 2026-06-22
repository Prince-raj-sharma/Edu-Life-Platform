import { useState } from "react";
import { useLocation } from "wouter";
import { useVerifyOtp, useResendOtp } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function VerifyOtpPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email") || "";
  const verifyMutation = useVerifyOtp();
  const resendMutation = useResendOtp();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast({ title: "Enter 6-digit OTP", variant: "destructive" }); return; }
    try {
      const res = await verifyMutation.mutateAsync({ data: { email, otp } });
      login(res.token, res.user);
      toast({ title: "Email verified!", description: "Your account is now active." });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Invalid OTP", description: err?.data?.error || "Please try again", variant: "destructive" });
    }
  };

  const handleResend = async () => {
    try {
      await resendMutation.mutateAsync({ data: { email } });
      toast({ title: "OTP sent", description: "Check your email for the new code" });
    } catch {
      toast({ title: "Failed to resend OTP", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✉️</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Verify your email</h1>
          <p className="text-muted-foreground mb-8">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              data-testid="input-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full text-center text-3xl font-bold tracking-[1rem] border border-border rounded-lg py-4 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button data-testid="button-verify" type="submit" disabled={verifyMutation.isPending} className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {verifyMutation.isPending ? "Verifying..." : "Verify Email"}
            </button>
          </form>
          <button onClick={handleResend} disabled={resendMutation.isPending} className="mt-4 text-sm text-primary hover:underline disabled:opacity-50">
            {resendMutation.isPending ? "Sending..." : "Resend code"}
          </button>
        </div>
      </div>
    </div>
  );
}
