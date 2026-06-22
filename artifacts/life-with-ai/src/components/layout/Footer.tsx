import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold tracking-tight text-primary">LIFE WITH AI</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Professional EdTech platform delivering high-quality AI and tech skills training to accelerate your career.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/courses" className="hover:text-primary transition-colors">Browse Courses</Link></li>
              <li><Link href="/pdfs" className="hover:text-primary transition-colors">PDF Library</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LIFE WITH AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
