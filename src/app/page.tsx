import { unstable_noStore as noStore } from "next/cache";
import { api } from "~/trpc/server";

// COMPONENTS
import Post from "~/components/forum/Post";

const Home = async () => {
  noStore();

  const postList = await api.post.getAll.query();

  return (
    <main className=" bg min-h-screen">
      {postList.map((item) => (
        <Post post={item} key={item.id.toString()} />
      ))}
    </main>
  );
};

export default Home;
