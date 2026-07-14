import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarUrl(seed: string, gender?: string) {
  let style = "micah";
  if (gender === "male") style = "adventurer";
  if (gender === "female") style = "lorelei";
  
  // Use fun background colors
  const bg = "b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc";
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}`;
}
