// components/layout/Footer.tsx
"use client";
import Link from "next/link";
import { useState } from "react";

// Données externalisées pour une meilleure maintenabilité
const FOOTER_LINKS = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "FAQs", href: "/faqs" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Support Center", href: "/support" },
  ],
  quickLinks: [
    { label: "Home", href: "/" },
    { label: "Solutions", href: "/solutions" },
    { label: "About Us", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Sustainability", href: "/sustainability" },
  ],
  social: [
    { label: "LinkedIn", href: "#", icon: "in" },
    { label: "Facebook", href: "#", icon: "fb" },
    { label: "Instagram", href: "#", icon: "ig" },
    { label: "Twitter", href: "#", icon: "tw" },
    { label: "YouTube", href: "#", icon: "yt" },
  ],
};

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Logique d'inscription
      console.log("Subscribed:", email);
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Solaria</h3>
            <p className="text-sm leading-relaxed">
              Commitment to a better and greener future.
            </p>
            <div className="mt-4 flex space-x-3">
              {FOOTER_LINKS.social.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-green-600 hover:text-white transition-colors duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {FOOTER_LINKS.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
            <p className="text-sm mb-4">
              Subscribe to our newsletter for the latest updates.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 text-white px-3 py-2 rounded-l-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  required
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-r-md text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                >
                  Subscribe
                </button>
              </div>
              {isSubscribed && (
                <p className="text-green-400 text-xs animate-fade-in">
                  ✓ Thanks for subscribing!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center text-sm">
          <p>
            © {new Date().getFullYear()} Solaria Solar Power. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
