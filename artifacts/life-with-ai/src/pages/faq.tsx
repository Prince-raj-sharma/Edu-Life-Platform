import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "How do I access my purchased courses?", a: "After completing payment, your course will appear in your Dashboard under 'My Courses'. Click on it to start learning immediately." },
  { q: "Can I download course videos?", a: "No, videos are only available via secure streaming to protect intellectual property. You can watch them unlimited times online." },
  { q: "Is there a refund policy?", a: "We offer a 7-day refund policy if you've watched less than 10% of the course content. Contact support@lifewithai.in to request a refund." },
  { q: "What payment methods are accepted?", a: "We accept all UPI apps, credit/debit cards, and net banking through our Razorpay payment gateway." },
  { q: "How long do I have access to a course?", a: "Once purchased, you have lifetime access to the course content including any future updates." },
  { q: "Will I get a certificate after completing a course?", a: "Yes! You'll receive a digital certificate of completion that you can share on LinkedIn and other platforms." },
  { q: "Are the PDFs downloadable?", a: "Yes, purchased PDFs can be downloaded directly from your dashboard for offline use." },
  { q: "How do I reset my password?", a: "Click 'Forgot Password' on the login page and enter your email. You'll receive a reset link within a few minutes." },
  { q: "Can I access the platform on mobile?", a: "Yes! Our platform is fully responsive and works on all devices — mobile, tablet, and desktop." },
  { q: "How do I contact support?", a: "You can reach us via the Contact page, or email us directly at support@lifewithai.in. We typically respond within 24 hours." },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b border-border py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Everything you need to know about LIFE WITH AI</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border rounded-xl px-5">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-12 bg-primary/5 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-bold text-foreground mb-2">Still have questions?</h2>
          <p className="text-muted-foreground text-sm mb-4">Our support team is happy to help.</p>
          <a href="/contact" className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
