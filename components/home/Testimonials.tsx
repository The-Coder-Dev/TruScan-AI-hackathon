import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Chief Security Officer",
    company: "FinanceCore",
    initials: "SC",
    color: "bg-primary/20 text-primary",
    quote:
      "TruScan AI detected a deepfake CEO call attempt that would have authorized a $2.4M wire transfer. The real-time alert stopped it cold. I don't know how we operated without this.",
    stars: 5,
  },
  {
    name: "Marcus Reid",
    role: "Head of IT Security",
    company: "MedGroup",
    initials: "MR",
    color: "bg-emerald-100 text-emerald-700",
    quote:
      "We integrated TruScan's API in under an hour. Within the first week it flagged over 300 SMS phishing attempts targeting our staff. The accuracy is extraordinary.",
    stars: 5,
  },
  {
    name: "Priya Sharma",
    role: "VP of Engineering",
    company: "Nexus Payments",
    initials: "PS",
    color: "bg-violet-100 text-violet-700",
    quote:
      "The voice fingerprinting feature is a game-changer. We've enrolled our entire executive team and now get instant alerts if anyone impersonates them on a call. Premium product.",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl font-bold text-foreground tracking-tight">
            Trusted by security teams worldwide
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            See what security leaders say about protecting their organizations with TruScan AI.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-3xl border border-border/60 p-7 flex flex-col gap-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group hover:-translate-y-1"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-sm text-muted-foreground leading-relaxed flex-1">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={`text-sm font-bold ${t.color}`}>
                    {t.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
