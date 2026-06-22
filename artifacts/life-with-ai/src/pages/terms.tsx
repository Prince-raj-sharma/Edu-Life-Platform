export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b border-border py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms & Conditions</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {[
          { title: "1. Acceptance of Terms", body: "By accessing and using LIFE WITH AI, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform." },
          { title: "2. User Accounts", body: "You must be at least 13 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account." },
          { title: "3. Course Access", body: "Upon purchase, you receive a non-transferable, non-exclusive license to access and use the course content for personal, non-commercial purposes. You may not share, distribute, or resell course content." },
          { title: "4. Content Usage", body: "All course content, including videos, PDFs, and materials, is protected by copyright. Downloading, recording, or redistribution of video content is strictly prohibited. PDFs may be downloaded for personal use only." },
          { title: "5. Payment & Refunds", body: "All prices are in Indian Rupees (INR) and include applicable taxes. Payments are processed securely by Razorpay. We offer a 7-day refund policy for courses where less than 10% of content has been accessed." },
          { title: "6. Prohibited Activities", body: "You may not: use the platform for illegal activities; attempt to circumvent content protection mechanisms; share your account credentials; harass other users or our staff; or reverse engineer any part of the platform." },
          { title: "7. Modifications", body: "We reserve the right to modify these terms at any time. We will notify registered users of significant changes via email. Continued use of the platform after changes constitutes acceptance of the new terms." },
          { title: "8. Governing Law", body: "These Terms are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka." },
        ].map(({ title, body }) => (
          <section key={title} className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3">{title}</h2>
            <p className="text-muted-foreground leading-relaxed">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
