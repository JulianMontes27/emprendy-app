//This class is used to create a TCP or IPC server.
import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

//create a custom Response type
export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export interface User {
  id: string;
  name: string;
  email: string;
  // role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  name: string;
  price: string;
  ages: string;
  services: string[];
  plus: string[];
  paymentLink: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  membershipId: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  paymentGateway: string;
  paymentId: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
