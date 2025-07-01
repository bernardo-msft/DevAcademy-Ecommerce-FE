import Link from "next/link";
import { Mountain } from "lucide-react";

// You can create a simple component for social media icons or use a library
const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.9 3 7.1 0 .8-.4 1.5-.9 2.1-.7.8-1.8 1.3-3.1 1.4-2.4.1-4.8-.9-6.6-2.4-1.8-1.5-2.8-3.5-3.1-5.5-.2-1.4-.1-2.8.3-4.1.4-1.3 1.1-2.5 2.1-3.5.9-.9 2.1-1.6 3.4-2 .9-.3 1.8-.4 2.7-.3 1.1.1 2.2.5 3.1 1.1.9.6 1.7 1.4 2.4 2.3.7.9 1.2 1.9 1.6 2.9z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);


export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
              <Mountain className="h-6 w-6" />
              <span>MyStore</span>
            </Link>
            <p className="text-sm">
              Cutting-edge gadgets and accessories to elevate your lifestyle.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <Link href="/products" className="hover:underline">Products</Link>
            <Link href="/about" className="hover:underline">About Us</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
          <div className="grid gap-2 text-sm">
            <h3 className="font-semibold text-foreground">Support</h3>
            <Link href="/faq" className="hover:underline">FAQ</Link>
            <Link href="/shipping" className="hover:underline">Shipping & Returns</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          </div>
          <div className="grid gap-2 text-sm">
            <h3 className="font-semibold text-foreground">Follow Us</h3>
            <div className="flex gap-4">
              <Link href="#" aria-label="Twitter">
                <TwitterIcon className="h-5 w-5 hover:text-foreground" />
              </Link>
              <Link href="#" aria-label="Facebook">
                <FacebookIcon className="h-5 w-5 hover:text-foreground" />
              </Link>
              <Link href="#" aria-label="Instagram">
                <InstagramIcon className="h-5 w-5 hover:text-foreground" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Ecommerce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}