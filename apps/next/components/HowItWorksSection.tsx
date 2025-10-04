import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Zap, Database, Link, Settings } from "lucide-react";

export function HowItWorksSection() {
  return (
    <Card className="bg-muted/50">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl flex items-center justify-center gap-2">
          <Zap className="w-8 h-8" />
          How It Works
        </CardTitle>
        <CardDescription className="text-lg">
          Understanding the magic behind type-safe population
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Database className="w-6 h-6 text-primary" />}
            title="Without Populate"
            description="Returns raw MongoDB ObjectIds as strings. Fast queries, minimal data transfer."
            badge="string"
          />
          
          <FeatureCard
            icon={<Link className="w-6 h-6 text-primary" />}
            title="With Populate"
            description="Automatically resolves references to full document objects with complete data."
            badge="Document"
          />
          
          <FeatureCard
            icon={<Shield className="w-6 h-6 text-primary" />}
            title="Type Safety"
            description="TypeScript automatically infers correct types based on populate usage."
            badge="Generic<T>"
          />
          
          <FeatureCard
            icon={<Settings className="w-6 h-6 text-primary" />}
            title="Zero Config"
            description="No .exec() calls needed. Direct await support with seamless integration."
            badge="await"
          />
        </div>
        
        <Separator className="my-8" />
        
        <div className="text-center">
          <Card className="inline-block p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold">Ready to get started?</h4>
                <p className="text-sm text-muted-foreground">Experience the power of Monkko ORM in your next project</p>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
}

function FeatureCard({ icon, title, description, badge }: FeatureCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h4 className="font-semibold">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>
      <Badge variant="outline" className="font-mono">{badge}</Badge>
    </Card>
  );
}
