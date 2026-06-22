import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(3, "Subject required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", subject: "", message: "" } });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setSent(true);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b border-border py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Contact Us</h1>
          <p className="text-muted-foreground">We'd love to hear from you. Send us a message!</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-6">Get in Touch</h2>
            {sent ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="font-semibold text-foreground mb-2">Message Sent!</h3>
                <p className="text-muted-foreground text-sm">We'll get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} className="mt-4 text-primary text-sm hover:underline">Send another message</button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input data-testid="input-name" placeholder="Your name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input data-testid="input-email" type="email" placeholder="you@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl><Input data-testid="input-subject" placeholder="How can we help?" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl><Textarea data-testid="input-message" placeholder="Write your message..." className="min-h-32" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <button data-testid="button-submit" type="submit" className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 font-semibold hover:opacity-90 transition-opacity">
                    Send Message
                  </button>
                </form>
              </Form>
            )}
          </div>
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Contact Information</h2>
            {[
              { icon: Mail, label: "Email", value: "support@lifewithai.in" },
              { icon: Phone, label: "Phone", value: "+91 98765 43210" },
              { icon: MapPin, label: "Address", value: "123 Tech Park, Bengaluru, Karnataka 560001" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
              </div>
            ))}
            <div className="bg-card border border-border rounded-xl p-6 mt-6">
              <h3 className="font-semibold text-foreground mb-2">Support Hours</h3>
              <p className="text-sm text-muted-foreground">Monday – Saturday: 10 AM – 6 PM IST</p>
              <p className="text-sm text-muted-foreground">Response time: within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
