import { Card, CardContent } from "@/components/ui/card";

interface StatsSectionProps {
  rawUsersCount: number;
  populatedUsersCount: number;
}

export function StatsSection({ rawUsersCount, populatedUsersCount }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">{rawUsersCount}</div>
          <div className="text-sm text-muted-foreground">Raw Users</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">{populatedUsersCount}</div>
          <div className="text-sm text-muted-foreground">Populated Users</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">100%</div>
          <div className="text-sm text-muted-foreground">Type Safe</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">0ms</div>
          <div className="text-sm text-muted-foreground">Config Time</div>
        </CardContent>
      </Card>
    </div>
  );
}
