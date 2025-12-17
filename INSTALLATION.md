# Installation Guide - DRSI Law Registration Wizard

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Stripe account (for payment processing)
- (Optional) Google Cloud account (for Drive integration)
- (Optional) Monday.com account (for CRM integration)
- (Optional) SMTP server access (for emails)

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages:
- Next.js 15
- React 18
- Zustand (state management)
- React Hook Form + Zod (form validation)
- Stripe SDK
- Shadcn UI components
- And more...

## Step 2: Set Up Environment Variables

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and fill in your credentials:

### Required: Stripe Configuration

Sign up at https://stripe.com if you don't have an account.

```env
# Get these from https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Leave this empty for now, we'll set it up in Step 4
STRIPE_WEBHOOK_SECRET=
```

### Required: Base URL

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional: Google Drive Integration

If you want to store contracts in Google Drive:

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Google Drive API
4. Create a Service Account
5. Download the JSON key file
6. Extract credentials:

```env
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
```

**Note**: Make sure to share the Drive folder with the service account email!

### Optional: Monday.com CRM Integration

If you want to push data to Monday.com:

1. Go to https://monday.com/developers
2. Generate an API token
3. Find your board ID (in the board URL)

```env
MONDAY_API_TOKEN=your-monday-api-token
MONDAY_BOARD_ID=your-board-id
```

### Optional: Email Configuration

To send welcome emails via SMTP:

```env
# For Gmail:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Not your regular password!
FROM_EMAIL=noreply@drsilaw.com
FROM_NAME=DRSI Law
```

**Gmail Users**: You need to generate an "App Password":
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate a new app password
5. Use that password (not your regular Gmail password)

## Step 3: Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

You should see the registration wizard!

## Step 4: Set Up Stripe Webhooks (Required for Post-Payment Automation)

### Local Development

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli#install

2. Login to Stripe CLI:
```bash
stripe login
```

3. Forward webhook events to your local server:
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

4. Copy the webhook signing secret that appears (starts with `whsec_`)

5. Add it to your `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

6. Restart your development server

### Production Deployment

1. Deploy your application (see Deployment section below)

2. In Stripe Dashboard (https://dashboard.stripe.com/webhooks):
   - Click "Add endpoint"
   - Enter your webhook URL: `https://your-domain.com/api/webhook`
   - Select event: `checkout.session.completed`
   - Copy the signing secret
   - Add it to your production environment variables

## Step 5: Test the Application

1. Go to http://localhost:3000
2. Fill out Step 1 (Contact Info)
3. Select a marital status in Step 2 - watch the price update!
4. Sign the contract in Step 3
5. In Step 4, use Stripe test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

6. Complete payment
7. You should be redirected to the success page
8. Check your terminal/console for webhook processing logs

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Go to https://vercel.com

3. Click "New Project"

4. Import your GitHub repository

5. Configure environment variables in Vercel:
   - Go to Settings → Environment Variables
   - Add all variables from your `.env.local`
   - Make sure to use production values (not test keys)

6. Deploy!

7. Set up production webhook (see Step 4 above)

### Deploy to Other Platforms

The app can be deployed to any Node.js hosting platform:
- Railway
- Render
- AWS (Amplify, ECS, etc.)
- Google Cloud Run
- DigitalOcean App Platform

Just make sure to:
1. Set all environment variables
2. Run `npm run build`
3. Run `npm start`
4. Configure webhook endpoint

## Troubleshooting

### Issue: Pricing not updating

**Solution**: Make sure the form is properly watching the marital status field. Check browser console for errors.

### Issue: Stripe checkout not working

**Solution**: 
1. Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set correctly
2. Make sure the key starts with `pk_test_` (test mode) or `pk_live_` (production)
3. Check browser console and server logs for errors

### Issue: Webhook not receiving events

**Solution**:
1. Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhook`
2. Check that `STRIPE_WEBHOOK_SECRET` is set in `.env.local`
3. Restart your development server after adding the webhook secret
4. Check the Stripe CLI output for any errors

### Issue: PDF not generating

**Solution**: The PDF generation happens in the webhook. Check your server logs for errors. Make sure jsPDF is installed.

### Issue: Google Drive upload failing

**Solution**:
1. Verify service account credentials are correct
2. Make sure the Drive folder is shared with the service account email
3. Check that Google Drive API is enabled in your GCP project

### Issue: Monday.com not creating items

**Solution**:
1. Verify your API token is correct
2. Check that the board ID is correct
3. Make sure the board has the expected columns

### Issue: Email not sending

**Solution**:
1. For Gmail, make sure you're using an App Password (not your regular password)
2. Check SMTP settings are correct
3. Verify port 587 is not blocked by firewall
4. Check server logs for detailed error messages

## Development Tips

### Hot Reloading

The dev server supports hot reloading. Changes to files will automatically refresh the page.

### Clear State

If you need to reset the wizard state, open browser DevTools → Application → Local Storage → Clear All

### Test Different Pricing

Try selecting different marital statuses in Step 2 to see the dynamic pricing in action.

### Inspect Zustand State

Install the Zustand DevTools extension for Chrome/Firefox to inspect the application state in real-time.

## Next Steps

1. Customize the styling to match your brand
2. Update the service agreement text
3. Configure your production environment
4. Set up monitoring and error tracking (e.g., Sentry)
5. Add analytics (e.g., Google Analytics, Mixpanel)

## Support

If you encounter any issues:
1. Check this guide again
2. Search for error messages in the codebase
3. Check the browser console and server logs
4. Consult the README.md for more information

## Security Notes

- Never commit `.env.local` to version control
- Use test keys during development
- Rotate API keys periodically
- Use webhook signatures to verify Stripe events
- Validate all user input (already implemented with Zod)

