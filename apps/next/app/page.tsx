import userModel from "@/models/User";
import organisationModel from "@/models/Organisation";
import type { OrganisationDocument } from "@/models/Organisation";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Building2, Shield, Zap, Database, Link, Settings } from "lucide-react";

async function setupData() {
  // Create some organisations first
  const orgs = await organisationModel.find({});
  
  let techCorpId: string;
  let designStudioId: string;
  
  if (orgs.length === 0) {
    console.log("Creating sample organisations...");
    
    const techCorpResult = await organisationModel.create({
      name: "Tech Corp",
      description: "A technology company",
      website: "https://techcorp.com",
      industry: "Technology"
    });
    
    const designStudioResult = await organisationModel.create({
      name: "Design Studio",
      description: "Creative design agency",
      website: "https://designstudio.com", 
      industry: "Design"
    });
    
    techCorpId = techCorpResult.insertedId.toString();
    designStudioId = designStudioResult.insertedId.toString();
  } else {
    // Find specific organisations by name
    const techCorp = await organisationModel.findOne({ name: "Tech Corp" });
    const designStudio = await organisationModel.findOne({ name: "Design Studio" });
    
    techCorpId = techCorp?._id.toString() || "";
    designStudioId = designStudio?._id.toString() || "";
  }
  
  // Create users with organisation references
  const users = await userModel.find({});
  
  if (users.length === 0) {
    console.log("Creating sample users...");
    await userModel.create({
      name: "John Doe",
      email: "john.doe@example.com",
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        zip: "12345"
      },
      organisationId: techCorpId // Reference to Tech Corp
    });
    
    await userModel.create({
      name: "Jane Smith", 
      email: "jane.smith@example.com",
      address: {
        street: "456 Oak Ave",
        city: "Somewhere",
        state: "NY", 
        zip: "67890"
      },
      organisationId: designStudioId // Reference to Design Studio
    });
  }
  
  return { users: await userModel.find({}), orgs: await organisationModel.find({}) };
}

async function testPopulateAPI() {
  console.log("🧪 Testing new populate API...");
  
  // Test 1: Query without populate (organisationId will be string)
  const usersWithoutPopulate = await userModel.find({});
  console.log("✅ Users without populate:", usersWithoutPopulate.length);
  
  // Test 2: Query with populate (organisationId will be OrganisationDocument)
  const usersWithPopulate = await userModel.find({}).populate<OrganisationDocument>('organisationId');
  console.log("✅ Users with populate:", usersWithPopulate.length);
  
  return { usersWithoutPopulate, usersWithPopulate };
}

export default async function Home() {
  // Setup sample data
  await setupData();
  
  // Test our new populate API
  const { usersWithoutPopulate, usersWithPopulate } = await testPopulateAPI();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <Badge variant="secondary" className="text-sm">
            <Shield className="w-3 h-3 mr-1" />
            Type-Safe ORM
          </Badge>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              Monko ORM
            </h1>
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Populate API Demo
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience type-safe population with automatic return type inference. 
              See how our ORM transforms your data relationships seamlessly.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{usersWithoutPopulate.length}</div>
              <div className="text-sm text-muted-foreground">Raw Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{usersWithPopulate.length}</div>
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

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Raw Data */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Raw Data
                  </CardTitle>
                  <CardDescription>Without populate</CardDescription>
                </div>
                <Badge variant="outline">string IDs</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {usersWithoutPopulate.map((user) => (
                <Card key={user._id.toString()} className="p-4">
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
                  
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Organisation ID
                    </div>
                    <code className="block p-3 bg-muted rounded-md text-sm font-mono break-all">
                      {user.organisationId ? String(user.organisationId) : 'None'}
                    </code>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Populated Data */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="w-5 h-5" />
                    Populated Data
                  </CardTitle>
                  <CardDescription>With populate</CardDescription>
                </div>
                <Badge variant="default">full objects</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {usersWithPopulate.map((user) => (
                <Card key={user._id.toString()} className="p-4">
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
                  
                  {user.organisationId && typeof user.organisationId === 'object' ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <h4 className="font-semibold text-lg">
                          {(user.organisationId as OrganisationDocument).name || 'Unknown Organisation'}
                        </h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            Description
                          </div>
                          <p className="text-sm">
                            {(user.organisationId as OrganisationDocument).description || 'No description'}
                          </p>
                        </div>
                        
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            Website
                          </div>
                          <a 
                            href={(user.organisationId as OrganisationDocument).website} 
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            {(user.organisationId as OrganisationDocument).website || 'No website'}
                          </a>
                        </div>
                        
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            Industry
                          </div>
                          <Badge variant="secondary">
                            {(user.organisationId as OrganisationDocument).industry || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No organisation</p>
                    </div>
                  )}
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
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
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-6 h-6 text-primary" />
                  <h4 className="font-semibold">Without Populate</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Returns raw MongoDB ObjectIds as strings. Fast queries, minimal data transfer.
                </p>
                <Badge variant="outline" className="font-mono">string</Badge>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Link className="w-6 h-6 text-primary" />
                  <h4 className="font-semibold">With Populate</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatically resolves references to full document objects with complete data.
                </p>
                <Badge variant="outline" className="font-mono">Document</Badge>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                  <h4 className="font-semibold">Type Safety</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  TypeScript automatically infers correct types based on populate usage.
                </p>
                <Badge variant="outline" className="font-mono">Generic&lt;T&gt;</Badge>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-primary" />
                  <h4 className="font-semibold">Zero Config</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  No .exec() calls needed. Direct await support with seamless integration.
                </p>
                <Badge variant="outline" className="font-mono">await</Badge>
              </Card>
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
                    <p className="text-sm text-muted-foreground">Experience the power of Monko ORM in your next project</p>
                  </div>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
