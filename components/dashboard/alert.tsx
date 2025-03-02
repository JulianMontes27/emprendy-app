import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AlertDestructiveProps {
  msg: string;
}

export function AlertDestructive({ msg }: AlertDestructiveProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Atención</AlertTitle>
      <AlertDescription>{msg}</AlertDescription>
    </Alert>
  );
}
