import { cn } from "@/lib/utils";
import {
  ArrowRight,
  FileSearch,
  Globe,
  Hourglass,
  PiggyBank,
  Scale,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const features = [
  {
    title: "AI-powered Analysis",
    description:
      "Leverage advanced AI to analyze contracts quickly and accurately.",
    icon: FileSearch,
  },
  {
    title: "Risk Identification",
    description: "Spot potential risks and opportunities in your contracts.",
    icon: ShieldCheck,
  },
  {
    title: "Streamlined Negotiation",
    description: "Accelerate the negotiation process with AI-driven insights.",
    icon: Hourglass,
  },
  {
    title: "Cost Reduction",
    description: "Significantly reduce legal costs through automation.",
    icon: PiggyBank,
  },
  {
    title: "Improved Compliance",
    description: "Ensure your contracts meet all regulatory requirements.",
    icon: Scale,
  },
  {
    title: "Faster Turnaround",
    description: "Complete contract reviews in minutes instead of hours.",
    icon: Zap,
  },
];

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 md:px-6 flex flex-col items-center max-w-6xl mx-auto">
        
        <div className="text-center mb-12 w-full">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
            Transform Your Contracts with AI 
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Smarter, Faster, and More Efficient!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-12">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
