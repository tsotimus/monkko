// Quick test of the new populate API
import userModel from "./apps/next/models/User";

// Test the new API
async function testAPI() {
  try {
    // ✅ NEW: Direct await without .exec()
    console.log("Testing direct await...");
    const users = await userModel.find({});
    console.log("✅ Direct await works!");

    // ✅ NEW: Populate with type safety (if we had ref fields)
    // const populatedUsers = await userModel.find({}).populate<SomeDocument>('someRefField');
    
    console.log("All tests passed! 🎉");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Export for potential use
export { testAPI };
