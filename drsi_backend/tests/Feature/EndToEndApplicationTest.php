<?php

namespace Tests\Feature;

use App\Mail\OtpMail;
use App\Mail\Stage1SubmittedAdminMail;
use App\Mail\Stage2UnlockedMail;
use App\Models\Application;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EndToEndApplicationTest extends TestCase
{
    use RefreshDatabase;

    // ─── Shared state across ordered tests ───
    private static string $testEmail = 'e2e-client@example.com';
    private static string $adminEmail = 'meir@drsi.com';

    // =========================================================================
    //  TEST 1 — OTP & Auth: Send OTP → Verify → Receive Sanctum Token
    // =========================================================================
    public function test_1_otp_send_dispatches_email_and_creates_code(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/auth/send-otp', [
            'email' => self::$testEmail,
        ]);

        $response->assertOk()
            ->assertJsonFragment(['message' => 'OTP sent to your email.']);

        // Assert OTP email was dispatched
        Mail::assertSent(OtpMail::class, function (OtpMail $mail) {
            return $mail->hasTo(self::$testEmail);
        });

        // Assert OTP code exists in database
        $this->assertDatabaseHas('otp_codes', [
            'email' => self::$testEmail,
            'used' => false,
        ]);
    }

    public function test_1b_invalid_otp_is_rejected(): void
    {
        // Create a valid code first
        OtpCode::create([
            'email' => self::$testEmail,
            'code' => '123456',
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->postJson('/api/auth/verify-otp', [
            'email' => self::$testEmail,
            'code' => '000000', // wrong code
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Invalid or expired OTP.']);
    }

    public function test_1c_valid_otp_returns_sanctum_token(): void
    {
        Mail::fake();

        $code = '654321';
        OtpCode::create([
            'email' => self::$testEmail,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->postJson('/api/auth/verify-otp', [
            'email' => self::$testEmail,
            'code' => $code,
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'token',
                'user' => ['id', 'name', 'email'],
            ]);

        $this->assertEquals(self::$testEmail, $response->json('user.email'));
        $this->assertNotEmpty($response->json('token'));

        // OTP should now be marked as used
        $this->assertDatabaseHas('otp_codes', [
            'email' => self::$testEmail,
            'code' => $code,
            'used' => true,
        ]);
    }

    public function test_1d_authenticated_user_endpoint_works(): void
    {
        $user = User::factory()->create(['email' => 'authcheck@example.com']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->getJson('/api/user', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertOk()
            ->assertJsonFragment(['email' => 'authcheck@example.com']);
    }

    public function test_1e_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/application');

        $response->assertStatus(401);
    }

    // =========================================================================
    //  TEST 2 — Autosave Integrity: Large Nested JSON Roundtrip
    // =========================================================================
    public function test_2_save_progress_persists_full_nested_form_data(): void
    {
        $user = User::factory()->create(['email' => 'save-test@example.com']);
        $token = $user->createToken('test')->plainTextToken;

        // Build a realistic, deeply nested form_data payload matching frontend Zustand store
        $payload = $this->buildFullFormPayload();

        $response = $this->putJson('/api/application/save-progress', [
            'form_data' => $payload,
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertOk()
            ->assertJsonFragment(['message' => 'Progress saved.'])
            ->assertJsonFragment(['status' => 'draft']);

        // Now fetch and assert perfect roundtrip
        $getResponse = $this->getJson('/api/application', [
            'Authorization' => "Bearer {$token}",
        ]);

        $getResponse->assertOk();
        $returnedData = $getResponse->json('form_data');

        // ── Deep equality assertions on every major key ──
        $this->assertEquals($payload['petitioner'], $returnedData['petitioner'], 'Petitioner data mismatch');
        $this->assertEquals($payload['beneficiary'], $returnedData['beneficiary'], 'Beneficiary data mismatch');
        $this->assertEquals($payload['petitionerAddress'], $returnedData['petitionerAddress'], 'Petitioner address mismatch');
        $this->assertEquals($payload['beneficiaryAddress'], $returnedData['beneficiaryAddress'], 'Beneficiary address mismatch');
        $this->assertEquals($payload['futureUSAddress'], $returnedData['futureUSAddress'], 'Future US address mismatch');
        $this->assertEquals($payload['step3Data'], $returnedData['step3Data'], 'Step 3 marital data mismatch');
        $this->assertEquals($payload['step5Data'], $returnedData['step5Data'], 'Step 5 employment data mismatch');
        $this->assertEquals($payload['step6Data'], $returnedData['step6Data'], 'Step 6 other info mismatch');
        $this->assertEquals($payload['step7Data'], $returnedData['step7Data'], 'Step 7 security data mismatch');
        $this->assertEquals($payload['caseType'], $returnedData['caseType'], 'caseType mismatch');
        $this->assertEquals($payload['petitionerCitizenshipStatus'], $returnedData['petitionerCitizenshipStatus'], 'citizenshipStatus mismatch');
        $this->assertEquals($payload['currentStep'], $returnedData['currentStep'], 'currentStep mismatch');
    }

    public function test_2b_save_progress_overwrites_on_second_put(): void
    {
        $user = User::factory()->create(['email' => 'overwrite@example.com']);
        $token = $user->createToken('test')->plainTextToken;

        // First save
        $this->putJson('/api/application/save-progress', [
            'form_data' => ['petitioner' => ['fullName' => 'John Doe'], 'currentStep' => 1],
        ], ['Authorization' => "Bearer {$token}"])->assertOk();

        // Second save with updated data
        $this->putJson('/api/application/save-progress', [
            'form_data' => ['petitioner' => ['fullName' => 'Jane Smith'], 'currentStep' => 3],
        ], ['Authorization' => "Bearer {$token}"])->assertOk();

        $response = $this->getJson('/api/application', [
            'Authorization' => "Bearer {$token}",
        ]);

        $this->assertEquals('Jane Smith', $response->json('form_data.petitioner.fullName'));
        $this->assertEquals(3, $response->json('form_data.currentStep'));

        // Should still be only 1 application row
        $this->assertEquals(1, Application::where('user_id', $user->id)->count());
    }

    // =========================================================================
    //  TEST 3 — Stage 1 Submit: Status Change + Admin Email Dispatched
    // =========================================================================
    public function test_3_submit_stage1_changes_status_and_notifies_admin(): void
    {
        Mail::fake();

        $user = User::factory()->create(['email' => 'submit-test@example.com']);
        $token = $user->createToken('test')->plainTextToken;

        // Must save form data first
        $this->putJson('/api/application/save-progress', [
            'form_data' => $this->buildFullFormPayload(),
        ], ['Authorization' => "Bearer {$token}"])->assertOk();

        // Submit Stage 1
        $response = $this->postJson('/api/application/submit-stage-1', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertOk()
            ->assertJsonFragment(['status' => 'stage1_submitted']);

        // Assert DB status
        $application = Application::where('user_id', $user->id)->first();
        $this->assertEquals('stage1_submitted', $application->status);
        $this->assertNotNull($application->stage1_submitted_at);

        // Assert admin notification email was dispatched
        Mail::assertSent(Stage1SubmittedAdminMail::class, function (Stage1SubmittedAdminMail $mail) {
            return $mail->hasTo(config('app.admin_email', 'meir@drsi.com'));
        });
    }

    public function test_3b_cannot_submit_twice(): void
    {
        Mail::fake();

        $user = User::factory()->create(['email' => 'double-submit@example.com']);
        $token = $user->createToken('test')->plainTextToken;

        $this->putJson('/api/application/save-progress', [
            'form_data' => ['petitioner' => ['fullName' => 'Test']],
        ], ['Authorization' => "Bearer {$token}"])->assertOk();

        // First submit
        $this->postJson('/api/application/submit-stage-1', [], [
            'Authorization' => "Bearer {$token}",
        ])->assertOk();

        // Second submit — should be rejected
        $response = $this->postJson('/api/application/submit-stage-1', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Application has already been submitted.']);
    }

    public function test_3c_cannot_submit_without_form_data(): void
    {
        $user = User::factory()->create(['email' => 'empty-submit@example.com']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->postJson('/api/application/submit-stage-1', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'No application data found. Please save your progress first.']);
    }

    // =========================================================================
    //  TEST 4 — Admin Unlock Stage 2: DB Update + Client Email Dispatched
    // =========================================================================
    public function test_4_admin_unlock_stage2_updates_status_and_emails_client(): void
    {
        Mail::fake();

        $clientUser = User::factory()->create(['email' => 'stage2-client@example.com']);

        // Simulate the full flow up to pending_i130
        $application = Application::create([
            'user_id' => $clientUser->id,
            'status' => 'pending_i130',
            'form_data' => $this->buildFullFormPayload(),
            'stage1_submitted_at' => now()->subDay(),
        ]);

        // Simulate admin action: unlock Stage 2
        $application->update(['status' => 'stage2_unlocked']);

        // Dispatch the email as the Filament action does
        Mail::to($clientUser->email)->send(new Stage2UnlockedMail($application->fresh()));

        // Assert DB state
        $this->assertEquals('stage2_unlocked', $application->fresh()->status);

        // Assert client notification email was dispatched
        Mail::assertSent(Stage2UnlockedMail::class, function (Stage2UnlockedMail $mail) use ($clientUser) {
            return $mail->hasTo($clientUser->email);
        });
    }

    public function test_4b_status_flow_integrity_draft_to_completed(): void
    {
        $user = User::factory()->create(['email' => 'flow@example.com']);

        $app = Application::create([
            'user_id' => $user->id,
            'status' => 'draft',
            'form_data' => ['petitioner' => ['fullName' => 'Flow Test']],
        ]);

        // draft → stage1_submitted
        $app->update(['status' => 'stage1_submitted', 'stage1_submitted_at' => now()]);
        $this->assertEquals('stage1_submitted', $app->fresh()->status);

        // stage1_submitted → pending_i130
        $app->update(['status' => 'pending_i130']);
        $this->assertEquals('pending_i130', $app->fresh()->status);

        // pending_i130 → stage2_unlocked
        $app->update(['status' => 'stage2_unlocked']);
        $this->assertEquals('stage2_unlocked', $app->fresh()->status);

        // stage2_unlocked → completed
        $app->update(['status' => 'completed']);
        $this->assertEquals('completed', $app->fresh()->status);
    }

    public function test_4c_application_hydrate_includes_documents_array(): void
    {
        $user = User::factory()->create(['email' => 'docs-hydrate@example.com']);
        $token = $user->createToken('test')->plainTextToken;

        $this->putJson('/api/application/save-progress', [
            'form_data' => ['petitioner' => ['fullName' => 'Doc Test']],
        ], ['Authorization' => "Bearer {$token}"])->assertOk();

        $response = $this->getJson('/api/application', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'id',
                'status',
                'form_data',
                'documents',
            ]);

        // Documents should be an empty array (no uploads yet)
        $this->assertIsArray($response->json('documents'));
        $this->assertCount(0, $response->json('documents'));
    }

    public function test_4d_new_user_gets_null_application(): void
    {
        $user = User::factory()->create(['email' => 'fresh@example.com']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->getJson('/api/application', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertOk()
            ->assertJson([
                'status' => null,
                'form_data' => null,
                'documents' => [],
            ]);
    }

    // =========================================================================
    //  HELPER — Build a realistic full form_data payload
    // =========================================================================
    private function buildFullFormPayload(): array
    {
        return [
            'caseType' => 'spouse',
            'petitionerCitizenshipStatus' => 'citizen',
            'currentStep' => 7,
            'petitioner' => [
                'fullName' => 'John Andrew Petitioner',
                'relationship' => 'Husband',
                'phoneCountryCode' => '+1',
                'phoneNumber' => '3105551234',
                'email' => 'john.petitioner@example.com',
                'dateOfBirth' => '06/15/1985',
                'cityOfBirth' => 'Los Angeles',
                'countryOfBirth' => 'United States',
                'socialSecurityNumber' => '123-45-6789',
                'aNumber' => '',
                'additionalPhones' => [],
                'additionalEmails' => [],
            ],
            'beneficiary' => [
                'fullName' => 'Maria Elena Beneficiary',
                'relationship' => 'Wife',
                'phoneCountryCode' => '+374',
                'phoneNumber' => '91234567',
                'email' => 'maria.beneficiary@example.com',
                'dateOfBirth' => '03/22/1990',
                'cityOfBirth' => 'Yerevan',
                'countryOfBirth' => 'Armenia',
                'socialSecurityNumber' => '',
                'aNumber' => 'A123456789',
                'additionalPhones' => [
                    ['countryCode' => '+374', 'number' => '98765432'],
                ],
                'additionalEmails' => ['maria.alt@example.com'],
            ],
            'petitionerAddress' => [
                'currentAddress' => [
                    'street' => '123 Main Street',
                    'floorAptSuite' => 'Apt 4B',
                    'city' => 'Los Angeles',
                    'zip' => '90001',
                    'stateOrCountry' => 'California',
                    'startDate' => '01/01/2020',
                    'endDate' => '',
                ],
                'previousAddresses' => [
                    [
                        'street' => '456 Old Road',
                        'floorAptSuite' => '',
                        'city' => 'San Diego',
                        'zip' => '92101',
                        'stateOrCountry' => 'California',
                        'startDate' => '06/01/2017',
                        'endDate' => '12/31/2019',
                    ],
                ],
                'livedInOtherCountryOver6Months' => false,
                'livedInOtherCountryDetails' => [],
            ],
            'beneficiaryAddress' => [
                'currentAddress' => [
                    'street' => '15 Abovyan Street',
                    'floorAptSuite' => 'Floor 3',
                    'city' => 'Yerevan',
                    'zip' => '0001',
                    'stateOrCountry' => 'Armenia',
                    'startDate' => '05/01/2015',
                    'endDate' => '',
                ],
                'previousAddresses' => [],
                'livedInOtherCountryOver6Months' => true,
                'livedInOtherCountryDetails' => [
                    ['country' => 'Russia', 'duration' => '2 years'],
                ],
            ],
            'futureUSAddress' => [
                'nameOfPersonLiving' => 'John Andrew Petitioner',
                'address' => '123 Main Street',
                'floorAptSuite' => 'Apt 4B',
                'city' => 'Los Angeles',
                'state' => 'California',
                'zipCode' => '90001',
                'phoneCountryCode' => '+1',
                'phoneNumber' => '3105551234',
                'isGreenCardDeliveryAddress' => true,
                'contactPerson' => '',
                'contactStreet' => '',
                'contactFloorAptSuite' => '',
                'contactCity' => '',
                'contactState' => '',
                'contactZip' => '',
                'contactPhoneCountryCode' => '',
                'contactPhone' => '',
            ],
            'step3Data' => [
                'petitioner' => [
                    'maritalStatus' => [
                        'timesMarried' => 1,
                        'currentMarriage' => [
                            'date' => '09/15/2022',
                            'city' => 'Los Angeles',
                            'country' => 'United States',
                            'spouseName' => 'Maria Elena Beneficiary',
                            'spouseDateOfBirth' => '03/22/1990',
                        ],
                        'priorMarriages' => [],
                    ],
                    'father' => [
                        'surnames' => 'Petitioner',
                        'givenNames' => 'Robert',
                        'dateOfBirth' => '11/03/1955',
                        'cityOfBirth' => 'New York',
                        'countryOfBirth' => 'United States',
                        'isLiving' => true,
                        'currentCity' => 'Los Angeles',
                        'currentCountry' => 'United States',
                    ],
                    'mother' => [
                        'surnames' => 'Petitioner',
                        'givenNames' => 'Susan',
                        'dateOfBirth' => '02/14/1958',
                        'cityOfBirth' => 'Chicago',
                        'countryOfBirth' => 'United States',
                        'isLiving' => true,
                        'currentCity' => 'Chicago',
                        'currentCountry' => 'United States',
                    ],
                    'numberOfDependentChildren' => 0,
                ],
                'beneficiary' => [
                    'maritalStatus' => [
                        'timesMarried' => 1,
                        'currentMarriage' => [
                            'date' => '09/15/2022',
                            'city' => 'Los Angeles',
                            'country' => 'United States',
                            'spouseName' => 'John Andrew Petitioner',
                            'spouseDateOfBirth' => '06/15/1985',
                        ],
                        'priorMarriages' => [],
                    ],
                    'father' => [
                        'surnames' => 'Beneficiaryan',
                        'givenNames' => 'Armen',
                        'dateOfBirth' => '08/20/1960',
                        'cityOfBirth' => 'Yerevan',
                        'countryOfBirth' => 'Armenia',
                        'isLiving' => false,
                        'fullCurrentAddress' => '',
                        'yearOfDeath' => '2018',
                    ],
                    'mother' => [
                        'surnames' => 'Beneficiaryan',
                        'surnamesAtBirth' => 'Hovhannisyan',
                        'givenNames' => 'Anahit',
                        'dateOfBirth' => '04/10/1963',
                        'cityOfBirth' => 'Yerevan',
                        'countryOfBirth' => 'Armenia',
                        'isLiving' => true,
                        'fullCurrentAddress' => '22 Tumanyan St, Yerevan, Armenia 0001',
                        'yearOfDeath' => '',
                    ],
                    'childrenSameAsPetitioner' => true,
                    'numberOfAllChildren' => 0,
                    'children' => [],
                ],
            ],
            'step5Data' => [
                'petitioner' => [
                    'employments' => [
                        [
                            'position' => 'Software Engineer',
                            'employerName' => 'TechCorp Inc.',
                            'employerAddress' => '789 Tech Blvd, San Francisco, CA 94102',
                            'fromDate' => '03/01/2019',
                            'toDate' => '',
                        ],
                    ],
                    'currentEmploymentStatus' => 'employed',
                    'petitionerSalary' => '125000',
                ],
                'beneficiary' => [
                    'employments' => [
                        [
                            'position' => 'Graphic Designer',
                            'employerName' => 'Design Studio Yerevan',
                            'employerAddress' => '5 Mashtots Ave, Yerevan, Armenia',
                            'fromDate' => '09/01/2016',
                            'toDate' => '12/31/2023',
                        ],
                    ],
                    'currentEmploymentStatus' => 'unemployed',
                    'intendedJobFieldInUS' => 'Graphic Design / UX',
                    'attendedUniversityOrHighSchool' => true,
                    'numberOfInstitutions' => 1,
                    'institutions' => [
                        [
                            'name' => 'Yerevan State University',
                            'address' => '1 Alex Manoogian St, Yerevan, Armenia',
                            'major' => 'Fine Arts',
                            'degree' => 'Bachelor of Arts',
                            'fromDate' => '09/01/2008',
                            'toDate' => '06/30/2012',
                        ],
                    ],
                    'beneficiarySalary' => '18000',
                ],
            ],
            'step6Data' => [
                'petitioner' => [
                    'nationalities' => [
                        ['nationality' => 'United States', 'passportNumber' => 'US12345678'],
                    ],
                    'eyeColor' => 'Brown',
                    'hairColor' => 'Black',
                    'heightFeet' => '5.11',
                    'weightPounds' => '180',
                    'appliedForGreenCardBefore' => '',
                    'howBecameUSCitizen' => 'birth_in_us',
                ],
                'beneficiary' => [
                    'nationalities' => [
                        ['nationality' => 'Armenia', 'passportNumber' => 'AM9876543'],
                    ],
                    'eyeColor' => 'Green',
                    'hairColor' => 'Brown',
                    'heightFeet' => '5.6',
                    'weightPounds' => '130',
                    'appliedForGreenCardBefore' => 'No',
                    'militaryBranch' => '',
                    'militaryDates' => '',
                    'militaryRank' => '',
                    'militaryPosition' => '',
                    'militaryCountry' => '',
                    'traveledToCountriesLast5Years' => 'Russia, Georgia',
                    'usVisaDateIssued' => '',
                    'usVisaClassification' => '',
                    'usVisaNumber' => '',
                    'usVisaLostStolenExplain' => '',
                    'usVisaCanceledRevokedExplain' => '',
                    'last5USVisits' => [],
                    'belongedToOrganizations' => false,
                    'specializedSkills' => false,
                    'paramilitaryInvolvement' => false,
                    'speakOtherLanguages' => true,
                    'languagesSpoken' => 'English, Russian',
                    'organizationsSkills' => '',
                    'wantSSAIssueSSN' => true,
                    'authorizeDisclosureDHS' => true,
                    'socialMediaFacebook' => 'maria.beneficiary',
                    'socialMediaInstagram' => '@maria_b',
                    'socialMediaLinkedIn' => '',
                    'socialMediaTwitter' => '',
                ],
            ],
            'step7Data' => [
                'securityAnswers' => [
                    ['answer' => false, 'explanation' => ''],
                    ['answer' => true, 'explanation' => ''],  // vaccination: yes
                    ['answer' => false, 'explanation' => ''],
                    ['answer' => false, 'explanation' => ''],
                    ['answer' => false, 'explanation' => ''],
                    ['answer' => false, 'explanation' => ''],
                    ['answer' => false, 'explanation' => ''],
                    ['answer' => false, 'explanation' => ''],
                    ['answer' => false, 'explanation' => ''],
                    ['answer' => false, 'explanation' => ''],
                ],
            ],
            'step8Documents' => [
                'uploads' => [],
            ],
        ];
    }
}
