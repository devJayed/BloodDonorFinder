import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Find Donors", href: "/find-donors" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/bloodbonding",
    icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/bloodbonding",
    icon: Instagram,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/bloodbonding",
    icon: Linkedin,
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-background">
              <Image
                src="/blood-logo-noText.png"
                alt="Blood Bonding logo"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="text-lg font-semibold text-foreground">
              Blood Bonding
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Connecting blood donors with people in need through a simple,
            reliable, and community-focused donor discovery experience.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socialLinks.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Quick Links
          </h2>
          <nav className="mt-4 grid gap-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Contact
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>+880 1622-927718</span>
            </p>
            <p className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>support@bloodbonding.test</span>
            </p>
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>House 12, Road 4, Dhaka, Bangladesh</span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 py-4">
        <div className="container mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Blood Bonding. All rights reserved.</p>
          <p>For emergency care, contact your nearest hospital immediately.</p>
        </div>
      </div>
    </footer>
  );
}
