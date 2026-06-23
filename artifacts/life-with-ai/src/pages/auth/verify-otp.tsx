import { useEffect } from "react";
import { useLocation } from "wouter";

// OTP verification is no longer required. Redirect to dashboard or login.
export default function VerifyOtpPage() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/dashboard");
  }, []);
  return null;
}
