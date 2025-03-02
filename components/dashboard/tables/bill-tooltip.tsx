import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BillTooltipProps {
  isPaid: boolean;
}

const BillTooltip: React.FC<BillTooltipProps> = ({ isPaid }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className="flex items-center justify-center">
          {isPaid === true ? (
            <div className="bg-red-400 rounded-full h-2 w-2" />
          ) : (
            <div className="bg-green-400 rounded-full h-2 w-2" />
          )}
        </TooltipTrigger>
        <TooltipContent>
          {isPaid === true && "Servicio Terminado."}
          {isPaid === false && "Servicio Activo."}
          {isPaid === undefined && "Servicio no"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BillTooltip;
