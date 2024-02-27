import { unstable_noStore as noStore } from "next/cache";
import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";

const Home = async () => {
  noStore();

  const data = await api.post.getAll.query();
  const dataOne = await api.post.getOne.query({ id: 2 });

  return (
    <main className=" bg min-h-screen">
      {data.map(({ id }) => (
        <div className="" key={id.toString()}>
          <Button>{id}</Button>
        </div>
      ))}
    </main>
  );
};

export default Home;
