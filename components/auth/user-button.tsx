import Image from "next/image";
import Link from "next/link";
import { users } from "@/db/schema";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import { handleLogout } from "@/actions/signout-client";
import { db } from "@/db";
import { eq } from "drizzle-orm";

interface UserButtonProps {
  userId: string;
}

type User = {
  image: string | null;
  name: string | null;
};

export default async function UserButton({ userId }: UserButtonProps) {
  // Fetch user data
  const user: User | undefined = await db
    .select({
      name: users.name,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, userId))
    .then((res) => res[0]); // Get the first result

  // If user is not found, return null
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="flex-none rounded-full">
          {user.image && (
            <Image
              src={user.image}
              alt="User profile picture"
              width={50}
              height={50}
              className="aspect-square rounded-full bg-background object-cover"
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{user.name || "User"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={handleLogout} className="w-full">
            <Button
              type="submit"
              variant="ghost"
              className="flex w-full items-center justify-start p-0"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
