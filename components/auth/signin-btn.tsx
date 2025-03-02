import { signIn } from "@/auth";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export function SignInBtn({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={async () => {
        "use server";

        await signIn("google", {
          redirectTo: "/dashboard",
        });
      }}
    >
      <Button
        className={cn("transition hover:bg-indigo-700 max-w-2xl", className)}
      >
        {children}
      </Button>
    </form>
  );
}
