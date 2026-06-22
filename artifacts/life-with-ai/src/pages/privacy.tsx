export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b border-border py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-gray dark:prose-invert max-w-none">
        {[
          { title: "1. Information We Collect", body: "We collect information you provide directly to us when creating an account, making purchases, or contacting us. This includes your name, email address, and payment information (processed securely by Razorpay — we do not store card details)." },
          { title: "2. How We Use Your Information", body: "We use the information we collect to provide, maintain, and improve our services; process transactions; send transactional emails including OTP verification and receipts; and respond to your comments and questions." },
          { title: "3. Information Sharing", body: "We do not sell, rent, or share your personal information with third parties for marketing purposes. We may share information with service providers who assist us in operating our platform, including payment processors and cloud infrastructure providers." },
          { title: "4. Data Security", body: "We implement industry-standard security measures to protect your information, including SSL encryption for all data transmission, secure password hashing, and JWT-based authentication." },
          { title: "5. Cookies", body: "We use essential cookies to maintain your login session. We do not use tracking or advertising cookies. You can disable cookies in your browser settings, but this may affect site functionality." },
          { title: "6. Your Rights", body: "You have the right to access, update, or delete your personal information at any time by contacting us at support@lifewithai.in. You may also request a copy of all data we hold about you." },
          { title: "7. Contact Us", body: "If you have any questions about this Privacy Policy, please contact us at support@lifewithai.in or write to us at 123 Tech Park, Bengaluru, Karnataka 560001." },
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
