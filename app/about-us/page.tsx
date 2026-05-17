import Image from "next/image";
import { Clock, ShieldCheck, Users } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Trusted donor information",
    description:
      "Clear donor profiles help visitors quickly review blood group, area, and contact details.",
  },
  {
    icon: Clock,
    title: "Built for urgent moments",
    description:
      "The experience keeps search and decision-making simple when time matters most.",
  },
  {
    icon: Users,
    title: "Community first",
    description:
      "Blood Bonding supports local volunteers, families, and organizers with a shared donor directory.",
  },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-10">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
              About Us
            </p>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              A practical bridge between blood donors and people who need help.
            </h1>
            <p className="mt-4 text-pretty leading-7 text-muted-foreground">
              Blood Bonding is a donor discovery platform designed to make blood
              donor information easier to find, scan, and act on. This page uses
              dummy content for now, but the structure is ready for real
              organization details, campaign stories, and verified service
              information.
            </p>

            <div className="mt-8 grid gap-4">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
            <Image
              src="/mahbub_sir.png"
              alt="Blood donation community volunteers"
              width={720}
              height={560}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
