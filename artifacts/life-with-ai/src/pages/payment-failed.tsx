import { Link } from "wouter";
import { XCircle } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h1>
        <p className="text-muted-foreground mb-8">Something went wrong with your payment. No amount was deducted.</p>
        <div className="space-y-3">
          <button data-testid="button-go-back" onClick={() => window.history.back()} className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 font-semibold hover:opacity-90 transition-opacity">
            Try Again
          </button>
          <Link href="/courses">
            <button className="w-full border border-border text-foreground rounded-lg py-2.5 text-sm hover:bg-muted transition-colors">
              Browse Courses
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
