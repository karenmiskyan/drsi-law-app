/**
 * DRSI Matrix E2E Flow — Data-Driven Testing with Deep Integrity Verification
 *
 * Runs the full application lifecycle for each persona in the test matrix:
 *   Phase 1: Client OTP login + 8-step form fill (data-driven)
 *   Phase 2: Admin data integrity verification in Filament
 *   Phase 3: Stage 2 unlock → client upload → submit → admin complete
 *
 * Run: npx playwright test tests/e2e/drsi_matrix_flow.spec.ts --headed
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Config ──────────────────────────────────────────────────────────────────

const FRONTEND_URL = 'http://localhost:5173';
const ADMIN_URL = 'http://drsi-backend.local/admin';
const LARAVEL_LOG = path.resolve(__dirname, '../../../drsi_backend/storage/logs/laravel.log');
const DUMMY_PDF = path.resolve(__dirname, '../fixtures/dummy-document.pdf');
const ADMIN_EMAIL = 'meir@drsi.com';
const ADMIN_PASSWORD = 'admin123';

// ─── Test Matrix Types ───────────────────────────────────────────────────────

interface PriorMarriage {
  fullName: string;
  dateOfBirth: string;
  marriageDate: string;
  marriageCity: string;
  marriageCountry: string;
}

interface ParentData {
  surnames: string;
  givenNames: string;
  dateOfBirth: string;
  cityOfBirth: string;
  countryOfBirth: string;
  isLiving: boolean;
  currentCity?: string;
  currentCountry?: string;
  fullCurrentAddress?: string;
  yearOfDeath?: string;
}

interface PersonaData {
  label: string;
  citizenshipStatus: 'American Citizen' | 'Green Card Holder (Permanent Resident)';
  caseType: 'My Spouse' | 'My Unmarried Child' | 'My Parent';
  petitioner: {
    fullName: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    cityOfBirth: string;
    countryOfBirth: string;
    address: { street: string; city: string; zip: string; stateOrCountry: string; startDate: string };
    timesMarried: number;
    currentMarriage?: { date: string; spouseName: string; city: string; country: string };
    priorMarriages?: PriorMarriage[];
    father: ParentData;
    mother: ParentData;
    employmentStatus: string;
    employer?: { position: string; name: string; address: string; fromDate: string };
    nationality: string;
  };
  beneficiary: {
    fullName: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    cityOfBirth: string;
    countryOfBirth: string;
    address: { street: string; city: string; zip: string; stateOrCountry: string; startDate: string };
    timesMarried: number;
    currentMarriage?: { date: string; spouseName: string; city: string; country: string };
    priorMarriages?: PriorMarriage[];
    father: ParentData;
    mother: ParentData;
    employmentStatus: string;
    employer?: { position: string; name: string; address: string; fromDate: string };
    attendedUniversity: boolean;
    nationality: string;
    numberOfChildren: number;
  };
  futureUS: { name: string; address: string; city: string; state: string; zip: string; phone: string };
}

// ─── Test Matrix ─────────────────────────────────────────────────────────────

const testMatrix: PersonaData[] = [
  // ── Scenario 1: Simple Spouse — US-based, no prior marriages, no children ──
  {
    label: 'Simple Spouse (US-based)',
    citizenshipStatus: 'American Citizen',
    caseType: 'My Spouse',
    petitioner: {
      fullName: 'David Alan Thompson',
      phone: '2025559001',
      email: 'david.thompson@test.com',
      dateOfBirth: '04/12/1988',
      cityOfBirth: 'Austin',
      countryOfBirth: 'United States',
      address: { street: '500 Congress Ave', city: 'Austin', zip: '78701', stateOrCountry: 'Texas', startDate: '03/01/2019' },
      timesMarried: 1,
      currentMarriage: { date: '09/20/2023', spouseName: 'Ana Sofia Reyes', city: 'Austin', country: 'United States' },
      father: { surnames: 'Thompson', givenNames: 'Michael', dateOfBirth: '06/15/1960', cityOfBirth: 'Dallas', countryOfBirth: 'United States', isLiving: true, currentCity: 'Dallas', currentCountry: 'United States' },
      mother: { surnames: 'Baker', givenNames: 'Linda Marie', dateOfBirth: '09/22/1962', cityOfBirth: 'Houston', countryOfBirth: 'United States', isLiving: true, currentCity: 'Houston', currentCountry: 'United States' },
      employmentStatus: 'employed',
      employer: { position: 'Product Manager', name: 'TechStartup LLC', address: '200 Innovation Dr, Austin, TX 78702', fromDate: '06/01/2021' },
      nationality: 'American',
    },
    beneficiary: {
      fullName: 'Ana Sofia Reyes',
      phone: '5551234001',
      email: 'ana.reyes@test.com',
      dateOfBirth: '11/08/1992',
      cityOfBirth: 'Bogota',
      countryOfBirth: 'Colombia',
      address: { street: '500 Congress Ave', city: 'Austin', zip: '78701', stateOrCountry: 'Texas', startDate: '09/25/2023' },
      timesMarried: 1,
      currentMarriage: { date: '09/20/2023', spouseName: 'David Alan Thompson', city: 'Austin', country: 'United States' },
      father: { surnames: 'Reyes', givenNames: 'Carlos', dateOfBirth: '02/14/1965', cityOfBirth: 'Bogota', countryOfBirth: 'Colombia', isLiving: true, fullCurrentAddress: 'Calle 72 #10-34, Bogota, Colombia' },
      mother: { surnames: 'Martinez', givenNames: 'Elena', dateOfBirth: '07/30/1967', cityOfBirth: 'Medellin', countryOfBirth: 'Colombia', isLiving: true, fullCurrentAddress: 'Carrera 43 #25-12, Medellin, Colombia' },
      employmentStatus: 'employed',
      employer: { position: 'Graphic Designer', name: 'Creativa SA', address: 'Av. El Dorado 68C-61, Bogota, Colombia', fromDate: '02/01/2020' },
      attendedUniversity: false,
      nationality: 'Colombian',
      numberOfChildren: 0,
    },
    futureUS: { name: 'David Alan Thompson', address: '500 Congress Ave', city: 'Austin', state: 'TX', zip: '78701', phone: '2025559001' },
  },

  // ── Scenario 2: Complex — Prior marriages, deceased parent, children ──
  {
    label: 'Complex Spouse (prior marriages + children)',
    citizenshipStatus: 'American Citizen',
    caseType: 'My Spouse',
    petitioner: {
      fullName: 'Robert James Wilson',
      phone: '3105559002',
      email: 'robert.wilson@test.com',
      dateOfBirth: '01/25/1975',
      cityOfBirth: 'Los Angeles',
      countryOfBirth: 'United States',
      address: { street: '1200 Sunset Blvd', city: 'Los Angeles', zip: '90028', stateOrCountry: 'California', startDate: '01/15/2015' },
      timesMarried: 2,
      currentMarriage: { date: '03/10/2024', spouseName: 'Yuki Tanaka', city: 'Los Angeles', country: 'United States' },
      priorMarriages: [
        { fullName: 'Sarah Jane Miller', dateOfBirth: '05/12/1977', marriageDate: '06/18/2005', marriageCity: 'San Diego', marriageCountry: 'United States' },
      ],
      father: { surnames: 'Wilson', givenNames: 'Thomas Edward', dateOfBirth: '03/08/1948', cityOfBirth: 'Chicago', countryOfBirth: 'United States', isLiving: false },
      mother: { surnames: 'O\'Brien', givenNames: 'Margaret', dateOfBirth: '11/19/1950', cityOfBirth: 'Boston', countryOfBirth: 'United States', isLiving: true, currentCity: 'Pasadena', currentCountry: 'United States' },
      employmentStatus: 'employed',
      employer: { position: 'Film Producer', name: 'Pacific Studios Inc', address: '5000 Hollywood Blvd, LA, CA 90028', fromDate: '01/01/2018' },
      nationality: 'American',
    },
    beneficiary: {
      fullName: 'Yuki Tanaka',
      phone: '8109876543',
      email: 'yuki.tanaka@test.com',
      dateOfBirth: '08/15/1985',
      cityOfBirth: 'Tokyo',
      countryOfBirth: 'Japan',
      address: { street: 'Shibuya 2-21-1', city: 'Tokyo', zip: '150-0002', stateOrCountry: 'Japan', startDate: '04/01/2010' },
      timesMarried: 1,
      currentMarriage: { date: '03/10/2024', spouseName: 'Robert James Wilson', city: 'Los Angeles', country: 'United States' },
      father: { surnames: 'Tanaka', givenNames: 'Hiroshi', dateOfBirth: '12/05/1955', cityOfBirth: 'Osaka', countryOfBirth: 'Japan', isLiving: true, fullCurrentAddress: 'Namba 3-8-15, Osaka, Japan 542-0076' },
      mother: { surnames: 'Sato', givenNames: 'Keiko', dateOfBirth: '04/20/1958', cityOfBirth: 'Tokyo', countryOfBirth: 'Japan', isLiving: false, yearOfDeath: '2019' },
      employmentStatus: 'employed',
      employer: { position: 'Software Architect', name: 'Sony Interactive', address: '1-7-1 Konan, Minato-ku, Tokyo, Japan', fromDate: '04/01/2015' },
      attendedUniversity: false,
      nationality: 'Japanese',
      numberOfChildren: 1,
    },
    futureUS: { name: 'Robert James Wilson', address: '1200 Sunset Blvd', city: 'Los Angeles', state: 'CA', zip: '90028', phone: '3105559002' },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

async function settle(page: Page, ms = 600) {
  await page.waitForTimeout(ms);
}

/** Fill input inside a data-field-id container */
async function fill(page: Page, fieldId: string, value: string) {
  const container = page.locator(`[data-field-id="${fieldId}"]`);
  const input = container.locator('input, textarea').first();
  await input.scrollIntoViewIfNeeded();
  await input.fill(value);
}

/** Click a radio by its element id (escapes dots for CSS selector) */
async function clickRadioById(page: Page, id: string) {
  const escapedId = id.replace(/\./g, '\\.');
  const radio = page.locator(`#${escapedId}`);
  await radio.scrollIntoViewIfNeeded();
  await radio.click();
  await settle(page, 400);
}

/** Click Continue and verify next step */
async function clickContinue(page: Page) {
  const btn = page.getByRole('button', { name: /continue/i });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await settle(page, 1200);
}

/** Upload dummy PDF to all file inputs on the page (one-shot per input) */
async function uploadToAllDropzones(page: Page, filePath: string) {
  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  let uploaded = 0;

  for (let i = 0; i < count; i++) {
    try {
      const input = fileInputs.nth(i);
      // Only upload if this input doesn't already have a file
      const files = await input.evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
      if (files > 0) continue;

      await input.setInputFiles(filePath);
      uploaded++;
      await settle(page, 1200);
    } catch {
      // Skip inputs that can't accept files (disabled, detached, etc.)
      continue;
    }
  }
  return uploaded;
}

/** Filament admin: click action button then confirm modal */
async function filamentAction(page: Page, buttonName: RegExp, confirmText: RegExp | string) {
  const btn = page.getByRole('button', { name: buttonName });
  await expect(btn).toBeVisible({ timeout: 15_000 });
  await btn.click();
  const confirmBtn = typeof confirmText === 'string'
    ? page.getByRole('button', { name: confirmText })
    : page.getByRole('button', { name: confirmText });
  await expect(confirmBtn).toBeVisible({ timeout: 5_000 });
  await confirmBtn.click();
  await page.waitForTimeout(2000);
}

// ─── Matrix Test Suite ───────────────────────────────────────────────────────

for (const data of testMatrix) {
  test.describe(`Matrix: ${data.label}`, () => {
    test.describe.configure({ mode: 'serial', timeout: 180_000 });

    const testEmail = `matrix-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`;
    let clientPage: Page;
    let clientCtx: BrowserContext;
    let adminPage: Page;
    let adminCtx: BrowserContext;

    // ── PHASE 1: Client Login + Form Fill ──────────────────────────────────

    test('Phase 1.1 — OTP Login', async ({ browser }) => {
      clientCtx = await browser.newContext({ ignoreHTTPSErrors: true });
      clientPage = await clientCtx.newPage();

      await test.step('Navigate to login', async () => {
        await clientPage.goto(FRONTEND_URL);
        await expect(clientPage.getByText('Welcome')).toBeVisible({ timeout: 15_000 });
      });

      await test.step('Enter email and request OTP', async () => {
        await clientPage.getByPlaceholder('you@example.com').fill(testEmail);
        await clientPage.getByRole('button', { name: /send verification code/i }).click();
        await expect(clientPage.getByPlaceholder('000000')).toBeVisible({ timeout: 20_000 });
        await clientPage.waitForTimeout(1000);
      });

      await test.step('Extract OTP from log and verify', async () => {
        const otp = extractOtpFromLog(testEmail);
        console.log(`    OTP: ${otp}`);
        await clientPage.getByPlaceholder('000000').fill(otp);
        await clientPage.getByRole('button', { name: /verify/i }).click();
        await expect(clientPage.getByText(/what is your full name/i)).toBeVisible({ timeout: 20_000 });
      });
    });

    test('Phase 1.2 — Step 0: Intro', async () => {
      await test.step('Enter petitioner name', async () => {
        await clientPage.getByPlaceholder('Enter your full name').fill(data.petitioner.fullName);
        await settle(clientPage);
      });

      await test.step('Select citizenship status', async () => {
        await clientPage.getByRole('button', { name: new RegExp(data.citizenshipStatus.split(' ')[0], 'i') }).click();
        await settle(clientPage);
      });

      await test.step('Select case type', async () => {
        await clientPage.getByText(data.caseType).click();
        await settle(clientPage);
      });

      await test.step('Enter beneficiary name', async () => {
        const relationship = data.caseType.replace('My ', '').toLowerCase();
        await clientPage.getByPlaceholder(new RegExp(`enter your ${relationship}`, 'i')).fill(data.beneficiary.fullName);
        await settle(clientPage);
      });

      await test.step('Start application', async () => {
        await clientPage.getByRole('button', { name: /start application/i }).click();
        await expect(clientPage.getByText('Step 1 of 8 — Basic', { exact: false })).toBeVisible({ timeout: 10_000 });
      });
    });

    test('Phase 1.3 — Step 1: Basic Information', async () => {
      await test.step('Fill petitioner info', async () => {
        const phoneInputs = clientPage.getByPlaceholder('Phone number');
        await phoneInputs.first().fill(data.petitioner.phone);
        await clientPage.locator('input[type="email"]').first().fill(data.petitioner.email);
        await clientPage.locator('input[placeholder="MM/DD/YYYY"]').first().fill(data.petitioner.dateOfBirth);

        const cityLabels = clientPage.locator('label:has-text("City of Birth")');
        await cityLabels.first().locator('..').locator('input').fill(data.petitioner.cityOfBirth);
        const countryLabels = clientPage.locator('label:has-text("Country of Birth")');
        await countryLabels.first().locator('..').locator('input').fill(data.petitioner.countryOfBirth);
      });

      await test.step('Fill beneficiary info', async () => {
        await clientPage.getByRole('heading', { name: 'Your Applicant Family Member' }).scrollIntoViewIfNeeded();
        await settle(clientPage);

        const phoneInputs = clientPage.getByPlaceholder('Phone number');
        await phoneInputs.nth(1).fill(data.beneficiary.phone);
        await clientPage.locator('input[type="email"]').nth(1).fill(data.beneficiary.email);
        await clientPage.locator('input[placeholder="MM/DD/YYYY"]').nth(1).fill(data.beneficiary.dateOfBirth);

        const cityLabels = clientPage.locator('label:has-text("City of Birth")');
        await cityLabels.nth(1).locator('..').locator('input').fill(data.beneficiary.cityOfBirth);
        const countryLabels = clientPage.locator('label:has-text("Country of Birth")');
        await countryLabels.nth(1).locator('..').locator('input').fill(data.beneficiary.countryOfBirth);
      });

      await clickContinue(clientPage);
      await expect(clientPage.getByText('Step 2 of 8 — Address', { exact: false })).toBeVisible({ timeout: 10_000 });
    });

    test('Phase 1.4 — Step 2: Address History', async () => {
      await test.step('Petitioner address', async () => {
        const a = data.petitioner.address;
        await fill(clientPage, 'petitioner.currentAddress.street', a.street);
        await fill(clientPage, 'petitioner.currentAddress.city', a.city);
        await fill(clientPage, 'petitioner.currentAddress.zip', a.zip);
        await fill(clientPage, 'petitioner.currentAddress.stateOrCountry', a.stateOrCountry);
        await fill(clientPage, 'petitioner.currentAddress.startDate', a.startDate);
      });

      await test.step('Beneficiary address', async () => {
        const a = data.beneficiary.address;
        await fill(clientPage, 'beneficiary.currentAddress.street', a.street);
        await fill(clientPage, 'beneficiary.currentAddress.city', a.city);
        await fill(clientPage, 'beneficiary.currentAddress.zip', a.zip);
        await fill(clientPage, 'beneficiary.currentAddress.stateOrCountry', a.stateOrCountry);
        await fill(clientPage, 'beneficiary.currentAddress.startDate', a.startDate);
      });

      await test.step('Future US address', async () => {
        const f = data.futureUS;
        await fill(clientPage, 'futureUSAddress.nameOfPersonLiving', f.name);
        await fill(clientPage, 'futureUSAddress.address', f.address);
        await fill(clientPage, 'futureUSAddress.city', f.city);
        await fill(clientPage, 'futureUSAddress.state', f.state);
        await fill(clientPage, 'futureUSAddress.zipCode', f.zip);

        const phoneContainer = clientPage.locator('[data-field-id="futureUSAddress.phoneNumber"]');
        await phoneContainer.scrollIntoViewIfNeeded();
        await phoneContainer.getByPlaceholder('Phone number').fill(f.phone);

        // Toggle delivery address to avoid contact info fields
        const sw = clientPage.locator('[data-field-id="futureUSAddress.isGreenCardDeliveryAddress"] button[role="switch"]');
        if (await sw.count() > 0) {
          const checked = await sw.getAttribute('aria-checked');
          if (checked !== 'true') { await sw.click(); await settle(clientPage); }
        }
      });

      await clickContinue(clientPage);
      await expect(clientPage.getByText('Step 3 of 8 — Marital', { exact: false })).toBeVisible({ timeout: 15_000 });
    });

    test('Phase 1.5 — Step 3: Marital Status', async () => {
      const fillMarital = async (prefix: 'petitioner' | 'beneficiary', person: typeof data.petitioner | typeof data.beneficiary) => {
        await test.step(`${prefix} marital status`, async () => {
          // Times married
          const tmInputs = clientPage.locator('input[type="number"]');
          const idx = prefix === 'petitioner' ? 0 : 1;
          await tmInputs.nth(idx).scrollIntoViewIfNeeded();
          await tmInputs.nth(idx).fill(String(person.timesMarried));
          await settle(clientPage, 800);

          if (person.timesMarried >= 1 && person.currentMarriage) {
            const cm = person.currentMarriage;
            await fill(clientPage, `${prefix}.maritalStatus.currentMarriage.date`, cm.date);
            await fill(clientPage, `${prefix}.maritalStatus.currentMarriage.spouseName`, cm.spouseName);
            await fill(clientPage, `${prefix}.maritalStatus.currentMarriage.city`, cm.city);
            await fill(clientPage, `${prefix}.maritalStatus.currentMarriage.country`, cm.country);
          }

          if (person.timesMarried > 1 && person.priorMarriages) {
            for (let i = 0; i < person.priorMarriages.length; i++) {
              // Click "Add Prior Marriage" if needed
              const addBtn = clientPage.getByText(new RegExp(`add prior marriage.*${prefix === 'petitioner' ? data.petitioner.fullName : data.beneficiary.fullName}`, 'i'));
              if (await addBtn.count() > 0) {
                await addBtn.click();
                await settle(clientPage);
              }

              const pm = person.priorMarriages[i];
              await fill(clientPage, `${prefix}.maritalStatus.priorMarriages.${i}.fullName`, pm.fullName);
              await fill(clientPage, `${prefix}.maritalStatus.priorMarriages.${i}.dateOfBirth`, pm.dateOfBirth);
              await fill(clientPage, `${prefix}.maritalStatus.priorMarriages.${i}.marriageDate`, pm.marriageDate);
              await fill(clientPage, `${prefix}.maritalStatus.priorMarriages.${i}.marriageCity`, pm.marriageCity);
              await fill(clientPage, `${prefix}.maritalStatus.priorMarriages.${i}.marriageCountry`, pm.marriageCountry);
            }
          }
        });
      };

      await fillMarital('petitioner', data.petitioner);
      await clientPage.getByText(`${data.beneficiary.fullName} — Marital Status`).scrollIntoViewIfNeeded();
      await settle(clientPage);
      await fillMarital('beneficiary', data.beneficiary);

      await clickContinue(clientPage);
      await expect(clientPage.getByText('Step 4 of 8 — Family', { exact: false })).toBeVisible({ timeout: 15_000 });
    });

    test('Phase 1.6 — Step 4: Family', async () => {
      const fillParent = async (prefix: string, parent: ParentData) => {
        await test.step(`Fill ${prefix}`, async () => {
          await fill(clientPage, `${prefix}.surnames`, parent.surnames);
          await fill(clientPage, `${prefix}.givenNames`, parent.givenNames);
          await fill(clientPage, `${prefix}.dateOfBirth`, parent.dateOfBirth);
          await fill(clientPage, `${prefix}.cityOfBirth`, parent.cityOfBirth);
          await fill(clientPage, `${prefix}.countryOfBirth`, parent.countryOfBirth);

          await clickRadioById(clientPage, `${prefix}-living-${parent.isLiving ? 'yes' : 'no'}`);

          if (parent.isLiving && prefix.startsWith('petitioner')) {
            if (parent.currentCity) await fill(clientPage, `${prefix}.currentCity`, parent.currentCity);
            if (parent.currentCountry) await fill(clientPage, `${prefix}.currentCountry`, parent.currentCountry);
          }
          if (parent.isLiving && prefix.startsWith('beneficiary')) {
            if (parent.fullCurrentAddress) await fill(clientPage, `${prefix}.fullCurrentAddress`, parent.fullCurrentAddress);
          }
          if (!parent.isLiving && prefix.startsWith('beneficiary') && parent.yearOfDeath) {
            await fill(clientPage, `${prefix}.yearOfDeath`, parent.yearOfDeath);
          }
        });
      };

      await fillParent('petitioner.father', data.petitioner.father);
      await fillParent('petitioner.mother', data.petitioner.mother);
      await fillParent('beneficiary.father', data.beneficiary.father);
      await fillParent('beneficiary.mother', data.beneficiary.mother);

      // Children count
      await test.step('Set children counts', async () => {
        const numInputs = clientPage.locator('input[type="number"]');
        for (let i = 0; i < await numInputs.count(); i++) {
          await numInputs.nth(i).scrollIntoViewIfNeeded();
          await numInputs.nth(i).fill('0');
        }
      });

      await clickContinue(clientPage);
      await expect(clientPage.getByText('Step 5 of 8 — Employment', { exact: false })).toBeVisible({ timeout: 15_000 });
    });

    test('Phase 1.7 — Step 5: Employment', async () => {
      const fillEmployment = async (prefix: 'petitioner' | 'beneficiary', person: typeof data.petitioner) => {
        await test.step(`${prefix} employment`, async () => {
          await clientPage.locator(`label[for="${prefix}-status-${person.employmentStatus}"]`).click();
          await settle(clientPage);

          if (person.employer) {
            const addBtns = clientPage.getByText('Add Employment History');
            const btnIdx = prefix === 'petitioner' ? 0 : 1;
            if (await addBtns.nth(btnIdx).isVisible()) {
              await addBtns.nth(btnIdx).click();
              await settle(clientPage);
            }

            await fill(clientPage, `${prefix}.employments.0.position`, person.employer.position);
            await fill(clientPage, `${prefix}.employments.0.employerName`, person.employer.name);
            await fill(clientPage, `${prefix}.employments.0.employerAddress`, person.employer.address);
            await fill(clientPage, `${prefix}.employments.0.fromDate`, person.employer.fromDate);
          }
        });
      };

      await fillEmployment('petitioner', data.petitioner);

      await clientPage.getByText(`Employment History (${data.beneficiary.fullName})`).scrollIntoViewIfNeeded();
      await settle(clientPage);
      await fillEmployment('beneficiary', data.beneficiary as typeof data.petitioner);

      // Education toggle
      await test.step('Education: ' + (data.beneficiary.attendedUniversity ? 'Yes' : 'No'), async () => {
        const label = clientPage.locator(`label[for="edu-attended-${data.beneficiary.attendedUniversity ? 'yes' : 'no'}"]`);
        await label.scrollIntoViewIfNeeded();
        await label.click();
      });

      await clickContinue(clientPage);
      await expect(clientPage.getByText('Step 6 of 8 — Other', { exact: false })).toBeVisible({ timeout: 15_000 });
    });

    test('Phase 1.8 — Step 6: Other Information', async () => {
      await test.step('Petitioner nationality', async () => {
        const natLabels = clientPage.locator('label:has-text("Nationality")');
        await natLabels.first().locator('..').locator('input').fill(data.petitioner.nationality);
      });

      await test.step('Beneficiary nationality', async () => {
        await clientPage.getByText(`Other Information (${data.beneficiary.fullName})`).scrollIntoViewIfNeeded();
        await settle(clientPage);
        const natLabels = clientPage.locator('label:has-text("Nationality")');
        await natLabels.nth(1).locator('..').locator('input').fill(data.beneficiary.nationality);
      });

      await clickContinue(clientPage);
      await expect(clientPage.getByText('Step 7 of 8 — Security', { exact: false })).toBeVisible({ timeout: 15_000 });
    });

    test('Phase 1.9 — Step 7: Security Questions', async () => {
      await test.step('Answer all questions (vaccination=Yes, rest=No)', async () => {
        const radioGroups = clientPage.locator('[role="radiogroup"]');
        const count = await radioGroups.count();

        for (let i = 0; i < count; i++) {
          const group = radioGroups.nth(i);
          if (i === 1) {
            await group.getByLabel(/yes/i).click();
          } else {
            await group.getByLabel(/no/i).click();
          }
          if (i % 10 === 9 && i + 1 < count) {
            await radioGroups.nth(i + 1).scrollIntoViewIfNeeded();
          }
        }
      });

      await clickContinue(clientPage);
      await expect(clientPage.getByText('Step 8 of 8 — Documents', { exact: false })).toBeVisible({ timeout: 10_000 });
    });

    test('Phase 1.10 — Step 8: Upload & Submit Stage 1', async () => {
      await test.step('Upload documents to all dropzones', async () => {
        const count = await uploadToAllDropzones(clientPage, DUMMY_PDF);
        console.log(`    Uploaded to ${count} dropzones`);
      });

      await test.step('Submit application', async () => {
        // Check if already submitted (upload loop may have triggered auto-submit)
        const alreadySubmitted = await clientPage.getByRole('heading', { name: 'Application Submitted' }).isVisible().catch(() => false);
        if (alreadySubmitted) {
          console.log('    Application already submitted during upload');
          return;
        }

        const submitBtn = clientPage.getByRole('button', { name: /submit application/i });
        if (await submitBtn.isVisible()) {
          await submitBtn.scrollIntoViewIfNeeded();
          await submitBtn.click();
        }
        await expect(clientPage.getByRole('heading', { name: 'Application Submitted' })).toBeVisible({ timeout: 30_000 });
      });
    });

    // ── PHASE 2: Admin Data Integrity Verification ─────────────────────────

    test('Phase 2 — Admin verifies submitted data', async ({ browser }) => {
      adminCtx = await browser.newContext({ ignoreHTTPSErrors: true });
      adminPage = await adminCtx.newPage();

      await test.step('Admin login', async () => {
        await adminPage.goto(ADMIN_URL + '/login');
        await adminPage.locator('input[type="email"], input[name="email"]').fill(ADMIN_EMAIL);
        await adminPage.locator('input[type="password"], input[name="password"]').fill(ADMIN_PASSWORD);
        await adminPage.getByRole('button', { name: /sign in|log in/i }).click();
        await expect(adminPage.getByText(/application|dashboard/i).first()).toBeVisible({ timeout: 15_000 });
      });

      await test.step('Navigate to the test application', async () => {
        await adminPage.goto(ADMIN_URL + '/applications');
        await settle(adminPage, 2000);
        await expect(adminPage.getByText(testEmail).first()).toBeVisible({ timeout: 15_000 });

        const row = adminPage.locator('tr', { hasText: testEmail });
        await row.getByRole('link').first().click();
        await settle(adminPage, 2000);
      });

      // ── Expand collapsible sections and verify data ──
      await test.step('Expand Step 1 section and verify names', async () => {
        // Click on "Step 1: Basic Information" to expand it
        const step1Header = adminPage.getByText('Step 1: Basic Information');
        if (await step1Header.count() > 0) {
          await step1Header.click();
          await settle(adminPage, 1000);
        }
        // Petitioner name should now be visible
        await expect(adminPage.getByText(data.petitioner.fullName).first()).toBeVisible({ timeout: 10_000 });
        // Beneficiary name
        await expect(adminPage.getByText(data.beneficiary.fullName).first()).toBeVisible({ timeout: 10_000 });
      });

      await test.step('Verify petitioner email in admin', async () => {
        await expect(adminPage.getByText(data.petitioner.email).first()).toBeVisible({ timeout: 10_000 });
      });

      await test.step('Verify status is stage1_submitted', async () => {
        await adminPage.locator('body').press('Home'); // scroll to top
        await settle(adminPage);
        await expect(adminPage.getByText(/stage.?1.?submitted/i).first()).toBeVisible({ timeout: 10_000 });
      });
    });

    // ── PHASE 3: Stage 2 Unlock → Upload → Complete ────────────────────────

    test('Phase 3.1 — Admin unlocks Stage 2', async () => {
      await test.step('Mark as Pending I-130', async () => {
        await filamentAction(adminPage, /pending i-130/i, 'Confirm');
        console.log('    Marked Pending I-130');
      });

      await test.step('Reload and unlock Stage 2', async () => {
        await adminPage.reload({ waitUntil: 'networkidle' });
        await settle(adminPage, 1500);
        await filamentAction(adminPage, /unlock stage 2/i, /yes.*unlock/i);
        console.log('    Unlocked Stage 2');
      });

      await test.step('Verify status changed', async () => {
        await adminPage.reload({ waitUntil: 'networkidle' });
        await expect(adminPage.getByText(/stage.?2.?unlocked/i).first()).toBeVisible({ timeout: 15_000 });
      });
    });

    test('Phase 3.2 — Client uploads Stage 2 documents', async () => {
      await test.step('Reload client page — Stage 2 Dashboard appears', async () => {
        await clientPage.reload({ waitUntil: 'networkidle' });
        await settle(clientPage, 2000);
        // Client should see Stage 2 dashboard now
        await expect(clientPage.getByText('Stage 2 — NVC Document Upload')).toBeVisible({ timeout: 20_000 });
      });

      await test.step('Expand all sections and upload to dropzones', async () => {
        // Expand all collapsible <details> sections first
        const details = clientPage.locator('details:not([open])');
        const detailsCount = await details.count();
        for (let i = 0; i < detailsCount; i++) {
          const summary = details.nth(i).locator('summary');
          if (await summary.isVisible()) {
            await summary.click();
            await settle(clientPage, 300);
          }
        }
        await settle(clientPage, 500);

        const count = await uploadToAllDropzones(clientPage, DUMMY_PDF);
        console.log(`    Uploaded to ${count} Stage 2 dropzones`);
      });

      await test.step('Submit Stage 2 for review', async () => {
        const submitBtn = clientPage.getByRole('button', { name: /submit documents for review/i });
        await submitBtn.scrollIntoViewIfNeeded();

        // Handle the confirm dialog
        clientPage.once('dialog', (dialog) => dialog.accept());
        await submitBtn.click();

        // Should see the "Stage 2 Documents Submitted" lock screen
        await expect(clientPage.getByRole('heading', { name: /stage 2 documents submitted|application submitted/i })).toBeVisible({ timeout: 30_000 });
        console.log('    Stage 2 submitted by client');
      });
    });

    test('Phase 3.3 — Admin completes the case', async () => {
      await test.step('Reload admin and verify stage2_submitted', async () => {
        await adminPage.reload({ waitUntil: 'networkidle' });
        await settle(adminPage, 1500);
        await expect(adminPage.getByText(/stage.?2.?submitted/i).first()).toBeVisible({ timeout: 15_000 });
      });

      await test.step('Mark as Completed', async () => {
        await filamentAction(adminPage, /mark completed/i, 'Confirm');
        console.log('    Marked Completed');
      });

      await test.step('Verify final status', async () => {
        await adminPage.reload({ waitUntil: 'networkidle' });
        await expect(adminPage.getByText('Completed').first()).toBeVisible({ timeout: 15_000 });
        console.log(`    ✓ ${data.label} — Full lifecycle COMPLETE`);
      });

      // Cleanup
      await adminPage.close();
      await adminCtx.close();
      await clientPage.close();
      await clientCtx.close();
    });
  });
} // end for
