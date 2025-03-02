import Link from "next/link";
import { headers } from "next/headers";

export default async function NotFound() {
  const headersList = headers();
  const domain = headersList.get("host");
  return (
    <div className="text-black">
      <h2>Not Found</h2>
     
    </div>
  );
}
