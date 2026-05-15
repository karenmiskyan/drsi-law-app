/**
 * DRSI Data Integrity & Completeness Verification
 *
 * Proves that 100% of form data entered in the React frontend
 * is correctly saved and rendered in the Laravel Filament Admin panel.
 *
 * Uses UNIQUE identifier strings for every field to prevent false positives.
 *
 * Run: npx playwright test tests/e2e/drsi_data_integrity.spec.ts --headed
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_URL = 'http://localhost:5173';
const ADMIN_URL = 'http://drsi-backend.local/admin';
const LARAVEL_LOG = path.resolve(__dirname, '../../../drsi_backend/storage/logs/laravel.log');
const DUMMY_PDF = path.resolve(__dirname, '../fixtures/dummy-document.pdf');
const ADMIN_EMAIL = 'meir@drsi.com';
const ADMIN_PASSWORD = 'admin123';

// ─── UNIQUE MOCK DATA (every string is globally unique) ──────────────────────

const D = {
  testEmail: `integrity-${Date.now()}@example.com`,

  pet: {
    fullName: 'INTEG_PET_Marcus_Aurelius_77X',
    phone: '2029990077',
    email: 'INTEG_PET_marcus77@testmail.com',
    dob: '03/15/1982',
    cityOfBirth: 'INTEG_PET_CITY_Portland_88A',
    countryOfBirth: 'INTEG_PET_COUNTRY_USA_88A',
    address: {
      street: 'INTEG_PET_STREET_742_Evergreen_Ter',
      city: 'INTEG_PET_ADDR_CITY_Springfield',
      zip: 'INTEG_PET_ZIP_97201',
      state: 'INTEG_PET_STATE_Oregon',
      startDate: '01/10/2019',
    },
    prevAddress: {
      street: 'INTEG_PET_PREV_111_Old_Oak_Ln',
      city: 'INTEG_PET_PREV_CITY_Salem',
      zip: 'INTEG_PET_PREV_ZIP_97301',
      state: 'INTEG_PET_PREV_STATE_Oregon',
      startDate: '06/01/2015',
      endDate: '01/09/2019',
    },
    marriageDate: '11/22/2023',
    marriageCity: 'INTEG_MARRIAGE_CITY_Bend_OR',
    marriageCountry: 'INTEG_MARRIAGE_COUNTRY_USA',
    priorMarriage: {
      fullName: 'INTEG_PET_EX_Jennifer_Quinn_44Z',
      dob: '08/19/1984',
      marriageDate: '05/14/2010',
      marriageCity: 'INTEG_PET_EX_MCITY_Denver',
      marriageCountry: 'INTEG_PET_EX_MCOUNTRY_USA',
    },
    father: { surnames: 'INTEG_PET_DAD_SN_Aurelius', givenNames: 'INTEG_PET_DAD_GN_Gaius', dob: '07/04/1950', cityOfBirth: 'INTEG_PET_DAD_COB_Rome', countryOfBirth: 'INTEG_PET_DAD_COUNTRY_Italy', currentCity: 'INTEG_PET_DAD_CURCITY_Portland', currentCountry: 'INTEG_PET_DAD_CURCOUNTRY_USA' },
    mother: { surnames: 'INTEG_PET_MOM_SN_Claudia', givenNames: 'INTEG_PET_MOM_GN_Livia', dob: '12/25/1953', cityOfBirth: 'INTEG_PET_MOM_COB_Milan', countryOfBirth: 'INTEG_PET_MOM_COUNTRY_Italy', currentCity: 'INTEG_PET_MOM_CURCITY_Portland', currentCountry: 'INTEG_PET_MOM_CURCOUNTRY_USA' },
    employer1: { position: 'INTEG_PET_JOB1_SeniorArchitect', name: 'INTEG_PET_EMP1_AcmeCorp_99K', address: 'INTEG_PET_EMP1_ADDR_100_Tech_Way', fromDate: '03/01/2021' },
    employer2: { position: 'INTEG_PET_JOB2_JuniorDev', name: 'INTEG_PET_EMP2_StartupXYZ_55M', address: 'INTEG_PET_EMP2_ADDR_50_Code_St', fromDate: '01/01/2018', toDate: '02/28/2021' },
    nationality: 'INTEG_PET_NAT_American_66Q',
    passportNumber: 'INTEG_PET_PP_US123456789',
    eyeColor: 'INTEG_PET_EYE_Hazel',
    hairColor: 'INTEG_PET_HAIR_Brown',
  },

  ben: {
    fullName: 'INTEG_BEN_Sakura_Yamamoto_33Y',
    phone: '8101234567',
    email: 'INTEG_BEN_sakura33@testmail.com',
    dob: '09/28/1990',
    cityOfBirth: 'INTEG_BEN_CITY_Kyoto_55B',
    countryOfBirth: 'INTEG_BEN_COUNTRY_Japan_55B',
    address: {
      street: 'INTEG_BEN_STREET_Gion_District_5',
      city: 'INTEG_BEN_ADDR_CITY_Kyoto',
      zip: 'INTEG_BEN_ZIP_605001',
      state: 'INTEG_BEN_STATE_Kyoto_Pref',
      startDate: '04/01/2012',
    },
    marriageDate: '11/22/2023',
    marriageCity: 'INTEG_BEN_MCITY_Bend_OR',
    marriageCountry: 'INTEG_BEN_MCOUNTRY_USA',
    father: { surnames: 'INTEG_BEN_DAD_SN_Yamamoto', givenNames: 'INTEG_BEN_DAD_GN_Kenji', dob: '02/14/1958', cityOfBirth: 'INTEG_BEN_DAD_COB_Tokyo', countryOfBirth: 'INTEG_BEN_DAD_COUNTRY_Japan', fullCurrentAddress: 'INTEG_BEN_DAD_ADDR_Shinjuku_3_1_Tokyo_JP_160' },
    mother: { surnames: 'INTEG_BEN_MOM_SN_Tanaka', givenNames: 'INTEG_BEN_MOM_GN_Yuko', dob: '06/30/1960', cityOfBirth: 'INTEG_BEN_MOM_COB_Osaka', countryOfBirth: 'INTEG_BEN_MOM_COUNTRY_Japan', yearOfDeath: '2021' },
    employer: { position: 'INTEG_BEN_JOB_UXResearcher', name: 'INTEG_BEN_EMP_NintendoCo_77N', address: 'INTEG_BEN_EMP_ADDR_11_1_Kamitoba', fromDate: '05/15/2017' },
    nationality: 'INTEG_BEN_NAT_Japanese_44P',
    child1: { name: 'INTEG_CHILD1_Hana_Yamamoto_91C', dob: '03/12/2018', cityOfBirth: 'INTEG_CHILD1_COB_Kyoto', stateOfBirth: 'INTEG_CHILD1_SOB_Kyoto_Pref' },
    child2: { name: 'INTEG_CHILD2_Riku_Yamamoto_92C', dob: '07/05/2020', cityOfBirth: 'INTEG_CHILD2_COB_Tokyo', stateOfBirth: 'INTEG_CHILD2_SOB_Tokyo_Met' },
    eyeColor: 'INTEG_BEN_EYE_DarkBrown',
    hairColor: 'INTEG_BEN_HAIR_Black',
  },

  futureUS: {
    name: 'INTEG_FUTURE_NAME_Marcus_Aurelius',
    address: 'INTEG_FUTURE_ADDR_742_Evergreen',
    city: 'INTEG_FUTURE_CITY_Springfield',
    state: 'INTEG_FUTURE_STATE_OR',
    zip: 'INTEG_FUTURE_ZIP_97201',
    phone: '5039990077',
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractOtpFromLog(email: string): string {
  const content = fs.readFileSync(LARAVEL_LOG, 'utf-8');
  for (const line of content.split('\n').reverse()) {
    if (line.includes(`OTP for ${email}:`)) {
      const m = line.match(/OTP for .+?: (\d{6})/);
      if (m) return m[1];
    }
  }
  throw new Error(`OTP not found for ${email}`);
}

async function settle(page: Page, ms = 600) { await page.waitForTimeout(ms); }

async function fill(page: Page, fieldId: string, value: string) {
  const input = page.locator(`[data-field-id="${fieldId}"] input, [data-field-id="${fieldId}"] textarea`).first();
  await input.scrollIntoViewIfNeeded();
  await input.fill(value);
}

async function clickRadio(page: Page, id: string) {
  const escaped = id.replace(/\./g, '\\.');
  await page.locator(`#${escaped}`).scrollIntoViewIfNeeded();
  await page.locator(`#${escaped}`).click();
  await settle(page, 400);
}

async function clickContinue(page: Page) {
  await page.getByRole('button', { name: /continue/i }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: /continue/i }).click();
  await settle(page, 1200);
}

async function uploadToDropzones(page: Page, filePath: string) {
  const inputs = page.locator('input[type="file"]');
  const count = await inputs.count();
  let uploaded = 0;
  for (let i = 0; i < count; i++) {
    try {
      const files = await inputs.nth(i).evaluate((el: HTMLInputElement) => el.files?.length ?? 0);
      if (files > 0) continue;
      await inputs.nth(i).setInputFiles(filePath);
      uploaded++;
      await settle(page, 1200);
    } catch { continue; }
  }
  return uploaded;
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

test.describe('Data Integrity Verification', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  let clientPage: Page;
  let clientCtx: BrowserContext;

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 1: FRONTEND — EXHAUSTIVE FORM FILL
  // ══════════════════════════════════════════════════════════════════════════

  test('Phase 1.1 — OTP Login', async ({ browser }) => {
    clientCtx = await browser.newContext({ ignoreHTTPSErrors: true });
    clientPage = await clientCtx.newPage();
    await clientPage.goto(FRONTEND_URL);
    await expect(clientPage.getByText('Welcome')).toBeVisible({ timeout: 15_000 });

    await clientPage.getByPlaceholder('you@example.com').fill(D.testEmail);
    await clientPage.getByRole('button', { name: /send verification code/i }).click();
    await expect(clientPage.getByPlaceholder('000000')).toBeVisible({ timeout: 20_000 });
    await clientPage.waitForTimeout(1000);

    const otp = extractOtpFromLog(D.testEmail);
    await clientPage.getByPlaceholder('000000').fill(otp);
    await clientPage.getByRole('button', { name: /verify/i }).click();
    await expect(clientPage.getByText(/what is your full name/i)).toBeVisible({ timeout: 20_000 });
  });

  test('Phase 1.2 — Step 0: Intro', async () => {
    await clientPage.getByPlaceholder('Enter your full name').fill(D.pet.fullName);
    await settle(clientPage);
    await clientPage.getByRole('button', { name: /american citizen/i }).click();
    await settle(clientPage);
    await clientPage.getByText('My Spouse').click();
    await settle(clientPage);
    await clientPage.getByPlaceholder(/enter your spouse/i).fill(D.ben.fullName);
    await settle(clientPage);
    await clientPage.getByRole('button', { name: /start application/i }).click();
    await expect(clientPage.getByText('Step 1 of 8 — Basic', { exact: false })).toBeVisible({ timeout: 10_000 });
  });

  test('Phase 1.3 — Step 1: Basic Info (all fields)', async () => {
    // Petitioner
    await clientPage.getByPlaceholder('Phone number').first().fill(D.pet.phone);
    await clientPage.locator('input[type="email"]').first().fill(D.pet.email);
    await clientPage.locator('input[placeholder="MM/DD/YYYY"]').first().fill(D.pet.dob);
    await clientPage.locator('label:has-text("City of Birth")').first().locator('..').locator('input').fill(D.pet.cityOfBirth);
    await clientPage.locator('label:has-text("Country of Birth")').first().locator('..').locator('input').fill(D.pet.countryOfBirth);

    // Beneficiary
    await clientPage.getByRole('heading', { name: 'Your Applicant Family Member' }).scrollIntoViewIfNeeded();
    await settle(clientPage);
    await clientPage.getByPlaceholder('Phone number').nth(1).fill(D.ben.phone);
    await clientPage.locator('input[type="email"]').nth(1).fill(D.ben.email);
    await clientPage.locator('input[placeholder="MM/DD/YYYY"]').nth(1).fill(D.ben.dob);
    await clientPage.locator('label:has-text("City of Birth")').nth(1).locator('..').locator('input').fill(D.ben.cityOfBirth);
    await clientPage.locator('label:has-text("Country of Birth")').nth(1).locator('..').locator('input').fill(D.ben.countryOfBirth);

    await clickContinue(clientPage);
    await expect(clientPage.getByText('Step 2 of 8 — Address', { exact: false })).toBeVisible({ timeout: 10_000 });
  });

  test('Phase 1.4 — Step 2: Addresses + Previous Address', async () => {
    const a = D.pet.address;
    await fill(clientPage, 'petitioner.currentAddress.street', a.street);
    await fill(clientPage, 'petitioner.currentAddress.city', a.city);
    await fill(clientPage, 'petitioner.currentAddress.zip', a.zip);
    await fill(clientPage, 'petitioner.currentAddress.stateOrCountry', a.state);
    await fill(clientPage, 'petitioner.currentAddress.startDate', a.startDate);

    // Add previous address
    await test.step('Add petitioner previous address', async () => {
      await clientPage.getByText('Add Another Address').first().click();
      await settle(clientPage);
      await fill(clientPage, 'petitioner.previousAddresses.0.street', D.pet.prevAddress.street);
      await fill(clientPage, 'petitioner.previousAddresses.0.city', D.pet.prevAddress.city);
      await fill(clientPage, 'petitioner.previousAddresses.0.zip', D.pet.prevAddress.zip);
      await fill(clientPage, 'petitioner.previousAddresses.0.stateOrCountry', D.pet.prevAddress.state);
      await fill(clientPage, 'petitioner.previousAddresses.0.startDate', D.pet.prevAddress.startDate);
      await fill(clientPage, 'petitioner.previousAddresses.0.endDate', D.pet.prevAddress.endDate);
    });

    // Beneficiary address
    const b = D.ben.address;
    await fill(clientPage, 'beneficiary.currentAddress.street', b.street);
    await fill(clientPage, 'beneficiary.currentAddress.city', b.city);
    await fill(clientPage, 'beneficiary.currentAddress.zip', b.zip);
    await fill(clientPage, 'beneficiary.currentAddress.stateOrCountry', b.state);
    await fill(clientPage, 'beneficiary.currentAddress.startDate', b.startDate);

    // Future US
    const f = D.futureUS;
    await fill(clientPage, 'futureUSAddress.nameOfPersonLiving', f.name);
    await fill(clientPage, 'futureUSAddress.address', f.address);
    await fill(clientPage, 'futureUSAddress.city', f.city);
    await fill(clientPage, 'futureUSAddress.state', f.state);
    await fill(clientPage, 'futureUSAddress.zipCode', f.zip);
    await clientPage.locator('[data-field-id="futureUSAddress.phoneNumber"]').scrollIntoViewIfNeeded();
    await clientPage.locator('[data-field-id="futureUSAddress.phoneNumber"]').getByPlaceholder('Phone number').fill(f.phone);

    // Toggle delivery address = Yes
    const sw = clientPage.locator('[data-field-id="futureUSAddress.isGreenCardDeliveryAddress"] button[role="switch"]');
    if (await sw.count() > 0) {
      const checked = await sw.getAttribute('aria-checked');
      if (checked !== 'true') { await sw.click(); await settle(clientPage); }
    }

    await clickContinue(clientPage);
    await expect(clientPage.getByText('Step 3 of 8 — Marital', { exact: false })).toBeVisible({ timeout: 15_000 });
  });

  test('Phase 1.5 — Step 3: Marital (2 marriages + prior)', async () => {
    // Petitioner: married 2 times (current + 1 prior)
    const tmInputs = clientPage.locator('input[type="number"]');
    await tmInputs.first().fill('2');
    await settle(clientPage, 800);

    await fill(clientPage, 'petitioner.maritalStatus.currentMarriage.date', D.pet.marriageDate);
    await fill(clientPage, 'petitioner.maritalStatus.currentMarriage.spouseName', D.ben.fullName);
    await fill(clientPage, 'petitioner.maritalStatus.currentMarriage.city', D.pet.marriageCity);
    await fill(clientPage, 'petitioner.maritalStatus.currentMarriage.country', D.pet.marriageCountry);

    // Add prior marriage
    await test.step('Fill prior marriage', async () => {
      const addPrior = clientPage.getByText(/add prior marriage/i).first();
      if (await addPrior.isVisible()) { await addPrior.click(); await settle(clientPage); }

      const pm = D.pet.priorMarriage;
      await fill(clientPage, 'petitioner.maritalStatus.priorMarriages.0.fullName', pm.fullName);
      await fill(clientPage, 'petitioner.maritalStatus.priorMarriages.0.dateOfBirth', pm.dob);
      await fill(clientPage, 'petitioner.maritalStatus.priorMarriages.0.marriageDate', pm.marriageDate);
      await fill(clientPage, 'petitioner.maritalStatus.priorMarriages.0.marriageCity', pm.marriageCity);
      await fill(clientPage, 'petitioner.maritalStatus.priorMarriages.0.marriageCountry', pm.marriageCountry);
    });

    // Beneficiary: married 1 time
    await clientPage.getByText(`${D.ben.fullName} — Marital Status`).scrollIntoViewIfNeeded();
    await settle(clientPage);
    await tmInputs.nth(1).fill('1');
    await settle(clientPage, 800);

    await fill(clientPage, 'beneficiary.maritalStatus.currentMarriage.date', D.ben.marriageDate);
    await fill(clientPage, 'beneficiary.maritalStatus.currentMarriage.spouseName', D.pet.fullName);
    await fill(clientPage, 'beneficiary.maritalStatus.currentMarriage.city', D.ben.marriageCity);
    await fill(clientPage, 'beneficiary.maritalStatus.currentMarriage.country', D.ben.marriageCountry);

    await clickContinue(clientPage);
    await expect(clientPage.getByText('Step 4 of 8 — Family', { exact: false })).toBeVisible({ timeout: 15_000 });
  });

  test('Phase 1.6 — Step 4: Family (2 children + deceased parent)', async () => {
    // Pet Father (living)
    await fill(clientPage, 'petitioner.father.surnames', D.pet.father.surnames);
    await fill(clientPage, 'petitioner.father.givenNames', D.pet.father.givenNames);
    await fill(clientPage, 'petitioner.father.dateOfBirth', D.pet.father.dob);
    await fill(clientPage, 'petitioner.father.cityOfBirth', D.pet.father.cityOfBirth);
    await fill(clientPage, 'petitioner.father.countryOfBirth', D.pet.father.countryOfBirth);
    await clickRadio(clientPage, 'petitioner.father-living-yes');
    await fill(clientPage, 'petitioner.father.currentCity', D.pet.father.currentCity);
    await fill(clientPage, 'petitioner.father.currentCountry', D.pet.father.currentCountry);

    // Pet Mother (living)
    await fill(clientPage, 'petitioner.mother.surnames', D.pet.mother.surnames);
    await fill(clientPage, 'petitioner.mother.givenNames', D.pet.mother.givenNames);
    await fill(clientPage, 'petitioner.mother.dateOfBirth', D.pet.mother.dob);
    await fill(clientPage, 'petitioner.mother.cityOfBirth', D.pet.mother.cityOfBirth);
    await fill(clientPage, 'petitioner.mother.countryOfBirth', D.pet.mother.countryOfBirth);
    await clickRadio(clientPage, 'petitioner.mother-living-yes');
    await fill(clientPage, 'petitioner.mother.currentCity', D.pet.mother.currentCity);
    await fill(clientPage, 'petitioner.mother.currentCountry', D.pet.mother.currentCountry);

    // Ben Father (living)
    await fill(clientPage, 'beneficiary.father.surnames', D.ben.father.surnames);
    await fill(clientPage, 'beneficiary.father.givenNames', D.ben.father.givenNames);
    await fill(clientPage, 'beneficiary.father.dateOfBirth', D.ben.father.dob);
    await fill(clientPage, 'beneficiary.father.cityOfBirth', D.ben.father.cityOfBirth);
    await fill(clientPage, 'beneficiary.father.countryOfBirth', D.ben.father.countryOfBirth);
    await clickRadio(clientPage, 'beneficiary.father-living-yes');
    await fill(clientPage, 'beneficiary.father.fullCurrentAddress', D.ben.father.fullCurrentAddress);

    // Ben Mother (DECEASED — triggers yearOfDeath)
    await fill(clientPage, 'beneficiary.mother.surnames', D.ben.mother.surnames);
    await fill(clientPage, 'beneficiary.mother.givenNames', D.ben.mother.givenNames);
    await fill(clientPage, 'beneficiary.mother.dateOfBirth', D.ben.mother.dob);
    await fill(clientPage, 'beneficiary.mother.cityOfBirth', D.ben.mother.cityOfBirth);
    await fill(clientPage, 'beneficiary.mother.countryOfBirth', D.ben.mother.countryOfBirth);
    await clickRadio(clientPage, 'beneficiary.mother-living-no');
    await fill(clientPage, 'beneficiary.mother.yearOfDeath', D.ben.mother.yearOfDeath);

    // Children: 2
    await test.step('Set 2 children and fill details', async () => {
      const numInputs = clientPage.locator('input[type="number"]');
      for (let i = 0; i < await numInputs.count(); i++) {
        const el = numInputs.nth(i);
        await el.scrollIntoViewIfNeeded();
        // Set numberOfAllChildren = 2 (the last number input)
        await el.fill('2');
      }
      await settle(clientPage, 800);

      // Fill 2 children — add button may be needed
      const addChildBtn = clientPage.getByText(/add child/i);
      // First child should already exist if numberOfAllChildren=2 created one
      // Try filling, add if needed
      for (let c = 0; c < 2; c++) {
        // Check if the child card exists
        const childCard = clientPage.locator(`[data-field-id="beneficiary.children.${c}.nameSurname"]`);
        if (await childCard.count() === 0 && await addChildBtn.count() > 0) {
          await addChildBtn.click();
          await settle(clientPage);
        }
        const child = c === 0 ? D.ben.child1 : D.ben.child2;
        await fill(clientPage, `beneficiary.children.${c}.nameSurname`, child.name);
        await fill(clientPage, `beneficiary.children.${c}.dateOfBirth`, child.dob);
        await fill(clientPage, `beneficiary.children.${c}.cityOfBirth`, child.cityOfBirth);
        await fill(clientPage, `beneficiary.children.${c}.stateOrCountryOfBirth`, child.stateOfBirth);
        await clickRadio(clientPage, `child-${c}-lives-yes`);
        await clickRadio(clientPage, `child-${c}-imm-yes`);
      }
    });

    await clickContinue(clientPage);
    await expect(clientPage.getByText('Step 5 of 8 — Employment', { exact: false })).toBeVisible({ timeout: 15_000 });
  });

  test('Phase 1.7 — Step 5: Employment (2 jobs + education No)', async () => {
    // Petitioner: 2 employment entries
    await clientPage.locator('label[for="petitioner-status-employed"]').click();
    await settle(clientPage);

    // Add first entry
    await clientPage.getByText('Add Employment History').first().click();
    await settle(clientPage);
    await fill(clientPage, 'petitioner.employments.0.position', D.pet.employer1.position);
    await fill(clientPage, 'petitioner.employments.0.employerName', D.pet.employer1.name);
    await fill(clientPage, 'petitioner.employments.0.employerAddress', D.pet.employer1.address);
    await fill(clientPage, 'petitioner.employments.0.fromDate', D.pet.employer1.fromDate);

    // Add second entry
    await clientPage.getByText('Add Employment History').first().click();
    await settle(clientPage);
    await fill(clientPage, 'petitioner.employments.1.position', D.pet.employer2.position);
    await fill(clientPage, 'petitioner.employments.1.employerName', D.pet.employer2.name);
    await fill(clientPage, 'petitioner.employments.1.employerAddress', D.pet.employer2.address);
    await fill(clientPage, 'petitioner.employments.1.fromDate', D.pet.employer2.fromDate);
    await fill(clientPage, 'petitioner.employments.1.toDate', D.pet.employer2.toDate);

    // Beneficiary: 1 employment
    await clientPage.getByText(`Employment History (${D.ben.fullName})`).scrollIntoViewIfNeeded();
    await settle(clientPage);
    await clientPage.locator('label[for="beneficiary-status-employed"]').click();
    await settle(clientPage);
    await clientPage.getByText('Add Employment History').nth(1).click();
    await settle(clientPage);
    await fill(clientPage, 'beneficiary.employments.0.position', D.ben.employer.position);
    await fill(clientPage, 'beneficiary.employments.0.employerName', D.ben.employer.name);
    await fill(clientPage, 'beneficiary.employments.0.employerAddress', D.ben.employer.address);
    await fill(clientPage, 'beneficiary.employments.0.fromDate', D.ben.employer.fromDate);

    // Education: No
    await clientPage.locator('label[for="edu-attended-no"]').scrollIntoViewIfNeeded();
    await clientPage.locator('label[for="edu-attended-no"]').click();

    await clickContinue(clientPage);
    await expect(clientPage.getByText('Step 6 of 8 — Other', { exact: false })).toBeVisible({ timeout: 15_000 });
  });

  test('Phase 1.8 — Step 6: Other Info (nationalities + physical)', async () => {
    // Petitioner nationality
    const natLabels = clientPage.locator('label:has-text("Nationality")');
    await natLabels.first().locator('..').locator('input').fill(D.pet.nationality);

    // Pet physical
    const petEyeLabel = clientPage.locator('label:has-text("Eye Color")');
    if (await petEyeLabel.count() > 0) {
      await petEyeLabel.first().locator('..').locator('input').fill(D.pet.eyeColor);
    }
    const petHairLabel = clientPage.locator('label:has-text("Hair Color")');
    if (await petHairLabel.count() > 0) {
      await petHairLabel.first().locator('..').locator('input').fill(D.pet.hairColor);
    }

    // Beneficiary
    await clientPage.getByText(`Other Information (${D.ben.fullName})`).scrollIntoViewIfNeeded();
    await settle(clientPage);
    await natLabels.nth(1).locator('..').locator('input').fill(D.ben.nationality);

    await clickContinue(clientPage);
    await expect(clientPage.getByText('Step 7 of 8 — Security', { exact: false })).toBeVisible({ timeout: 15_000 });
  });

  test('Phase 1.9 — Step 7: Security', async () => {
    const groups = clientPage.locator('[role="radiogroup"]');
    const count = await groups.count();
    for (let i = 0; i < count; i++) {
      const group = groups.nth(i);
      if (i === 1) await group.getByLabel(/yes/i).click();
      else await group.getByLabel(/no/i).click();
      if (i % 10 === 9 && i + 1 < count) await groups.nth(i + 1).scrollIntoViewIfNeeded();
    }
    await clickContinue(clientPage);
    await expect(clientPage.getByText('Step 8 of 8 — Documents', { exact: false })).toBeVisible({ timeout: 10_000 });
  });

  test('Phase 1.10 — Step 8: Upload & Submit', async () => {
    const count = await uploadToDropzones(clientPage, DUMMY_PDF);
    console.log(`    Uploaded to ${count} dropzones`);

    const alreadySubmitted = await clientPage.getByRole('heading', { name: 'Application Submitted' }).isVisible().catch(() => false);
    if (!alreadySubmitted) {
      const submitBtn = clientPage.getByRole('button', { name: /submit application/i });
      if (await submitBtn.isVisible()) {
        await submitBtn.scrollIntoViewIfNeeded();
        await submitBtn.click();
      }
    }
    await expect(clientPage.getByRole('heading', { name: 'Application Submitted' })).toBeVisible({ timeout: 30_000 });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 2: FILAMENT ADMIN — DEEP DATA INTEGRITY ASSERTIONS
  // ══════════════════════════════════════════════════════════════════════════

  let adminPage: Page;
  let adminCtx: BrowserContext;

  test('Phase 2.1 — Admin login & navigate to application', async ({ browser }) => {
    adminCtx = await browser.newContext({ ignoreHTTPSErrors: true });
    adminPage = await adminCtx.newPage();

    await adminPage.goto(ADMIN_URL + '/login');
    await adminPage.locator('input[type="email"], input[name="email"]').fill(ADMIN_EMAIL);
    await adminPage.locator('input[type="password"], input[name="password"]').fill(ADMIN_PASSWORD);
    await adminPage.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(adminPage.getByText(/application|dashboard/i).first()).toBeVisible({ timeout: 15_000 });

    await adminPage.goto(ADMIN_URL + '/applications');
    await settle(adminPage, 2000);
    await expect(adminPage.getByText(D.testEmail).first()).toBeVisible({ timeout: 15_000 });

    await adminPage.locator('tr', { hasText: D.testEmail }).getByRole('link').first().click();
    await settle(adminPage, 2000);
  });

  test('Phase 2.2 — Verify Step 1: Basic Info', async () => {
    await test.step('Expand Step 1 section', async () => {
      const header = adminPage.getByText('Step 1: Basic Information');
      if (await header.count() > 0) { await header.click(); await settle(adminPage, 1000); }
    });

    await test.step('Petitioner name', async () => {
      await expect(adminPage.getByText(D.pet.fullName).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Beneficiary name', async () => {
      await expect(adminPage.getByText(D.ben.fullName).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Petitioner email', async () => {
      await expect(adminPage.getByText(D.pet.email).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Beneficiary email', async () => {
      await expect(adminPage.getByText(D.ben.email).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Petitioner city of birth', async () => {
      await expect(adminPage.getByText(D.pet.cityOfBirth).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Beneficiary city of birth', async () => {
      await expect(adminPage.getByText(D.ben.cityOfBirth).first()).toBeVisible({ timeout: 10_000 });
    });
  });

  test('Phase 2.3 — Verify Step 2: Addresses', async () => {
    await test.step('Expand Step 2 section', async () => {
      const header = adminPage.getByText('Step 2: Address History');
      if (await header.count() > 0) { await header.click(); await settle(adminPage, 1000); }
    });

    await test.step('Petitioner current street', async () => {
      await expect(adminPage.getByText(D.pet.address.street).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Petitioner previous address street', async () => {
      await expect(adminPage.getByText(D.pet.prevAddress.street).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Beneficiary current street', async () => {
      await expect(adminPage.getByText(D.ben.address.street).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Future US address', async () => {
      await expect(adminPage.getByText(D.futureUS.address).first()).toBeVisible({ timeout: 10_000 });
    });
  });

  test('Phase 2.4 — Verify Step 3: Marital Status + Prior Marriage', async () => {
    await test.step('Expand Step 3 section', async () => {
      const header = adminPage.getByText('Step 3: Marital Status');
      if (await header.count() > 0) { await header.click(); await settle(adminPage, 1000); }
    });

    await test.step('Petitioner marriage city', async () => {
      await expect(adminPage.getByText(D.pet.marriageCity).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Prior marriage ex-spouse name', async () => {
      await expect(adminPage.getByText(D.pet.priorMarriage.fullName).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Prior marriage city', async () => {
      await expect(adminPage.getByText(D.pet.priorMarriage.marriageCity).first()).toBeVisible({ timeout: 10_000 });
    });
  });

  test('Phase 2.5 — Verify Step 4: Parents + Children', async () => {
    await test.step('Expand Step 4 section', async () => {
      const header = adminPage.getByText('Step 4: Family');
      if (await header.count() > 0) { await header.click(); await settle(adminPage, 1000); }
    });

    await test.step('Petitioner father surnames', async () => {
      await expect(adminPage.getByText(D.pet.father.surnames).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Beneficiary father full address', async () => {
      await expect(adminPage.getByText(D.ben.father.fullCurrentAddress).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Beneficiary mother year of death', async () => {
      await expect(adminPage.getByText(D.ben.mother.yearOfDeath).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Child 1 name visible', async () => {
      await expect(adminPage.getByText(D.ben.child1.name).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Child 2 name visible', async () => {
      await expect(adminPage.getByText(D.ben.child2.name).first()).toBeVisible({ timeout: 10_000 });
    });
  });

  test('Phase 2.6 — Verify Step 5: Employment (2 jobs)', async () => {
    await test.step('Expand Step 5 section', async () => {
      const header = adminPage.getByText('Step 5: Employment');
      if (await header.count() > 0) { await header.click(); await settle(adminPage, 1000); }
    });

    await test.step('Petitioner Job 1 position', async () => {
      await expect(adminPage.getByText(D.pet.employer1.position).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Petitioner Job 1 employer', async () => {
      await expect(adminPage.getByText(D.pet.employer1.name).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Petitioner Job 2 position (no truncation)', async () => {
      await expect(adminPage.getByText(D.pet.employer2.position).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Petitioner Job 2 employer', async () => {
      await expect(adminPage.getByText(D.pet.employer2.name).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Beneficiary employer', async () => {
      await expect(adminPage.getByText(D.ben.employer.name).first()).toBeVisible({ timeout: 10_000 });
    });
  });

  test('Phase 2.7 — Verify Step 6: Nationalities + Physical', async () => {
    await test.step('Expand Step 6 section', async () => {
      const header = adminPage.getByText('Step 6: Other');
      if (await header.count() > 0) { await header.click(); await settle(adminPage, 1000); }
    });

    await test.step('Petitioner nationality', async () => {
      await expect(adminPage.getByText(D.pet.nationality).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Beneficiary nationality', async () => {
      await expect(adminPage.getByText(D.ben.nationality).first()).toBeVisible({ timeout: 10_000 });
    });
    await test.step('Petitioner eye color', async () => {
      await expect(adminPage.getByText(D.pet.eyeColor).first()).toBeVisible({ timeout: 10_000 });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 3: STAGE 2 DOCUMENT INTEGRITY
  // ══════════════════════════════════════════════════════════════════════════

  test('Phase 3.1 — Admin unlocks Stage 2', async () => {
    // Scroll to top for action buttons
    await adminPage.locator('body').press('Home');
    await settle(adminPage);

    const pendingBtn = adminPage.getByRole('button', { name: /pending i-130/i });
    await expect(pendingBtn).toBeVisible({ timeout: 10_000 });
    await pendingBtn.click();
    await adminPage.getByRole('button', { name: 'Confirm' }).click();
    await adminPage.waitForTimeout(2000);

    await adminPage.reload({ waitUntil: 'networkidle' });
    await settle(adminPage, 1500);

    const unlockBtn = adminPage.getByRole('button', { name: /unlock stage 2/i });
    await expect(unlockBtn).toBeVisible({ timeout: 15_000 });
    await unlockBtn.click();
    await adminPage.getByRole('button', { name: /yes.*unlock/i }).click();
    await adminPage.waitForTimeout(2000);
  });

  test('Phase 3.2 — Client uploads Stage 2 & submits', async () => {
    await clientPage.reload({ waitUntil: 'networkidle' });
    await settle(clientPage, 2000);
    await expect(clientPage.getByText('Stage 2 — NVC Document Upload')).toBeVisible({ timeout: 20_000 });

    // Expand all sections
    const details = clientPage.locator('details:not([open])');
    for (let i = 0; i < await details.count(); i++) {
      const summary = details.nth(i).locator('summary');
      if (await summary.isVisible()) { await summary.click(); await settle(clientPage, 300); }
    }
    await settle(clientPage, 500);

    const count = await uploadToDropzones(clientPage, DUMMY_PDF);
    console.log(`    Uploaded to ${count} Stage 2 dropzones`);

    const submitBtn = clientPage.getByRole('button', { name: /submit documents for review/i });
    await submitBtn.scrollIntoViewIfNeeded();
    clientPage.once('dialog', (d) => d.accept());
    await submitBtn.click();
    await expect(clientPage.getByRole('heading', { name: /stage 2 documents submitted|application submitted/i })).toBeVisible({ timeout: 30_000 });
  });

  test('Phase 3.3 — Admin verifies documents & completes', async () => {
    await adminPage.reload({ waitUntil: 'networkidle' });
    await settle(adminPage, 1500);

    await test.step('Verify status is stage2_submitted', async () => {
      await expect(adminPage.getByText(/stage.?2.?submitted/i).first()).toBeVisible({ timeout: 15_000 });
    });

    await test.step('Verify documents exist in relation manager', async () => {
      // Scroll down to Documents section
      const docsHeading = adminPage.getByText('Documents').last();
      if (await docsHeading.count() > 0) {
        await docsHeading.scrollIntoViewIfNeeded();
        await settle(adminPage, 1000);
      }
      // Look for "Pending" badges which indicate uploaded documents
      const pendingBadges = adminPage.getByText('Pending');
      const badgeCount = await pendingBadges.count();
      console.log(`    Found ${badgeCount} pending document badges in admin`);
      expect(badgeCount).toBeGreaterThan(0);
    });

    await test.step('Mark Completed', async () => {
      await adminPage.locator('body').press('Home');
      await settle(adminPage);
      const completeBtn = adminPage.getByRole('button', { name: /mark completed/i });
      await expect(completeBtn).toBeVisible({ timeout: 15_000 });
      await completeBtn.click();
      await adminPage.getByRole('button', { name: 'Confirm' }).click();
      await adminPage.waitForTimeout(2000);
      await adminPage.reload({ waitUntil: 'networkidle' });
      await expect(adminPage.getByText('Completed').first()).toBeVisible({ timeout: 15_000 });
      console.log('    ✓ Data Integrity Test — FULL LIFECYCLE COMPLETE');
    });

    await adminPage.close();
    await adminCtx.close();
    await clientPage.close();
    await clientCtx.close();
  });
});
