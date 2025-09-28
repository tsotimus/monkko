import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Building2 } from "lucide-react";
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

interface UserCardProps {
  user: UserDocument | UserWithPopulatedOrg | UserWithOrgId;
  showPopulated?: boolean;
}

export function UserCard({ user, showPopulated = false }: UserCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {String(user.name || 'Unknown').charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{String(user.name || 'Unknown User')}</h3>
          <p className="text-sm text-muted-foreground">{String(user.email || 'No email')}</p>
        </div>
      </div>
      
      <Separator className="my-3" />
      
      {showPopulated ? (
        <PopulatedOrganisation organisationId={user.organisationId as OrganisationDocument} />
      ) : (
        <RawOrganisationId organisationId={user.organisationId as string} />
      )}
    </Card>
  );
}

function RawOrganisationId({ organisationId }: { organisationId?: string }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Organisation ID
      </div>
      <code className="block p-3 bg-muted rounded-md text-sm font-mono break-all">
        {organisationId || 'None'}
      </code>
    </div>
  );
}

function PopulatedOrganisation({ organisationId }: { organisationId?: OrganisationDocument }) {
  if (!organisationId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No organisation</p>
      </div>
    );
  }

  const org = organisationId;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4" />
        <h4 className="font-semibold text-lg">
          {org.name || 'Unknown Organisation'}
        </h4>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Description
          </div>
          <p className="text-sm">
            {org.description || 'No description'}
          </p>
        </div>
        
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Website
          </div>
          <a 
            href={org.website} 
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline text-sm"
          >
            {org.website || 'No website'}
          </a>
        </div>
        
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Industry
          </div>
          <Badge variant="secondary">
            {org.industry || 'Unknown'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
