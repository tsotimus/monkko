import userModel, {
  type UserDocument,
  type UserDocumentPopulated,
} from "@/models/User";
import organisationModel, {
  type OrganisationDocument,
} from "@/models/Organisation";
import { ObjectId } from "mongodb";

// Type for user with populated organisation for UI consumption
type UserWithPopulatedOrg = UserDocumentPopulated;

// Type for user with non-populated organisation (just ID)
type UserWithOrgId = UserDocument;

export async function setupSampleData(): Promise<void> {
  try {
    // Check existing data counts
    const existingUsers = await userModel.find({});
    const existingOrgs = await organisationModel.find({});
    
    console.log(
      `📊 Current data: ${existingUsers.length} users, ${existingOrgs.length} organisations`,
    );

    // STEP 1: Ensure we have exactly 2 organisations
    const orgIds: ObjectId[] = [];

    // Get existing org IDs
    for (const org of existingOrgs) {
      orgIds.push(org._id);
    }

    // Create organisations to reach exactly 2
    if (existingOrgs.length < 2) {
      const orgsToCreate = 2 - existingOrgs.length;
      console.log(`🏢 Creating ${orgsToCreate} organisation(s) to reach target of 2...`);
      
      if (existingOrgs.length === 0) {
        // Create first org
        const org1Result = await organisationModel.create({
          name: "Tech Innovators Inc.",
          description: "Leading technology solutions provider",
          website: "https://techinnovators.com",
          industry: "Technology"
        });
        orgIds.push(org1Result.insertedId);
        
        // Create second org
        const org2Result = await organisationModel.create({
          name: "Green Energy Solutions",
          description: "Sustainable energy for the future",
          website: "https://greenenergy.com",
          industry: "Energy"
        });
        orgIds.push(org2Result.insertedId);
      } else if (existingOrgs.length === 1) {
        // Create only the second org
        const org2Result = await organisationModel.create({
          name: "Green Energy Solutions",
          description: "Sustainable energy for the future",
          website: "https://greenenergy.com",
          industry: "Energy"
        });
        orgIds.push(org2Result.insertedId);
      }
    } else {
      console.log("🏢 Already have 2+ organisations");
    }

    // STEP 2: Ensure we have exactly 2 users (each with an organisation)
    if (existingUsers.length < 2) {
      const usersToCreate = 2 - existingUsers.length;
      console.log(
        `👤 Creating ${usersToCreate} user(s) to reach target of 2...`,
      );

      const johnExists = existingUsers.some(
        (user) => user.email === "john@techinnovators.com",
      );
      const janeExists = existingUsers.some(
        (user) => user.email === "jane@greenenergy.com",
      );

      if (!johnExists && existingUsers.length === 0) {
        // Create John Doe with first org
        await userModel.create({
          name: "John Doe",
          email: "john@techinnovators.com",
          organisationId: orgIds[0],
          address: {
            street: "123 Tech Street",
            city: "San Francisco",
            state: "CA",
            zip: "94105"
          }
        });
      }

      if (!janeExists && existingUsers.length <= 1) {
        // Create Jane Smith with second org
        await userModel.create({
          name: "Jane Smith",
          email: "jane@greenenergy.com",
          organisationId: orgIds[1],
          address: {
            street: "456 Green Ave",
            city: "Portland",
            state: "OR",
            zip: "97201"
          }
        });
      }
    } else {
      console.log("👤 Already have 2+ users");
    }

    const finalCounts = {
      users: (await userModel.find({})).length,
      orgs: (await organisationModel.find({})).length,
    };
    
    console.log(
      `✅ Sample data setup complete - ${finalCounts.users} users, ${finalCounts.orgs} organisations`,
    );
  } catch (error) {
    console.error("❌ Error setting up sample data:", error);
    throw error;
  }
}

export async function getPopulateTestData(): Promise<{
  usersWithoutPopulate: UserWithOrgId[];
  usersWithPopulate: UserWithPopulatedOrg[];
}> {
  try {
    // Get users without populate (organisationId will be string)
    const rawUsers = await userModel.find({});
    const usersWithoutPopulate: UserWithOrgId[] = rawUsers.map((user) => ({
      _id: user._id,
      name: user.name || "",
      email: user.email || "",
      address: user.address,
      organisationId: user.organisationId,
    }));

    // Get users with populate (organisationId will be OrganisationDocument)
    // Using the actual populate functionality
    const populatedUsersRaw = await userModel
      .find({})
      .populate<OrganisationDocument, "organisationId">("organisationId");

    const usersWithPopulate: UserWithPopulatedOrg[] = populatedUsersRaw.map(
      (user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        organisationId: user.organisationId,
      }),
    );

    return {
      usersWithoutPopulate,
      usersWithPopulate
    };
  } catch (error) {
    console.error("❌ Error getting populate test data:", error);
    throw error;
  }
}
