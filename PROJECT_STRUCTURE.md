# DRSI Law Registration Wizard - Complete Project Structure

## 📁 Project Organization

```
DRSI/
├── 📄 package.json                          # Dependencies and scripts
├── 📄 tsconfig.json                         # TypeScript configuration
├── 📄 tailwind.config.ts                    # Tailwind CSS configuration
├── 📄 postcss.config.mjs                    # PostCSS configuration
├── 📄 next.config.js                        # Next.js configuration
├── 📄 .gitignore                            # Git ignore rules
├── 📄 .env.local.example                    # Environment variables template
│
├── 📚 Documentation
│   ├── README.md                            # Main project documentation
│   ├── INSTALLATION.md                      # Installation guide
│   ├── DYNAMIC_PRICING_ARCHITECTURE.md      # Pricing system details
│   └── PROJECT_STRUCTURE.md                 # This file
│
└── src/
    ├── 📂 app/                              # Next.js App Router
    │   ├── 📄 layout.tsx                    # Root layout
    │   ├── 📄 page.tsx                      # Home page (wizard)
    │   ├── 📄 globals.css                   # Global styles
    │   │
    │   ├── 📂 api/                          # API Routes
    │   │   ├── 📂 checkout/
    │   │   │   └── route.ts                 # Stripe checkout session
    │   │   └── 📂 webhook/
    │   │       └── route.ts                 # Stripe webhook handler
    │   │
    │   └── 📂 success/
    │       └── page.tsx                     # Payment success page
    │
    ├── 📂 components/                       # React Components
    │   ├── RegistrationWizard.tsx           # Main wizard orchestrator
    │   │
    │   ├── 📂 steps/                        # Multi-step form components
    │   │   ├── Step1ContactInfo.tsx         # Contact information form
    │   │   ├── Step2MaritalStatus.tsx       # Marital status & pricing ⭐
    │   │   ├── Step3ContractSigning.tsx     # Contract & signature
    │   │   └── Step4Payment.tsx             # Summary & Stripe checkout
    │   │
    │   └── 📂 ui/                           # Shadcn UI components
    │       ├── button.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── select.tsx
    │       ├── checkbox.tsx
    │       ├── card.tsx
    │       └── badge.tsx
    │
    ├── 📂 lib/                              # Utilities & Logic
    │   ├── utils.ts                         # Helper functions
    │   ├── validation.ts                    # Zod validation schemas
    │   ├── pricing.ts                       # Pricing logic ⭐⭐⭐
    │   │
    │   ├── 📂 services/                     # Backend services
    │   │   ├── pdf-generator.ts             # Contract PDF generation
    │   │   ├── google-drive.ts              # Google Drive upload
    │   │   ├── monday.ts                    # Monday.com CRM integration
    │   │   └── email.ts                     # Email sending (Nodemailer)
    │   │
    │   └── 📂 types/
    │       └── stripe.d.ts                  # TypeScript definitions
    │
    └── 📂 stores/                           # State Management
        └── registrationStore.ts             # Zustand store ⭐⭐
```

## 🔑 Key Files Explained

### ⭐⭐⭐ Critical Files (MUST UNDERSTAND)

#### 1. `src/lib/pricing.ts`
**Purpose**: Core pricing logic for the entire application

**Key Functions**:
- `calculateServiceFee()` - Returns $299 or $598 based on marital status
- `calculateTotalPrice()` - Adds $1 government fee
- `isDoubleChanseBundle()` - Checks if "married" (for badge display)

**Used By**: Step 2, Step 3, Step 4, Checkout API

---

#### 2. `src/stores/registrationStore.ts`
**Purpose**: Global state management with Zustand

**State**:
- `currentStep` - Current wizard step (1-4)
- `contactInfo` - User contact details
- `maritalStatus` - Selected status (drives pricing)
- `signature` - Canvas signature data URL
- `agreedToTerms` - Contract agreement
- `paymentIntentId` - Stripe payment tracking

**Actions**: Set/update state, navigate steps, reset wizard

---

#### 3. `src/components/steps/Step2MaritalStatus.tsx`
**Purpose**: Dynamic pricing display

**Key Features**:
- Real-time price updates using `watch()`
- Conditional "Double Chance" badge
- Dropdown with 6 marital status options
- Visual pricing breakdown

---

### ⭐⭐ Important Files

#### 4. `src/app/api/checkout/route.ts`
**Purpose**: Create Stripe Checkout Session

**Flow**:
1. Receive form data (contact, marital status, signature, amount)
2. Create Stripe session with line items
3. Pass metadata for webhook processing
4. Return checkout URL
5. User is redirected to Stripe

---

#### 5. `src/app/api/webhook/route.ts`
**Purpose**: Post-payment automation

**Flow**:
1. Verify webhook signature
2. Extract session metadata
3. Generate PDF contract
4. Upload to Google Drive
5. Create Monday.com item
6. Send welcome email
7. Return success response

---

#### 6. `src/components/RegistrationWizard.tsx`
**Purpose**: Main wizard container

**Features**:
- Progress stepper UI
- Step routing based on `currentStep`
- Responsive design
- Header and footer

---

### ⭐ Supporting Files

#### 7. `src/lib/validation.ts`
**Purpose**: Zod schemas for form validation

**Schemas**:
- `contactInfoSchema` - Email, phone, name validation
- `maritalStatusSchema` - Enum validation
- `contractSigningSchema` - Signature + terms validation

---

#### 8. `src/lib/services/pdf-generator.ts`
**Purpose**: Generate contract PDF with jsPDF

**Inputs**: Contact info, marital status, signature, amount
**Output**: PDF buffer

---

#### 9. `src/lib/services/google-drive.ts`
**Purpose**: Upload files to Google Drive

**Authentication**: Service Account
**Returns**: Drive file link

---

#### 10. `src/lib/services/monday.ts`
**Purpose**: Create Monday.com board items

**Data**: Client info, amount, status, drive link

---

#### 11. `src/lib/services/email.ts`
**Purpose**: Send HTML welcome emails

**Uses**: Nodemailer with SMTP

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                            │
└─────────────────────────────────────────────────────────────────┘

Step 1: Contact Info
├── User enters: firstName, lastName, email, phone
├── Validated with Zod schema
└── Stored in Zustand → contactInfo

        ↓

Step 2: Marital Status & Pricing ⭐
├── User selects marital status from dropdown
├── watch() detects change instantly
├── calculateServiceFee() runs → $299 or $598
├── calculateTotalPrice() adds $1 → $300 or $599
├── UI updates in real-time
├── Badge shows if "married"
└── Stored in Zustand → maritalStatus

        ↓

Step 3: Contract Signing
├── Display agreement with actual price
├── User checks agreement box
├── User signs on canvas
├── Signature converted to data URL
└── Stored in Zustand → signature, agreedToTerms

        ↓

Step 4: Summary & Payment
├── Show pricing breakdown (service + gov fee)
├── User clicks "Pay"
├── POST to /api/checkout with all data
├── Create Stripe Checkout Session
├── Redirect to Stripe hosted page
└── User completes payment

        ↓

Stripe Webhook (checkout.session.completed)
├── Verify webhook signature
├── Extract metadata (contact, marital status, signature)
├── Generate PDF contract
├── Upload to Google Drive
├── Create Monday.com item
├── Send welcome email
└── Return 200 OK

        ↓

Success Page
├── Show success message
├── Display next steps
└── User receives email
```

## 🎯 Pricing Logic Flow

```
User Selects Marital Status
        ↓
┌──────────────────────────┐
│  MARITAL STATUS VALUE    │
└──────────────────────────┘
        ↓
┌──────────────────────────────────────────┐
│  calculateServiceFee(maritalStatus)      │
│                                          │
│  if "married" → return 598               │
│  else → return 299                       │
└──────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────┐
│  calculateTotalPrice(maritalStatus)      │
│                                          │
│  serviceFee + GOVERNMENT_FEE ($1)        │
└──────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────┐
│  UI UPDATES                              │
│  • Service Fee: $299 or $598             │
│  • Government Fee: $1.00                 │
│  • Total: $300 or $599                   │
│  • Badge: if married show "Double"       │
└──────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────┐
│  STORED IN ZUSTAND                       │
│  maritalStatus → used in later steps     │
└──────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────┐
│  USED IN:                                │
│  • Step 3: Contract (show price)         │
│  • Step 4: Payment (charge amount)       │
│  • Checkout API (create session)         │
│  • Webhook (generate PDF)                │
└──────────────────────────────────────────┘
```

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 | React framework with App Router |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **UI Components** | Shadcn UI (Radix) | Accessible components |
| **State Management** | Zustand | Global state |
| **Form Handling** | React Hook Form | Form state & validation |
| **Validation** | Zod | Schema validation |
| **Payment** | Stripe | Checkout & webhooks |
| **PDF** | jsPDF | Contract generation |
| **Storage** | Google Drive API | File uploads |
| **CRM** | Monday.com API | Client management |
| **Email** | Nodemailer | SMTP emails |

## 📦 Key Dependencies

```json
{
  "next": "^15.0.0",
  "react": "^18.3.0",
  "zustand": "^4.5.0",
  "react-hook-form": "^7.51.0",
  "zod": "^3.22.4",
  "stripe": "^14.21.0",
  "react-signature-canvas": "^1.0.6",
  "jspdf": "^2.5.1",
  "googleapis": "^131.0.0",
  "nodemailer": "^6.9.9",
  "@radix-ui/react-*": "Various",
  "lucide-react": "^0.344.0"
}
```

## 🎨 UI Component Hierarchy

```
RegistrationWizard
├── Progress Stepper (Steps 1-4)
└── Current Step Component
    │
    ├── Step1ContactInfo
    │   └── Card
    │       ├── Input fields (firstName, lastName, email, phone)
    │       └── Button (Continue)
    │
    ├── Step2MaritalStatus ⭐
    │   └── Card
    │       ├── Select (marital status dropdown)
    │       ├── Pricing Breakdown (dynamic)
    │       │   ├── Service Fee
    │       │   ├── Government Fee
    │       │   └── Total
    │       ├── Badge (if married - "Double Chance")
    │       └── Buttons (Back, Continue)
    │
    ├── Step3ContractSigning
    │   └── Card
    │       ├── Agreement Text (with price)
    │       ├── Checkbox (agree to terms)
    │       ├── SignatureCanvas
    │       └── Buttons (Back, Continue)
    │
    └── Step4Payment
        └── Card
            ├── Contact Summary
            ├── Pricing Breakdown
            ├── Signature Confirmation
            └── Buttons (Back, Pay $XXX)
```

## 🔐 Environment Variables Required

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Yes | Stripe frontend |
| `STRIPE_SECRET_KEY` | ✅ Yes | Stripe backend |
| `STRIPE_WEBHOOK_SECRET` | ✅ Yes | Verify webhooks |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Base URL |
| `GOOGLE_DRIVE_CLIENT_EMAIL` | ⚠️ Optional | Drive upload |
| `GOOGLE_DRIVE_PRIVATE_KEY` | ⚠️ Optional | Drive upload |
| `GOOGLE_DRIVE_FOLDER_ID` | ⚠️ Optional | Drive upload |
| `MONDAY_API_TOKEN` | ⚠️ Optional | CRM integration |
| `MONDAY_BOARD_ID` | ⚠️ Optional | CRM integration |
| `SMTP_HOST` | ⚠️ Optional | Email sending |
| `SMTP_USER` | ⚠️ Optional | Email sending |
| `SMTP_PASSWORD` | ⚠️ Optional | Email sending |

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint

# Set up Stripe webhook (development)
stripe listen --forward-to localhost:3000/api/webhook
```

## 📝 Common Customization Points

### 1. Change Pricing
Edit: `src/lib/pricing.ts` → `calculateServiceFee()`

### 2. Modify Contract Text
Edit: `src/components/steps/Step3ContractSigning.tsx` → `SERVICE_AGREEMENT`

### 3. Update Marital Status Options
Edit: `src/lib/pricing.ts` → `MARITAL_STATUS_OPTIONS`

### 4. Change Email Template
Edit: `src/lib/services/email.ts` → `sendWelcomeEmail()`

### 5. Customize UI Colors
Edit: `src/app/globals.css` → CSS variables

### 6. Add New Form Fields
Edit: 
- `src/lib/validation.ts` (add to schema)
- `src/stores/registrationStore.ts` (add to state)
- Component (add form field)

## 🎯 Testing Checklist

- [ ] Step 1: Enter valid contact info
- [ ] Step 2: Select each marital status, verify pricing
- [ ] Step 2: Verify "married" shows badge
- [ ] Step 3: Read contract, check agreement box
- [ ] Step 3: Sign on canvas, verify signature appears
- [ ] Step 4: Review summary, verify amounts
- [ ] Step 4: Click Pay, redirect to Stripe
- [ ] Use test card: 4242 4242 4242 4242
- [ ] Complete payment
- [ ] Verify redirect to success page
- [ ] Check webhook logs for PDF/Drive/Monday/Email
- [ ] Check email inbox for welcome message

## 📚 Further Reading

- See `README.md` for project overview
- See `INSTALLATION.md` for setup instructions
- See `DYNAMIC_PRICING_ARCHITECTURE.md` for pricing deep-dive

---

**Built with ❤️ using Next.js 15 + TypeScript + Tailwind CSS**

