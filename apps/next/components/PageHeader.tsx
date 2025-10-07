import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export function PageHeader() {
  return (
    <div className="text-center space-y-6 mb-16">
      <Badge variant="secondary" className="text-sm">
        <Shield className="w-3 h-3 mr-1" />
        Type-Safe ODM
      </Badge>
      
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">
          Monkko ODM
        </h1>
        <h2 className="text-2xl font-semibold text-muted-foreground">
          Populate API Demo
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience type-safe population with automatic return type inference. 
          See how our ODM transforms your data relationships seamlessly.
        </p>
      </div>
    </div>
  );
}
