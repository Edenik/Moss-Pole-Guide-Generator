import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const brownMossColors: string[] = [
  '#c4b7a6', // Light tan
  '#d2c6b5', // Warm beige
  '#b5a088', // Darker tan
  '#e0d5c5', // Very light tan
  '#c2b2a3', // Warm tan
  '#baa89a', // Medium brown
  '#d4c8b9', // Light beige
  '#cdbfae', // Soft tan
  '#b8a695', // Natural brown
  '#c7baaa', // Natural tan
  '#af9d8c', // Deep tan
  '#d8ccbd', // Light brown
];

export const greenMossColors: string[] = [
  '#2d5a27', // Dark green
  '#3f7d2f', // Medium green
  '#4e9935', // Bright green
  '#60b044', // Vivid green
  '#72c753', // Light green
  '#85de62', // Very light green
];

export const getRandomColor = (isGreenSpot: boolean): string => {
  const colorArray: string[] = isGreenSpot ? greenMossColors : brownMossColors;
  return colorArray[Math.floor(Math.random() * colorArray.length)];
};