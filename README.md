# DRSI Law - Multi-Step Registration Wizard

A Next.js 15 application for immigration lottery registration with dynamic pricing, contract signing, and payment processing.

## Features

- ✅ Multi-step wizard with progress tracking
- ✅ Dynamic pricing based on marital status
- ✅ Form validation with Zod
- ✅ Canvas signature capture
- ✅ Stripe payment integration
- ✅ Automated PDF contract generation
- ✅ Google Drive integration
- ✅ Monday.com CRM integration
- ✅ Automated welcome emails

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (Radix UI)
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Payment**: Stripe
- **PDF Generation**: jsPDF
- **Email**: Nodemailer

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Drive
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# Monday.com
MONDAY_API_TOKEN=your-monday-api-token
MONDAY_BOARD_ID=your-board-id

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@drsilaw.com
FROM_NAME=DRSI Law

# Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Configure Stripe Webhooks

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local endpoint:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
4. Copy the webhook signing secret to your `.env.local`

## Pricing Logic

The application implements the following pricing structure:

- **Single**: $299
- **Married**: $598 (Double Application bundle)
- **Married to US Citizen/Legal Resident**: $299
- **Divorced**: $299
- **Widowed**: $299
- **Legally Separated**: $299

All prices include a $1.00 government fee.

## Workflow

### Step 1: Contact Information
- Collects: First Name, Last Name, Email, Phone
- Validates email format and phone number

### Step 2: Marital Status & Pricing
- User selects marital status
- Dynamic pricing updates automatically
- Shows "Double Chance Registration" badge for married couples

### Step 3: Contract Signing
- Displays service agreement with personalized pricing
- Requires checkbox agreement
- Canvas signature capture

### Step 4: Summary & Payment
- Shows complete breakdown of charges
- Stripe Checkout integration
- Secure payment processing

## Post-Payment Automation

After successful payment (via Stripe webhook):

1. **PDF Generation**: Creates contract with signature and pricing
2. **Google Drive**: Uploads PDF to designated folder
3. **Monday.com**: Creates new item with client details and "Paid" status
4. **Email**: Sends welcome email with registration form link

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/route.ts      # Stripe checkout session
│   │   └── webhook/route.ts       # Stripe webhook handler
│   ├── success/page.tsx            # Payment success page
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── steps/
│   │   ├── Step1ContactInfo.tsx
│   │   ├── Step2MaritalStatus.tsx
│   │   ├── Step3ContractSigning.tsx
│   │   └── Step4Payment.tsx
│   ├── ui/                         # Shadcn UI components
│   └── RegistrationWizard.tsx
├── lib/
│   ├── services/
│   │   ├── pdf-generator.ts
│   │   ├── google-drive.ts
│   │   ├── monday.ts
│   │   └── email.ts
│   ├── pricing.ts                  # Pricing logic
│   ├── validation.ts               # Zod schemas
│   └── utils.ts
└── stores/
    └── registrationStore.ts        # Zustand store
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Configure Production Webhook

1. In Stripe Dashboard, add webhook endpoint:
   ```
   https://your-domain.com/api/webhook
   ```
2. Select event: `checkout.session.completed`
3. Copy webhook signing secret to production environment variables

## Development Notes

- The application uses Next.js App Router (not Pages Router)
- All API routes use the new Route Handlers (`route.ts`)
- State management is handled by Zustand (lightweight alternative to Redux)
- Form validation uses Zod schemas with React Hook Form
- UI components are from Shadcn UI (Radix UI + Tailwind CSS)

## Support

For issues or questions, contact: support@drsilaw.com

## License

Proprietary - © 2024 DRSI Law

