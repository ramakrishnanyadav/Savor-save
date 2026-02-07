import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number in Indian numbering system (e.g., 1,00,000)
export function formatINR(amount: number): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

// Format number with Indian numbering system without currency symbol
export function formatIndianNumber(amount: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(amount));
}

// Get price range display
export function getPriceRangeDisplay(priceRange: number): string {
  return '₹'.repeat(priceRange);
}

// Get price range label
export function getPriceRangeLabel(priceRange: number): string {
  switch (priceRange) {
    case 1:
      return 'Under ₹200';
    case 2:
      return '₹200 - ₹500';
    case 3:
      return '₹500 - ₹1,000';
    case 4:
      return '₹1,000+';
    default:
      return 'Unknown';
  }
}
