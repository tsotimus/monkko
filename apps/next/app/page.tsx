import userModel from "@/models/User";

async function getUsers() {


  const users = await userModel.find({});

  if(users.length === 0) {
    await userModel.create({
      name: "John Doe",
      email: "john.doe@example.com",
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        zip: "12345"
      }
    });
  }
  return users;
}

export default async function Home() {
  const users = await getUsers();
  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user._id.toString()}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
