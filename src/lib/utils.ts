import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const mathClamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);
