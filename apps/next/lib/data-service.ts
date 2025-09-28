import userModel, { type UserDocument } from "@/models/User";
import organisationModel, { type OrganisationDocument } from "@/models/Organisation";

// Type for user with populated organisation
type UserWithPopulatedOrg = Omit<UserDocument, 'organisationId'> & {
  organisationId?: OrganisationDocument;
};

// Type for user with non-populated organisation (just ID)
type UserWithOrgId = Omit<UserDocument, 'organisationId'> & {
  organisationId?: string;
};

export async function setupSampleData(): Promise<void> {
  try {
    // Clear existing data
    await userModel.delete({});
    await organisationModel.delete({});

    // Create sample organisations
    const org1Result = await organisationModel.create({
      name: "Tech Innovators Inc.",
      description: "Leading technology solutions provider",
      website: "https://techinnovators.com",
      industry: "Technology"
    });

    const org2Result = await organisationModel.create({
      name: "Green Energy Solutions",
      description: "Sustainable energy for the future",
      website: "https://greenenergy.com",
      industry: "Energy"
    });

    // Create sample users
    await userModel.create({
      name: "John Doe",
      email: "john@techinnovators.com",
      organisationId: org1Result.insertedId.toString(),
      address: {
        street: "123 Tech Street",
        city: "San Francisco",
        state: "CA",
        zip: "94105"
      }
    });

    await userModel.create({
      name: "Jane Smith",
      email: "jane@greenenergy.com",
      organisationId: org2Result.insertedId.toString(),
      address: {
        street: "456 Green Ave",
        city: "Portland",
        state: "OR",
        zip: "97201"
      }
    });

    await userModel.create({
      name: "Bob Wilson",
      email: "bob@freelancer.com",
      // No organisation
      address: {
        street: "789 Solo Lane",
        city: "Austin",
        state: "TX",
        zip: "73301"
      }
    });

    console.log("✅ Sample data setup complete");
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
    const usersWithoutPopulate: UserWithOrgId[] = rawUsers.map(user => ({
      _id: user._id.toString(),
      name: user.name || '',
      email: user.email || '',
      address: user.address,
      organisationId: user.organisationId ? String(user.organisationId) : undefined
    }));

    // Get users with populate (organisationId will be OrganisationDocument)
    // Note: This is a placeholder - actual populate implementation would be different
    const usersWithPopulate: UserWithPopulatedOrg[] = [];
    
    // For demo purposes, manually populate the organisation data
    for (const user of rawUsers) {
      const populatedUser: UserWithPopulatedOrg = {
        _id: user._id.toString(),
        name: user.name || '',
        email: user.email || '',
        address: user.address,
        organisationId: undefined
      };

      if (user.organisationId) {
        const orgResult = await organisationModel.findOne({ _id: String(user.organisationId) });
        if (orgResult) {
          populatedUser.organisationId = {
            _id: orgResult._id.toString(),
            name: orgResult.name || '',
            description: orgResult.description,
            website: orgResult.website,
            industry: orgResult.industry
          };
        }
      }
      
      usersWithPopulate.push(populatedUser);
    }

    return {
      usersWithoutPopulate,
      usersWithPopulate
    };
  } catch (error) {
    console.error("❌ Error getting populate test data:", error);
    throw error;
  }
}
