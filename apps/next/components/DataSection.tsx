import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Link } from "lucide-react";
import { UserCard } from "./UserCard";
import type { UserDocument } from "@/models/User";
import type { OrganisationDocument } from "@/models/Organisation";

// Type for user with populated organisation
type UserWithPopulatedOrg = Omit<UserDocument, 'organisationId'> & {
  organisationId?: OrganisationDocument;
};

// Type for user with non-populated organisation (just ID)
type UserWithOrgId = Omit<UserDocument, 'organisationId'> & {
  organisationId?: string;
};

interface DataSectionProps {
  title: string;
  description: string;
  users: (UserDocument | UserWithPopulatedOrg | UserWithOrgId)[];
  showPopulated: boolean;
  badgeText: string;
  badgeVariant?: "default" | "outline";
}

export function DataSection({ 
  title, 
  description, 
  users, 
  showPopulated, 
  badgeText, 
  badgeVariant = "outline" 
}: DataSectionProps) {
  const Icon = showPopulated ? Link : Database;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant={badgeVariant}>{badgeText}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {users.map((user) => (
          <UserCard 
            key={user._id.toString()} 
            user={user} 
            showPopulated={showPopulated}
          />
        ))}
      </CardContent>
    </Card>
  );
}
