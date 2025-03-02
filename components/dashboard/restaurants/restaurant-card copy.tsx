import { Restaurant } from "@prisma/client";
import React from "react";
import Image from "next/image";
import ActionBtn from "./restaurant-actions-btn";
import Link from "next/link";

// Define or update the `RestaurantCardProps` type
// interface RestaurantCardProps {
//   restaurant: {
//     id: string;
//     name: string;
//     location: string;
//     ownerId: string;
//     createdAt: Date;
//     updatedAt: Date;
//     tables: {
//       id: string;
//       createdAt: Date;
//       updatedAt: Date;
//       tableNumber: string;
//       restaurantId: string;
//       qrCodeUrl: string | null;
//       bills: {
//         id: string;
//         createdAt: Date;
//         updatedAt: Date;
//         tableId: string;
//         totalAmount: number;
//         isPaid: boolean;
//         server: string;
//       }[];
//     }[];
//   };
// }

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <div className="rounded-lg p-4 shadow-md shadow-indigo-100 w-full flex flex-col items-center">
      <Link href={`/dashboard/restaurants/${restaurant.id}`}>
        <Image
          alt={`${restaurant.id} image.`}
          src="https://images.unsplash.com/photo-1613545325278-f24b0cae1224?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
          className=""
          width={300}
          height={300}
        />
      </Link>

      <div className="mt-2 w-full">
        <div className="flex items-center justify-center w-full flex-col">
          <h1 className="font-bold">{restaurant.name}</h1>
          <p className="text-indigo-600 text-sm">{restaurant.location}</p>
        </div>
        <div className="mt-6 flex flex-row items-center gap-8 text-xs justify-center">
          <ActionBtn
            action={"delete"}
            type={"restaurant"}
            restaurant={restaurant}
          />
          <ActionBtn
            action={"update"}
            type={"restaurant"}
            restaurant={restaurant}
          />
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
