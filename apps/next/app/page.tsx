import userModel from "@/models/User";

async function getUsers() {


  const users = await userModel.find({});
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
