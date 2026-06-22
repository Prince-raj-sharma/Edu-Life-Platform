import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useResetPassword } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const mutation = useResetPassword();
  const [done, setDone] = useState(false);
  const token = new URLSearchParams(window.location.search).get("token") || "";

  const form = useForm({ resolver: zodResolver(schema), defaultValues: { password: "", confirm: "" } });

  const onSubmit = async (data: { password: string }) => {
    if (!token) { toast({ title: "Invalid reset link", variant: "destructive" }); return; }
    try {
      await mutation.mutateAsync({ data: { token, password: data.password } });
      setDone(true);
      toast({ title: "Password reset!", description: "You can now log in with your new password." });
    } catch (err: any) {
      toast({ title: "Reset failed", description: err?.data?.error || "Link expired or invalid", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
            <p className="text-muted-foreground mt-1">Enter your new password below</p>
          </div>
          {done ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <p className="font-medium">Password updated!</p>
              <button onClick={() => setLocation("/auth/login")} className="mt-4 bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-semibold">Go to Login</button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl><Input data-testid="input-password" type="password" placeholder="Min. 6 characters" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="confirm" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl><Input data-testid="input-confirm" type="password" placeholder="Repeat password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <button type="submit" disabled={mutation.isPending} className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                  {mutation.isPending ? "Resetting..." : "Reset Password"}
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
