"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Contact type from your Drizzle schema
export type Contact = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  companyName: string | null;
  jobTitle: string | null;
  status: string;
  tags: string[];
  createdAt: Date;
};

export const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorFn: (row) => {
      return `${row.firstName || ""} ${row.lastName || ""}`.trim() || "N/A";
    },
    cell: ({ row }) => {
      const firstName = row.original.firstName || "";
      const lastName = row.original.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim() || "N/A";

      return <div className="font-medium">{fullName}</div>;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="lowercase">{row.original.email}</div>;
    },
  },
  {
    accessorKey: "companyName",
    header: "Company",
    cell: ({ row }) => {
      return <div>{row.original.companyName || "N/A"}</div>;
    },
  },
  {
    accessorKey: "jobTitle",
    header: "Job Title",
    cell: ({ row }) => {
      return <div>{row.original.jobTitle || "N/A"}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={status === "active" ? "outline" : "secondary"}>
          {status === "active" ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags || [];
      if (tags.length === 0)
        return <div className="text-muted-foreground text-sm">No tags</div>;

      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 2} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      // Format the date to a readable format
      return <div>{new Date(row.original.createdAt).toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contact = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/contacts/${contact.id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/contacts/${contact.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                // Add confirmation modal or deletion logic here
                console.log(`Delete contact: ${contact.id}`);
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
