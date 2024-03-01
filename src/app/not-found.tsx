import Link from "next/link";

// COMPONENTS
import { Icon } from "~/components/Icon";
import { Button } from "~/components/ui/button";

const NotFound = () => {
  return (
    <div className="absolute left-0 top-0 flex h-dvh w-dvw flex-col items-center justify-center space-y-2 bg-gray-50 text-center">
      <h2 className="text-3xl">Not Found</h2>

      <p className="mb-2">Could not find requested resource</p>

      <Button asChild variant="ghost">
        <Link href="/" className=" flex">
          <Icon type="HOME" className="mr-2" /> Return Home
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
