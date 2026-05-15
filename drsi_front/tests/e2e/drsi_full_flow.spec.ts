/**
 * DRSI Full E2E Flow — Client Login → Form Fill → Submit → Admin Approve
 *
 * Prerequisites:
 *   1. Frontend dev server running:  npm run dev  (port 5173)
 *   2. Backend running via MAMP:     http://drsi-backend.local
 *   3. Laravel log accessible at:    ../drsi_backend/storage/logs/laravel.log
 *
 * Run with:
 *   npx playwright test tests/e2e/drsi_full_flow.spec.ts --headed
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ─── Configuration ───────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_URL = 'http://localhost:5173';
const ADMIN_URL = 'http://drsi-backend.local/admin';
const LARAVEL_LOG = path.resolve(__dirname, '../../../drsi_backend/storage/logs/laravel.log');
const DUMMY_PDF = path.resolve(__dirname, '../fixtures/dummy-document.pdf');

const TEST_EMAIL = `test-client-${Date.now()}@example.com`;
const ADMIN_EMAIL = 'meir@drsi.com';
const ADMIN_PASSWORD = 'admin123';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract the most recent OTP code for a given email from Laravel's log file.
 * Log format: "[timestamp] local.INFO: OTP for <email>: <6-digit-code>"
 */
function extractOtpFromLog(email: string): string {
  const content = fs.readFileSync(LARAVEL_LOG, 'utf-8');
  const lines = content.split('\n').reverse();

  for (const line of lines) {
    if (line.includes(`OTP for ${email}:`)) {
      const match = line.match(/OTP for .+?: (\d{6})/);
      if (match) return match[1];
    }
  }
  throw new Error(`OTP not found in log for ${email}`);
}

/** Wait for the page to settle after navigation/transitions */
async function settle(page: Page, ms = 600) {
  await page.waitForTimeout(ms);
}

/** Fill a date input with MM/DD/YYYY format */
async function fillDate(page: Page, selector: string, value: string) {
  const input = page.locator(selector);
  await input.click();
  await input.fill(value);
}

/** Click the Continue button and wait for next step to load */
async function clickContinue(page: Page) {
  const btn = page.getByRole('button', { name: /continue/i });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await settle(page, 1200);
}

/** Click the Back button */
async function clickBack(page: Page) {
  const btn = page.getByRole('button', { name: /back/i });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await settle(page);
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

test.describe('DRSI Full Application Flow', () => {
  test.describe.configure({ mode: 'serial' });

  let clientPage: Page;

  // ── Phase 1: Client Authentication via OTP ────────────────────────────────

  test('Phase 1 — Client logs in via OTP', async ({ browser }) => {
    // Accept self-signed certificates (MAMP HTTPS)
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    clientPage = await context.newPage();

    // Navigate to the frontend — login page appears first
    await clientPage.goto(FRONTEND_URL);
    await expect(clientPage.getByText('Welcome')).toBeVisible({ timeout: 15_000 });

    // Enter email
    const emailInput = clientPage.getByPlaceholder('you@example.com');
    await expect(emailInput).toBeVisible();
    await emailInput.fill(TEST_EMAIL);

    // Click "Send Verification Code"
    await clientPage.getByRole('button', { name: /send verification code/i }).click();

    // Wait for the OTP input screen to appear (button text changes or OTP field shows)
    await expect(clientPage.getByPlaceholder('000000')).toBeVisible({ timeout: 20_000 });

    // Extra settle to ensure the log file is written
    await clientPage.waitForTimeout(1000);

    // Extract OTP from Laravel log
    const otp = extractOtpFromLog(TEST_EMAIL);
    console.log(`  ✓ Extracted OTP: ${otp}`);

    // Enter OTP
    const otpInput = clientPage.getByPlaceholder('000000');
    await otpInput.fill(otp);

    // Click "Verify & Continue"
    await clientPage.getByRole('button', { name: /verify/i }).click();

    // Should now see Step 0 intro or the form
    await expect(clientPage.getByText(/what is your full name/i)).toBeVisible({ timeout: 20_000 });
    console.log(`  ✓ Client logged in successfully as ${TEST_EMAIL}`);
  });

  // ── Phase 2: Fill the Multi-Step Form ─────────────────────────────────────

  test('Phase 2a — Step 0: Intro / Case Type', async () => {
    // Q1: Enter petitioner name
    const nameInput = clientPage.getByPlaceholder('Enter your full name');
    await nameInput.fill('John Michael Smith');
    await settle(clientPage);

    // Q2: Select "American Citizen"
    await clientPage.getByRole('button', { name: /american citizen/i }).click();
    await settle(clientPage);

    // Q3: Select "My Spouse"
    await clientPage.getByText('My Spouse').click();
    await settle(clientPage);

    // Q4: Enter beneficiary name (placeholder includes "spouse's")
    const beneficiaryInput = clientPage.getByPlaceholder(/enter your spouse/i);
    await beneficiaryInput.fill('Maria Garcia Lopez');
    await settle(clientPage);

    // Click "Start Application"
    await clientPage.getByRole('button', { name: /start application/i }).click();
    await settle(clientPage, 1500);

    // Verify Step 1 loaded (stepper shows "Basic Info" in multiple places)
    await expect(clientPage.getByText('Step 1 of 8 — Basic', { exact: false })).toBeVisible({ timeout: 10_000 });
    console.log('  ✓ Step 0 complete');
  });

  test('Phase 2b — Step 1: Basic Information', async () => {
    // ── Petitioner section ──
    // fullName + relationship are pre-filled from Step 0

    // Phone — PhoneInput uses placeholder "Phone number"
    const phoneInputs = clientPage.getByPlaceholder('Phone number');
    await phoneInputs.first().fill('2025551234');

    // Email
    const emailInputs = clientPage.locator('input[type="email"]');
    await emailInputs.first().fill('john.smith@email.com');

    // Date of Birth
    const dobInputs = clientPage.locator('input[placeholder="MM/DD/YYYY"]');
    await dobInputs.first().fill('03/15/1985');

    // City of Birth & Country of Birth — use fillByNearbyLabel
    await fillByNearbyLabel(clientPage, 'City of Birth', 'New York', 0);
    await fillByNearbyLabel(clientPage, 'Country of Birth', 'United States', 0);

    // ── Beneficiary section ──
    await clientPage.getByRole('heading', { name: 'Your Applicant Family Member' }).scrollIntoViewIfNeeded();
    await settle(clientPage);

    // Beneficiary Phone
    await phoneInputs.nth(1).fill('5551234567');

    // Beneficiary Email
    await emailInputs.nth(1).fill('maria.garcia@email.com');

    // Beneficiary DOB
    await dobInputs.nth(1).fill('07/22/1990');

    // Beneficiary City/Country of Birth
    await fillByNearbyLabel(clientPage, 'City of Birth', 'Mexico City', 1);
    await fillByNearbyLabel(clientPage, 'Country of Birth', 'Mexico', 1);

    await clickContinue(clientPage);
    await expect(clientPage.getByText('Step 2 of 8 — Address', { exact: false })).toBeVisible({ timeout: 10_000 });
    console.log('  ✓ Step 1 complete');
  });

  test('Phase 2c — Step 2: Address History', async () => {
    // Helper: fill input inside a data-field-id container
    const fill = async (fieldId: string, value: string) => {
      const container = clientPage.locator(`[data-field-id="${fieldId}"]`);
      const input = container.locator('input').first();
      await input.scrollIntoViewIfNeeded();
      await input.fill(value);
    };

    // ── Petitioner Current Address ──
    await fill('petitioner.currentAddress.street', '123 Main Street');
    await fill('petitioner.currentAddress.city', 'New York');
    await fill('petitioner.currentAddress.zip', '10001');
    await fill('petitioner.currentAddress.stateOrCountry', 'New York');
    await fill('petitioner.currentAddress.startDate', '01/15/2020');

    // ── Beneficiary Current Address ──
    await fill('beneficiary.currentAddress.street', '456 Reforma Avenue');
    await fill('beneficiary.currentAddress.city', 'Mexico City');
    await fill('beneficiary.currentAddress.zip', '06600');
    await fill('beneficiary.currentAddress.stateOrCountry', 'Mexico');
    await fill('beneficiary.currentAddress.startDate', '06/01/2018');

    // ── Future US Address ──
    await fill('futureUSAddress.nameOfPersonLiving', 'John Michael Smith');
    await fill('futureUSAddress.address', '123 Main Street');
    await fill('futureUSAddress.city', 'New York');
    await fill('futureUSAddress.state', 'NY');
    await fill('futureUSAddress.zipCode', '10001');

    // Future address phone — PhoneInput component, target placeholder
    const futurePhoneContainer = clientPage.locator('[data-field-id="futureUSAddress.phoneNumber"]');
    await futurePhoneContainer.scrollIntoViewIfNeeded();
    const futurePhoneInput = futurePhoneContainer.getByPlaceholder('Phone number');
    await futurePhoneInput.fill('2025551234');

    // Toggle "Is Green Card Delivery Address" to Yes (avoids needing contact info)
    const deliverySwitch = clientPage.locator('[data-field-id="futureUSAddress.isGreenCardDeliveryAddress"] button[role="switch"]');
    if (await deliverySwitch.count() > 0) {
      const checked = await deliverySwitch.getAttribute('aria-checked');
      if (checked !== 'true') {
        await deliverySwitch.click();
        await settle(clientPage);
      }
    }

    await clickContinue(clientPage);
    await expect(clientPage.getByText('Step 3 of 8 — Marital', { exact: false })).toBeVisible({ timeout: 15_000 });
    console.log('  ✓ Step 2 complete');
  });

  test('Phase 2d — Step 3: Marital Status', async () => {
    const fill = async (fieldId: string, value: string) => {
      const container = clientPage.locator(`[data-field-id="${fieldId}"]`);
      const input = container.locator('input').first();
      await input.scrollIntoViewIfNeeded();
      await input.fill(value);
    };

    // Petitioner: times married = 1
    const timesMarriedInputs = clientPage.locator('input[type="number"]');
    await timesMarriedInputs.first().fill('1');
    await settle(clientPage, 800);

    // Petitioner Current Marriage
    await fill('petitioner.maritalStatus.currentMarriage.date', '06/15/2022');
    await fill('petitioner.maritalStatus.currentMarriage.spouseName', 'Maria Garcia Lopez');
    await fill('petitioner.maritalStatus.currentMarriage.city', 'New York');
    await fill('petitioner.maritalStatus.currentMarriage.country', 'United States');

    // ── Beneficiary ──
    await clientPage.getByText('Maria Garcia Lopez — Marital Status').scrollIntoViewIfNeeded();
    await settle(clientPage);

    // Beneficiary: times married = 1
    await timesMarriedInputs.nth(1).fill('1');
    await settle(clientPage, 800);

    // Beneficiary Current Marriage
    await fill('beneficiary.maritalStatus.currentMarriage.date', '06/15/2022');
    await fill('beneficiary.maritalStatus.currentMarriage.spouseName', 'John Michael Smith');
    await fill('beneficiary.maritalStatus.currentMarriage.city', 'New York');
    await fill('beneficiary.maritalStatus.currentMarriage.country', 'United States');

    await clickContinue(clientPage);
    await expect(clientPage.getByText('Step 4 of 8 — Family', { exact: false })).toBeVisible({ timeout: 15_000 });
    console.log('  ✓ Step 3 complete');
  });

  test('Phase 2e — Step 4: Family', async () => {
    const fill = async (fieldId: string, value: string) => {
      const container = clientPage.locator(`[data-field-id="${fieldId}"]`);
      const input = container.locator('input, textarea').first();
      await input.scrollIntoViewIfNeeded();
      await input.fill(value);
    };

    const clickRadio = async (prefix: string, value: 'yes' | 'no') => {
      const radio = clientPage.locator(`#${prefix.replace(/\./g, '\\.')}-living-${value}`);
      await radio.scrollIntoViewIfNeeded();
      await radio.click();
      await settle(clientPage, 500);
    };

    // ── Petitioner Father ──
    await fill('petitioner.father.surnames', 'Smith');
    await fill('petitioner.father.givenNames', 'Robert James');
    await fill('petitioner.father.dateOfBirth', '05/20/1955');
    await fill('petitioner.father.cityOfBirth', 'Chicago');
    await fill('petitioner.father.countryOfBirth', 'United States');
    await clickRadio('petitioner.father', 'yes');
    await fill('petitioner.father.currentCity', 'Chicago');
    await fill('petitioner.father.currentCountry', 'United States');

    // ── Petitioner Mother ──
    await fill('petitioner.mother.surnames', 'Johnson');
    await fill('petitioner.mother.givenNames', 'Patricia Ann');
    await fill('petitioner.mother.dateOfBirth', '08/12/1958');
    await fill('petitioner.mother.cityOfBirth', 'Boston');
    await fill('petitioner.mother.countryOfBirth', 'United States');
    await clickRadio('petitioner.mother', 'yes');
    await fill('petitioner.mother.currentCity', 'Boston');
    await fill('petitioner.mother.currentCountry', 'United States');

    // ── Beneficiary Father ──
    await fill('beneficiary.father.surnames', 'Garcia');
    await fill('beneficiary.father.givenNames', 'Carlos Eduardo');
    await fill('beneficiary.father.dateOfBirth', '03/10/1960');
    await fill('beneficiary.father.cityOfBirth', 'Guadalajara');
    await fill('beneficiary.father.countryOfBirth', 'Mexico');
    await clickRadio('beneficiary.father', 'yes');
    await fill('beneficiary.father.fullCurrentAddress', 'Av. Reforma 456, Guadalajara, Jalisco, Mexico, 44100');

    // ── Beneficiary Mother ──
    await fill('beneficiary.mother.surnames', 'Lopez');
    await fill('beneficiary.mother.givenNames', 'Rosa Maria');
    await fill('beneficiary.mother.dateOfBirth', '11/25/1963');
    await fill('beneficiary.mother.cityOfBirth', 'Mexico City');
    await fill('beneficiary.mother.countryOfBirth', 'Mexico');
    await clickRadio('beneficiary.mother', 'yes');
    await fill('beneficiary.mother.fullCurrentAddress', 'Calle 5 de Mayo 789, Mexico City, CDMX, Mexico, 06000');

    // ── Children: set counts to 0 ──
    const numInputs = clientPage.locator('input[type="number"]');
    for (let i = 0; i < await numInputs.count(); i++) {
      const el = numInputs.nth(i);
      await el.scrollIntoViewIfNeeded();
      await el.fill('0');
    }

    await clickContinue(clientPage);
    await expect(clientPage.getByText('Step 5 of 8 — Employment', { exact: false })).toBeVisible({ timeout: 15_000 });
    console.log('  ✓ Step 4 complete');
  });

  test('Phase 2f — Step 5: Employment History', async () => {
    const fill = async (fieldId: string, value: string) => {
      const container = clientPage.locator(`[data-field-id="${fieldId}"]`);
      const input = container.locator('input, textarea').first();
      await input.scrollIntoViewIfNeeded();
      await input.fill(value);
    };

    // ── Petitioner: Employed ──
    await clientPage.locator('label[for="petitioner-status-employed"]').click();
    await settle(clientPage);

    // Add first employment entry
    const addButtons = clientPage.getByText('Add Employment History');
    await addButtons.first().click();
    await settle(clientPage);

    // Petitioner employment entry (index 0)
    await fill('petitioner.employments.0.position', 'Software Engineer');
    await fill('petitioner.employments.0.employerName', 'Tech Corp Inc.');
    await fill('petitioner.employments.0.employerAddress', '100 Tech Blvd, San Jose, CA 95110');
    await fill('petitioner.employments.0.fromDate', '03/01/2020');

    // ── Beneficiary: Employed ──
    await clientPage.getByText('Employment History (Maria Garcia Lopez)').scrollIntoViewIfNeeded();
    await settle(clientPage);

    await clientPage.locator('label[for="beneficiary-status-employed"]').click();
    await settle(clientPage);

    // Add first beneficiary employment entry
    await addButtons.nth(1).click();
    await settle(clientPage);

    await fill('beneficiary.employments.0.position', 'Marketing Manager');
    await fill('beneficiary.employments.0.employerName', 'Global Marketing SA');
    await fill('beneficiary.employments.0.employerAddress', 'Paseo de la Reforma 222, Mexico City');
    await fill('beneficiary.employments.0.fromDate', '01/15/2019');

    // Education: No
    const eduNoLabel = clientPage.locator('label[for="edu-attended-no"]');
    await eduNoLabel.scrollIntoViewIfNeeded();
    await eduNoLabel.click();

    await clickContinue(clientPage);
    await expect(clientPage.getByText('Step 6 of 8 — Other', { exact: false })).toBeVisible({ timeout: 15_000 });
    console.log('  ✓ Step 5 complete');
  });

  test('Phase 2g — Step 6: Other Information', async () => {
    // ── Petitioner Nationalities ──
    await fillByNearbyLabel(clientPage, 'Nationality', 'American', 0);

    // ── Beneficiary Nationalities ──
    await clientPage.getByText('Other Information (Maria Garcia Lopez)').scrollIntoViewIfNeeded();
    await settle(clientPage);
    await fillByNearbyLabel(clientPage, 'Nationality', 'Mexican', 1);

    await clickContinue(clientPage);
    await expect(clientPage.getByText('Step 7 of 8 — Security', { exact: false })).toBeVisible({ timeout: 15_000 });
    console.log('  ✓ Step 6 complete');
  });

  test('Phase 2h — Step 7: Security & Background', async () => {
    // Answer all security questions with "No"
    // Question index 1 (vaccination) answer "Yes" to avoid required explanation

    const noButtons = clientPage.locator('label:has-text("No"), [data-value="no"]');
    const yesButtons = clientPage.locator('label:has-text("Yes"), [data-value="yes"]');

    // Strategy: Find all radio groups and answer them
    // The form has Yes/No radio pairs for each question
    // Question index 1 (vaccination) should be "Yes"

    // Try answering via radio buttons systematically
    const radioGroups = clientPage.locator('[role="radiogroup"]');
    const groupCount = await radioGroups.count();

    if (groupCount > 0) {
      // Use radiogroup approach
      for (let i = 0; i < groupCount; i++) {
        const group = radioGroups.nth(i);
        if (i === 1) {
          // Vaccination question — answer "Yes"
          await group.getByLabel(/yes/i).click();
        } else {
          // All others — answer "No"
          await group.getByLabel(/no/i).click();
        }
        // Scroll the next one into view periodically
        if (i % 10 === 9 && i + 1 < groupCount) {
          await radioGroups.nth(i + 1).scrollIntoViewIfNeeded();
        }
      }
    } else {
      // Fallback: find all Yes/No button pairs
      // Each question has a Yes and No button/label
      const allNo = clientPage.locator('button:has-text("No"), label:has-text("No")');
      const allYes = clientPage.locator('button:has-text("Yes"), label:has-text("Yes")');

      const totalQuestions = Math.min(await allNo.count(), 56); // 56 security questions
      for (let i = 0; i < totalQuestions; i++) {
        if (i === 1) {
          await allYes.nth(i).click();
        } else {
          await allNo.nth(i).click();
        }
        if (i % 15 === 14) {
          await settle(clientPage, 300);
        }
      }
    }

    await settle(clientPage, 500);
    await clickContinue(clientPage);
    await expect(clientPage.getByText('Step 8 of 8 — Documents', { exact: false })).toBeVisible({ timeout: 10_000 });
    console.log('  ✓ Step 7 complete');
  });

  test('Phase 2i — Step 8: Document Upload & Submit', async () => {
    // Upload a dummy PDF to the first required document
    // Find file input (dropzone creates a hidden input)
    const fileInputs = clientPage.locator('input[type="file"]');
    const inputCount = await fileInputs.count();
    console.log(`  Found ${inputCount} file inputs`);

    // Upload dummy PDF to first few required documents
    const uploadsNeeded = Math.min(inputCount, 4); // Upload to first 4 at minimum
    for (let i = 0; i < uploadsNeeded; i++) {
      await fileInputs.nth(i).setInputFiles(DUMMY_PDF);
      await settle(clientPage, 1500); // Wait for upload to complete
    }

    // Click "Submit Application"
    const submitBtn = clientPage.getByRole('button', { name: /submit application/i });
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    // Wait for the lock screen to appear (exact heading text after submission)
    await expect(clientPage.getByRole('heading', { name: 'Application Submitted' })).toBeVisible({ timeout: 30_000 });
    console.log('  ✓ Step 8 complete — Application submitted');
  });

  // ── Phase 3: Admin Approval in Filament ───────────────────────────────────

  test('Phase 3a — Admin logs into Filament', async ({ browser }) => {
    const adminContext = await browser.newContext({ ignoreHTTPSErrors: true });
    const adminPage = await adminContext.newPage();

    // Navigate to admin panel
    await adminPage.goto(ADMIN_URL + '/login');
    await expect(adminPage.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 15_000 });

    // Fill admin credentials
    await adminPage.locator('input[type="email"], input[name="email"]').fill(ADMIN_EMAIL);
    await adminPage.locator('input[type="password"], input[name="password"]').fill(ADMIN_PASSWORD);

    // Click Sign In
    await adminPage.getByRole('button', { name: /sign in|log in/i }).click();
    await settle(adminPage, 2000);

    // Should see the admin dashboard
    await expect(adminPage.getByText(/application|dashboard/i).first()).toBeVisible({ timeout: 15_000 });
    console.log('  ✓ Admin logged in');

    // Navigate to Applications
    await adminPage.goto(ADMIN_URL + '/applications');
    await settle(adminPage, 2000);

    // Find the test application by email
    await expect(adminPage.getByText(TEST_EMAIL).first()).toBeVisible({ timeout: 15_000 });
    console.log(`  ✓ Found application for ${TEST_EMAIL}`);

    // Click View on the row
    const row = adminPage.locator('tr', { hasText: TEST_EMAIL });
    const viewButton = row.getByRole('link', { name: /view/i }).or(row.locator('a[href*="applications/"]'));
    await viewButton.first().click();
    await settle(adminPage, 2000);

    // Should see application detail page
    await expect(adminPage.getByText(/application status|stage 1 submitted/i).first()).toBeVisible({ timeout: 15_000 });

    // Click "Mark as Pending I-130"
    const pendingBtn = adminPage.getByRole('button', { name: /pending i-130/i });
    await expect(pendingBtn).toBeVisible({ timeout: 10_000 });
    await pendingBtn.click();

    // Wait for and click Confirm in the modal
    const confirmBtn = adminPage.getByRole('button', { name: 'Confirm' });
    await expect(confirmBtn).toBeVisible({ timeout: 5_000 });
    await confirmBtn.click();

    // Wait for Filament notification confirming the action
    await adminPage.waitForTimeout(2000);
    console.log('  ✓ Marked as Pending I-130');

    // Reload to get fresh header actions for the new status
    await adminPage.reload({ waitUntil: 'networkidle' });
    await settle(adminPage, 1500);

    // Click "Unlock Stage 2"
    const unlockBtn = adminPage.getByRole('button', { name: /unlock stage 2/i });
    await expect(unlockBtn).toBeVisible({ timeout: 15_000 });
    await unlockBtn.click();

    // Wait for and click "Yes, unlock Stage 2" in the modal
    const confirmBtn2 = adminPage.getByRole('button', { name: /yes.*unlock/i });
    await expect(confirmBtn2).toBeVisible({ timeout: 5_000 });
    await confirmBtn2.click();

    // Wait for Filament to process
    await adminPage.waitForTimeout(2000);

    // Reload and verify status changed
    await adminPage.reload({ waitUntil: 'networkidle' });
    await expect(adminPage.getByText(/stage 2 unlocked/i).first()).toBeVisible({ timeout: 15_000 });
    console.log('  ✓ Stage 2 Unlocked — Admin approval complete');

    await adminPage.close();
    await adminContext.close();
  });
});

// ─── Utility: Fill input by nearby label text ────────────────────────────────

/**
 * Find the Nth label matching `labelText` and fill the associated input.
 * Works with common patterns: label > input, label + input, label ~ input.
 */
async function fillByNearbyLabel(page: Page, labelText: string, value: string, nthMatch = 0) {
  const labels = page.locator(`label:has-text("${labelText}")`);
  const count = await labels.count();
  if (count <= nthMatch) {
    // Fallback: try data-field-id containing a similar key
    const kebab = labelText.toLowerCase().replace(/\s+/g, '');
    const fallback = page.locator(`[data-field-id*="${kebab}"] input`);
    if (await fallback.count() > nthMatch) {
      await fallback.nth(nthMatch).fill(value);
      return;
    }
    console.warn(`  ⚠ Label "${labelText}" nth(${nthMatch}) not found (only ${count} matches)`);
    return;
  }

  const label = labels.nth(nthMatch);
  // Try: label wrapping input
  const wrappedInput = label.locator('input, textarea, select');
  if (await wrappedInput.count() > 0) {
    await wrappedInput.first().fill(value);
    return;
  }

  // Try: sibling input (label followed by input)
  const parent = label.locator('..');
  const siblingInput = parent.locator('input, textarea, select');
  if (await siblingInput.count() > 0) {
    await siblingInput.first().fill(value);
    return;
  }

  // Try: for attribute
  const forAttr = await label.getAttribute('for');
  if (forAttr) {
    const target = page.locator(`#${forAttr}`);
    if (await target.count() > 0) {
      await target.fill(value);
      return;
    }
  }

  console.warn(`  ⚠ Could not find input for label "${labelText}" nth(${nthMatch})`);
}
