import { Link } from "wouter";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground mb-6">
            Password reset via email is currently unavailable.
            <br />
            Please contact the admin directly to reset your password.
          </p>
          <div className="p-4 bg-muted rounded-xl text-sm text-muted-foreground mb-6">
            Contact support at{" "}
            <span className="font-medium text-foreground">princerajprinceraj609@gmail.com</span>
          </div>
          <Link
            href="/auth/login"
            className="w-full inline-block bg-primary text-primary-foreground rounded-lg py-2.5 font-semibold hover:opacity-90 transition-opacity text-center"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
