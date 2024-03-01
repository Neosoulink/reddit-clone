import Link from "next/link";
import { Icon } from "~/components/Icon";

// COMPONENTS
import { Page } from "~/components/layout/Page";

const NotFound = () => {
  return (
    <Page>
      <div className="absolute left-0 top-0 flex h-dvh w-dvw flex-col items-center justify-center space-y-2 bg-gray-50 text-center">
        <h2 className="text-3xl">Not Found</h2>

        <p className="mb-2">Could not find requested resource</p>

        <Link href="/" className=" flex">
          <Icon type="HOME" className="mr-2" /> Return Home
        </Link>
      </div>
    </Page>
  );
};

export default NotFound;
