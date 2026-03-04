import {
  FolderOpen,
  Shield,
  Building2,
  Layers,
  Search,
  Share2,
} from "lucide-react";

const features = [
  {
    icon: FolderOpen,
    title: "Asset Management",
    description:
      "Organize your entire portfolio with intelligent tagging, version control, and lightning-fast search across all media types.",
  },
  {
    icon: Shield,
    title: "Copyright Protection",
    description:
      "Invisible watermarking, blockchain-backed provenance tracking, and automated DMCA takedown workflows to protect your work.",
  },
  {
    icon: Building2,
    title: "Institutional Partnership",
    description:
      "Centralized dashboards for galleries, universities, and museums with bulk account management and advanced analytics.",
  },
  {
    icon: Layers,
    title: "Version History",
    description:
      "Track every revision with automatic versioning. Compare iterations side-by-side and restore any previous state instantly.",
  },
  {
    icon: Search,
    title: "AI-Powered Discovery",
    description:
      "Surface buried assets with visual similarity search, automatic metadata extraction, and smart collection suggestions.",
  },
  {
    icon: Share2,
    title: "Secure Sharing",
    description:
      "Generate time-limited, password-protected links. Control exactly who sees what with granular permission settings.",
  },
];

export function Features() {
  return (
    <section id="product" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            Features
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Everything you need to manage creative assets
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            A complete toolkit designed around the workflows of artists and
            institutions, not enterprise software conventions.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-secondary"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary/10">
                <feature.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 text-base font-medium text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
