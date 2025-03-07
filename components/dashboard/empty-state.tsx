// components/dashboard/empty-state.jsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionHref,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        {icon}
      </div>
      <h3 className="mt-6 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild className="mt-6">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
