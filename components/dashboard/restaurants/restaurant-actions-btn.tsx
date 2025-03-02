"use client";

import useModalStore from "@/hooks/use-store-modal";
import { Restaurant, Table } from "@prisma/client";
import { Settings, Trash2 } from "lucide-react";
import React from "react";

interface ActionBtnProps {
  action: "delete" | "update";
  type: "restaurant" | "table";
  restaurant?: Restaurant;
  table?: Table;
}

const actionTypeMap = {
  delete: <Trash2 className="h-4 w-4 ml-2 text-red-500" />,
  update: <Settings className="h-4 w-4 ml-2 text-gray-500" />,
};

const ActionBtn: React.FC<ActionBtnProps> = ({
  action,
  type,
  restaurant,
  table,
}) => {
  //get Global (zustand) modal state
  const { onOpen } = useModalStore();
  const modalAction =
    type === "restaurant" && action === "delete"
      ? "delete-restaurant"
      : type === "restaurant" && action === "update"
      ? "update-restaurant"
      : type === "table" && action === "delete"
      ? "delete-table"
      : "update-table";
  return (
    <button
      className="hover:scale-110 transition-all"
      onClick={() => onOpen(modalAction, { restaurant, table })}
    >
      {actionTypeMap[action]}
    </button>
  );
};

export default ActionBtn;
