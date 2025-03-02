import getSession from "@/lib/get-session";
import { notFound } from "next/navigation";

const AccountPage = async () => {
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    return notFound();
  }
  return <div>AccountPage</div>;
};

export default AccountPage;
