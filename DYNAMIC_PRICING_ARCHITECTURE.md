# Dynamic Pricing Architecture - DRSI Law Registration Wizard

## Data Structure (State Management)

### 1. Zustand Store Structure

The application uses Zustand for global state management. Here's the complete state structure:

```typescript
// src/stores/registrationStore.ts

export interface RegistrationState {
  // Current step (1-4)
  currentStep: number;
  
  // Form data
  contactInfo: ContactInfo | null;
  maritalStatus: MaritalStatus | null;  // ← KEY for pricing
  signature: string | null;
  agreedToTerms: boolean;
  
  // Payment tracking
  paymentIntentId: string | null;
  
  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setContactInfo: (info: ContactInfo) => void;
  setMaritalStatus: (status: MaritalStatus) => void;  // ← Updates pricing
  setSignature: (signature: string) => void;
  setAgreedToTerms: (agreed: boolean) => void;
  setPaymentIntentId: (id: string) => void;
  resetWizard: () => void;
}
```

### 2. Pricing Data Structure

```typescript
// src/lib/pricing.ts

// Type definition for marital status
export type MaritalStatus =
  | "single"
  | "married"
  | "married_to_citizen"
  | "divorced"
  | "widowed"
  | "legally_separated";

// Constants
export const GOVERNMENT_FEE = 1.0;

// Pricing options for the dropdown
export const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "married_to_citizen", label: "Married to US Citizen / Legal Resident" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "legally_separated", label: "Legally Separated" },
] as const;
```

## Dynamic Pricing Logic

### Core Pricing Functions

```typescript
/**
 * Calculate the service fee based on marital status
 * This is the CRITICAL function that determines pricing
 */
export function calculateServiceFee(maritalStatus: MaritalStatus): number {
  switch (maritalStatus) {
    case "married":
      return 598;  // Double application bundle
    case "single":
    case "married_to_citizen":
    case "divorced":
    case "widowed":
    case "legally_separated":
      return 299;  // Standard rate
    default:
      return 299;
  }
}

/**
 * Calculate total price including government fee
 */
export function calculateTotalPrice(maritalStatus: MaritalStatus): number {
  const serviceFee = calculateServiceFee(maritalStatus);
  return serviceFee + GOVERNMENT_FEE;  // Service Fee + $1.00
}

/**
 * Check if selected status qualifies for double chance bundle
 * Used to display the special badge
 */
export function isDoubleChanseBundle(maritalStatus: MaritalStatus): boolean {
  return maritalStatus === "married";
}
```

### Pricing Breakdown Examples

| Marital Status | Service Fee | Gov Fee | **Total** |
|----------------|-------------|---------|-----------|
| Single | $299 | $1.00 | **$300** |
| Married | $598 | $1.00 | **$599** |
| Married to US Citizen | $299 | $1.00 | **$300** |
| Divorced | $299 | $1.00 | **$300** |
| Widowed | $299 | $1.00 | **$300** |
| Legally Separated | $299 | $1.00 | **$300** |

## Component Logic - Step 2 (Marital Status & Pricing)

### Component Structure

```typescript
export function Step2MaritalStatus() {
  // 1. Get state and actions from Zustand store
  const { maritalStatus, setMaritalStatus, nextStep, previousStep } =
    useRegistrationStore();

  // 2. Initialize React Hook Form with validation
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MaritalStatusFormData>({
    resolver: zodResolver(maritalStatusSchema),
    defaultValues: {
      maritalStatus: maritalStatus || undefined,
    },
  });

  // 3. Watch for changes in real-time (triggers pricing update)
  const selectedStatus = watch("maritalStatus");

  // 4. Handle form submission
  const onSubmit = (data: MaritalStatusFormData) => {
    setMaritalStatus(data.maritalStatus);  // ← Updates global state
    nextStep();                             // ← Move to next step
  };

  // 5. Calculate pricing dynamically based on selected status
  const serviceFee = selectedStatus
    ? calculateServiceFee(selectedStatus)
    : null;
  
  const totalPrice = selectedStatus
    ? calculateTotalPrice(selectedStatus)
    : null;
  
  const showDoubleChanceBadge =
    selectedStatus && isDoubleChanseBundle(selectedStatus);

  // ... render logic below
}
```

### Dynamic UI Updates

The component uses React Hook Form's `watch()` to monitor the dropdown selection in real-time:

```typescript
const selectedStatus = watch("maritalStatus");
```

**How it works:**
1. User selects marital status from dropdown
2. `watch()` detects the change immediately
3. Pricing functions recalculate:
   - `calculateServiceFee(selectedStatus)` → Updates service fee
   - `calculateTotalPrice(selectedStatus)` → Updates total
   - `isDoubleChanseBundle(selectedStatus)` → Shows/hides badge
4. UI re-renders with new pricing

### Conditional Badge Display

```typescript
{selectedStatus && (
  <div className="mt-6 p-6 border rounded-lg bg-muted/50 space-y-4">
    <h3 className="font-semibold text-lg">Pricing Breakdown</h3>
    
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Service Fee:</span>
        <span className="font-semibold text-lg">
          {formatCurrency(serviceFee!)}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Government Fee:</span>
        <span className="font-semibold">
          {formatCurrency(GOVERNMENT_FEE)}
        </span>
      </div>
      
      <div className="border-t pt-3 flex justify-between items-center">
        <span className="font-semibold text-lg">Total:</span>
        <span className="font-bold text-2xl text-primary">
          {formatCurrency(totalPrice!)}
        </span>
      </div>
    </div>

    {/* Double Chance Bundle Badge - Only for "married" */}
    {showDoubleChanceBadge && (
      <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary fill-primary" />
          <Badge variant="default" className="text-xs">
            Double Chance Registration
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Includes registration for both husband and wife
        </p>
      </div>
    )}
  </div>
)}
```

## Data Flow Through Steps

### Step 2 → Step 3 (Contract)

When user submits Step 2:

```typescript
const onSubmit = (data: MaritalStatusFormData) => {
  setMaritalStatus(data.maritalStatus);  // ← Store in Zustand
  nextStep();                             // ← Navigate to Step 3
};
```

In Step 3, the contract displays the calculated price:

```typescript
// Step 3: Contract Signing Component
const totalPrice = maritalStatus
  ? calculateTotalPrice(maritalStatus)
  : 0;

// Replace [TOTAL_PRICE] in contract text
const personalizedAgreement = SERVICE_AGREEMENT.replace(
  "[TOTAL_PRICE]",
  formatCurrency(totalPrice)  // e.g., "$300" or "$599"
);
```

### Step 3 → Step 4 (Payment)

Step 4 reads the same state to show the summary:

```typescript
// Step 4: Payment Component
const serviceFee = calculateServiceFee(maritalStatus);
const totalPrice = calculateTotalPrice(maritalStatus);

// Display breakdown
<div className="flex justify-between items-center py-2">
  <div>
    <p className="font-medium">Service Fee</p>
  </div>
  <span className="font-semibold text-lg">
    {formatCurrency(serviceFee)}
  </span>
</div>

<div className="flex justify-between items-center py-2">
  <div>
    <p className="font-medium">Government Fee</p>
  </div>
  <span className="font-semibold">
    {formatCurrency(GOVERNMENT_FEE)}
  </span>
</div>

<div className="border-t pt-4 flex justify-between items-center">
  <span className="font-bold text-xl">Total Amount</span>
  <span className="font-bold text-3xl text-primary">
    {formatCurrency(totalPrice)}
  </span>
</div>
```

### Step 4 → Stripe → Webhook

When user clicks "Pay", the exact amount is sent to Stripe:

```typescript
// Step 4: Payment button handler
const handlePayment = async () => {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      maritalStatus,      // ← Used for metadata
      contactInfo,
      signature,
      amount: totalPrice, // ← Exact calculated amount
    }),
  });
  
  const { url } = await response.json();
  window.location.href = url;  // ← Redirect to Stripe Checkout
};
```

## Validation Schema for Step 2

```typescript
// src/lib/validation.ts

export const maritalStatusSchema = z.object({
  maritalStatus: z.enum([
    "single",
    "married",
    "married_to_citizen",
    "divorced",
    "widowed",
    "legally_separated",
  ]),
});
```

This ensures only valid marital status values can be submitted, preventing pricing errors.

## Key Architectural Decisions

### Why Zustand?
- Lightweight (< 1KB)
- No boilerplate compared to Redux
- Perfect for small to medium apps
- TypeScript-friendly

### Why React Hook Form?
- Minimal re-renders (better performance)
- Built-in validation with Zod
- Easy to watch individual fields (`watch()`)

### Why Separate Pricing Logic?
- **Single Source of Truth**: All pricing calculations in one file
- **Testable**: Pure functions, easy to unit test
- **Maintainable**: Change pricing in one place, affects entire app
- **Type-Safe**: TypeScript ensures correct types everywhere

### Why Real-Time Price Updates?
- **User Experience**: Instant feedback
- **Transparency**: User knows exactly what they'll pay
- **Trust**: No surprises at checkout

## Testing the Pricing Logic

You can test the pricing functions independently:

```typescript
import { calculateServiceFee, calculateTotalPrice } from '@/lib/pricing';

// Test cases
console.log(calculateServiceFee('single'));           // 299
console.log(calculateServiceFee('married'));          // 598
console.log(calculateServiceFee('married_to_citizen')); // 299

console.log(calculateTotalPrice('single'));   // 300
console.log(calculateTotalPrice('married'));  // 599
```

## Summary

The dynamic pricing system is built on three pillars:

1. **Pure Functions** (`pricing.ts`) - Calculate fees based on marital status
2. **Global State** (Zustand) - Store selected marital status across steps
3. **Reactive UI** (React Hook Form `watch()`) - Update pricing in real-time

This architecture ensures:
- ✅ Consistent pricing across all steps
- ✅ Real-time UI updates
- ✅ Type safety
- ✅ Easy maintenance
- ✅ Testability

