import getSession from "@/lib/get-session";
import UserButton from "../auth/user-button";

import { MobileNav } from "./mobile-nav";
import MainNav from "./main-nav";
import { StoreCombobox } from "./store-combobox";

import prisma from "@/lib/prisma";

interface Route {
  href: string;
  title: string;
}
export type RouteList = Route[];

const Navbar = async ({ restaurantId }: { restaurantId: string }) => {
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    return null;
  }

  const routes: RouteList = [
    {
      href: `/${restaurantId}/`,
      title: "Overview",
    },
    {
      href: `/${restaurantId}/tables`,
      title: "Tables",
    },
    {
      href: `/${restaurantId}/data`,
      title: "Data",
    },
  ];

  const res = await prisma.restaurant.findMany({
    where: {
      ownerId: user.id,
    },
  });
  return (
    <div className="flex flex-row justify-between mb-10 p-4 border-b-2 ">
      <StoreCombobox restaurants={res} />
      <MainNav routes={routes} restaurantId={restaurantId} />
      <div className="flex flex-row">
        <UserButton user={user} />
        <div className="xl:hidden">
          <MobileNav routes={routes} restaurantId={restaurantId} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
