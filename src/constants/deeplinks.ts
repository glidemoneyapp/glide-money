/**
 * Bank deep link constants for Glide Guard payment flows
 * Ordered by likelihood; try each until one opens. Fallback to copy.
 */

// Deep link schemes for Canadian banks
export const BANK_DEEPLINKS: Record<string, string[]> = {
  rbc: ["rbc://", "rbcmobile://"],
  td: ["td://", "tdcanadatrust://"],
  cibc: ["cibc://"],
  bmo: ["bmo://"],
  scotia: ["scotiabank://", "scotia://"],
  tangerine: ["tangerine://"],
  amex: ["amex://"],
  // Add more as needed
};

// App store URLs if neither app is installed nor deep link supported
export const BANK_STORES: Record<string, string> = {
  rbc: "https://apps.apple.com/ca/app/rbc-mobile/id407597290",
  td: "https://apps.apple.com/ca/app/td-canada/id358790776",
  cibc: "https://apps.apple.com/ca/app/cibc-mobile-banking/id407176152",
  bmo: "https://apps.apple.com/ca/app/bmo-mobile-banking/id407217367",
  scotia: "https://apps.apple.com/ca/app/scotiabank/id365437773",
  tangerine: "https://apps.apple.com/ca/app/tangerine-mobile-banking/id370434175",
  amex: "https://apps.apple.com/ca/app/amex-mobile/id337000341",
  // Add more as needed
};

// Bank name mapping for display
export const BANK_NAMES: Record<string, string> = {
  rbc: "RBC",
  td: "TD Canada Trust",
  cibc: "CIBC",
  bmo: "BMO",
  scotia: "Scotia Bank",
  tangerine: "Tangerine",
  amex: "American Express",
};
