import userModel from "@/models/User";
import organisationModel from "@/models/Organisation";
import type { OrganisationDocument } from "@/models/Organisation";

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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Monko ORM Populate API Demo</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>📊 Users without Populate (organisationId as string)</h2>
        <ul>
          {usersWithoutPopulate.map((user) => (
            <li key={user._id.toString()} style={{ marginBottom: '10px' }}>
              <strong>{user.name}</strong> ({user.email})
              <br />
              <span style={{ color: '#666' }}>
                Organisation ID: {user.organisationId ? String(user.organisationId) : 'None'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>🔗 Users with Populate (organisationId as OrganisationDocument)</h2>
        <ul>
          {usersWithPopulate.map((user) => (
            <li key={user._id.toString()} style={{ marginBottom: '15px' }}>
              <strong>{user.name}</strong> ({user.email})
              <br />
              {user.organisationId && typeof user.organisationId === 'object' ? (
                <div style={{ color: '#0066cc', marginLeft: '20px' }}>
                  🏢 <strong>{(user.organisationId as OrganisationDocument).name}</strong>
                  <br />
                  📝 {(user.organisationId as OrganisationDocument).description}
                  <br />
                  🌐 <a href={(user.organisationId as OrganisationDocument).website} target="_blank">
                    {(user.organisationId as OrganisationDocument).website}
                  </a>
                  <br />
                  🏭 Industry: {(user.organisationId as OrganisationDocument).industry}
                </div>
              ) : (
                <span style={{ color: '#666' }}>No organisation</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '5px' }}>
        <h3>✨ What's happening here?</h3>
        <ul>
          <li><strong>Without populate:</strong> <code>organisationId</code> is a string (MongoDB ObjectId)</li>
          <li><strong>With populate:</strong> <code>organisationId</code> is the full OrganisationDocument object</li>
          <li><strong>Type Safety:</strong> TypeScript knows the difference with explicit generics!</li>
          <li><strong>No .exec():</strong> Direct await works seamlessly</li>
        </ul>
      </div>
    </div>
  );
}
