"use client";

import { useState } from "react";

import { Restaurant } from "@prisma/client";

import useModalStore from "@/hooks/use-store-modal";

import { useParams, useRouter } from "next/navigation";

import {
  Check,
  PlusSquare,
  ChevronsUpDown,
  Store as StoreIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CommandSeparator } from "cmdk";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;
interface StoreComboboxProps extends PopoverTriggerProps {
  restaurants: Restaurant[];
}

export function StoreCombobox({ restaurants = [] }: StoreComboboxProps) {
  const [open, setOpen] = useState(false);

  const params = useParams();
  const router = useRouter();
  const storeModal = useModalStore();

  //format the Items<Restaurant> to only use the name prop and id
  const routes = restaurants.map((res) => ({
    label: res.name,
    value: res.id,
  }));

  //find the Store that is currently in the pathname
  const currentActiveRestaurant = routes.find(
    (res) => res.value === params?.restaurantId
  );

  const handleSelectRes = (restaurant: { label: string; value: string }) => {
    setOpen(false); //close modal
    router.push(`/dashboard/restaurants/${restaurant.value}`); //push to selected restaurant
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a store"
          className="flex flex-row gap-4 border-none min-w-[150px]"
        >
          <StoreIcon size={20} />

          {currentActiveRestaurant && <p>{currentActiveRestaurant.label}</p>}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[230px] p-0 border">
        <Command>
          <CommandList>
            <CommandInput placeholder="Buscar restaurante" />

            <CommandEmpty>Sin resultados.</CommandEmpty>

            <CommandGroup heading="Tus restaurantes">
              <CommandItem
                className={cn("cursor-pointer")}
                onSelect={() => router.push("/dashboard/restaurants")}
              >
                <StoreIcon size={20} />
                {!currentActiveRestaurant?.label && (
                  <div className="ml-auto">
                    <Check />
                  </div>
                )}
              </CommandItem>
              {routes.map((route) => (
                <CommandItem
                  key={route.value}
                  onSelect={() => handleSelectRes(route)}
                  className={
                    (cn("text-sm"),
                    currentActiveRestaurant?.label === route.label
                      ? "font-bold"
                      : "")
                  }
                >
                  {route.label}
                  {currentActiveRestaurant?.label === route.label && (
                    <div className="ml-auto">
                      <Check />
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                className="font-bold flex gap-2 cursor-pointer"
                onSelect={() => {
                  //activate the create-store modal
                  storeModal.onOpen("create-initial-restaurant");
                }}
              >
                <PlusSquare />
                Crear nuevo restaurante
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
