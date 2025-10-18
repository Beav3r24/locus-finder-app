import { init } from '@instantdb/react';

// TODO: Replace with your Instant DB app ID from https://instantdb.com/dash
const APP_ID = 'YOUR_INSTANT_DB_APP_ID';

// Initialize Instant DB
// You'll define your schema in the Instant DB dashboard
export const db = init({ appId: APP_ID });

// Type definitions for your data
export type User = {
  id: string;
  username: string;
  coins: number;
  activeSkin: string;
  totalDistance: number;
  dailyGoal: number;
  createdAt: number;
};

export type Run = {
  id: string;
  userId: string;
  distance: number;
  duration: number;
  date: number;
  coinsEarned: number;
};

export type Skin = {
  id: string;
  name: string;
  price: number;
  image: string;
};
