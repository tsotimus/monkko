import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Link } from "lucide-react";
import { UserCard } from "./UserCard";
import type { UserDocument, UserDocumentPopulated } from "@/models/User";
import { JSONSerialized } from "@monko/orm";
// import type { OrganisationDocument } from "@/models/Organisation";

type DataSectionProps =
  | {
      showPopulated: true;
      users: JSONSerialized<UserDocumentPopulated>[];
    }
  | {
      showPopulated: false;
      users: JSONSerialized<UserDocument>[];
    };

interface DataSectionSharedProps {
  title: string;
  description: string;
  badgeText: string;
  badgeVariant?: "default" | "outline";
}

export function DataSection({
  title,
  description,
  users,
  showPopulated,
  badgeText,
  badgeVariant = "outline",
}: DataSectionSharedProps & DataSectionProps) {
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
        {showPopulated
          ? users.map((user) => (
              <UserCard
                key={user._id.toString()}
                user={user as JSONSerialized<UserDocumentPopulated>}
                showPopulated={true}
              />
            ))
          : users.map((user) => (
              <UserCard
                key={user._id.toString()}
                user={user as JSONSerialized<UserDocument>}
                showPopulated={false}
              />
            ))}
      </CardContent>
    </Card>
  );
}
