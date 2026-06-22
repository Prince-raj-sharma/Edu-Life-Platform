import { Link } from "wouter";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">Your purchase is confirmed. You now have access to your content.</p>
        <div className="space-y-3">
          <Link href="/dashboard">
            <button data-testid="button-go-dashboard" className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 font-semibold hover:opacity-90 transition-opacity">
              Go to Dashboard
            </button>
          </Link>
          <Link href="/courses">
            <button className="w-full border border-border text-foreground rounded-lg py-2.5 text-sm hover:bg-muted transition-colors">
              Browse More Courses
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
