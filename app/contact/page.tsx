import { Mail, MapPin, Phone } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const contactItems = [
  {
    icon: Phone,
    label: "Hotline",
    value: "+880 1622-927718",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@bloodbonding.test",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "House 12, Road 4, Dhaka, Bangladesh",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
            Contact
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Need help coordinating a blood request?
          </h1>
          <p className="mt-4 text-pretty leading-7 text-muted-foreground">
            Use these dummy contact details for the public page now. Later, this
            page can connect to your support workflow, WhatsApp channel, or
            emergency request form.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {contactItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-lg border border-border/70 bg-card p-5 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  {item.label}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
