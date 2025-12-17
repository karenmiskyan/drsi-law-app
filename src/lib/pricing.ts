export type MaritalStatus =
  | "single"
  | "married"
  | "married_to_citizen"
  | "divorced"
  | "widowed"
  | "legally_separated";

export const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "married_to_citizen", label: "Married to US Citizen / Legal Resident" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "legally_separated", label: "Legally Separated" },
] as const;

export const GOVERNMENT_FEE = 1.0;

/**
 * Calculate the service fee based on marital status
 */
export function calculateServiceFee(maritalStatus: MaritalStatus): number {
  switch (maritalStatus) {
    case "married":
      return 598;
    case "single":
    case "married_to_citizen":
    case "divorced":
    case "widowed":
    case "legally_separated":
      return 299;
    default:
      return 299;
  }
}

/**
 * Calculate the total price including government fee
 */
export function calculateTotalPrice(maritalStatus: MaritalStatus): number {
  const serviceFee = calculateServiceFee(maritalStatus);
  return serviceFee + GOVERNMENT_FEE;
}

/**
 * Check if the selected marital status qualifies for the double chance bundle
 */
export function isDoubleChanseBundle(maritalStatus: MaritalStatus): boolean {
  return maritalStatus === "married";
}

