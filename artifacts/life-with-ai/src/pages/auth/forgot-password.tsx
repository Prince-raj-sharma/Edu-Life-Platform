import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useForgotPassword } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const schema = z.object({ email: z.string().email("Invalid email") });

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const mutation = useForgotPassword();
  const [sent, setSent] = useState(false);

  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = async (data: { email: string }) => {
    try {
      await mutation.mutateAsync({ data });
      setSent(true);
      toast({ title: "Reset link sent", description: "Check your email for the reset link" });
    } catch {
      toast({ title: "Failed to send reset email", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
            <p className="text-muted-foreground mt-1">Enter your email to receive a reset link</p>
          </div>
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📬</div>
              <p className="text-foreground font-medium">Check your inbox!</p>
              <p className="text-muted-foreground text-sm mt-2">We've sent a reset link to your email.</p>
              <Link href="/auth/login" className="mt-6 block text-primary hover:underline text-sm">Back to login</Link>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input data-testid="input-email" type="email" placeholder="you@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <button type="submit" disabled={mutation.isPending} className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                  {mutation.isPending ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </Form>
          )}
          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link href="/auth/login" className="text-primary hover:underline">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
