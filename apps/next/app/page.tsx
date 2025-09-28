import { setupSampleData, getPopulateTestData } from "@/lib/data-service";
import { PageHeader } from "@/components/PageHeader";
import { StatsSection } from "@/components/StatsSection";
import { DataSection } from "@/components/DataSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";

export default async function Home() {
  // Setup sample data
  await setupSampleData();
  
  // Test our new populate API
  const { usersWithoutPopulate, usersWithPopulate } = await getPopulateTestData();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <PageHeader />
        
        <StatsSection 
          rawUsersCount={usersWithoutPopulate.length}
          populatedUsersCount={usersWithPopulate.length}
        />

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <DataSection
            title="Raw Data"
            description="Without populate"
            users={usersWithoutPopulate}
            showPopulated={false}
            badgeText="string IDs"
            badgeVariant="outline"
          />
          
          <DataSection
            title="Populated Data"
            description="With populate"
            users={usersWithPopulate}
            showPopulated={true}
            badgeText="full objects"
            badgeVariant="default"
          />
        </div>

        <HowItWorksSection />
      </div>
    </div>
  );
}
