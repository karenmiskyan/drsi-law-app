<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Application #{{ $application->id }} — DRSI Law</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11px; color: #1a1a1a; line-height: 1.5; }

        .header { text-align: center; padding: 20px 0 15px; border-bottom: 3px solid #b72b2b; margin-bottom: 20px; }
        .header h1 { font-size: 18px; color: #b72b2b; margin-bottom: 4px; letter-spacing: 1px; }
        .header h2 { font-size: 13px; color: #333; font-weight: normal; }
        .header .meta { font-size: 10px; color: #666; margin-top: 8px; }

        .section { margin-bottom: 18px; page-break-inside: avoid; }
        .section-title { background: #b72b2b; color: #fff; font-size: 12px; font-weight: bold; padding: 6px 12px; margin-bottom: 0; }
        .section-body { border: 1px solid #ddd; border-top: none; padding: 10px 12px; }

        .subsection { margin-bottom: 10px; }
        .subsection-title { font-size: 11px; font-weight: bold; color: #b72b2b; border-bottom: 1px solid #eee; padding-bottom: 3px; margin-bottom: 6px; }

        table.fields { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        table.fields td { padding: 3px 6px; vertical-align: top; }
        table.fields td.label { font-weight: bold; color: #555; width: 35%; font-size: 10px; text-transform: uppercase; }
        table.fields td.value { color: #1a1a1a; }

        table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10px; }
        table.data-table th { background: #f5f5f5; border: 1px solid #ddd; padding: 4px 6px; text-align: left; font-size: 9px; text-transform: uppercase; color: #555; }
        table.data-table td { border: 1px solid #ddd; padding: 4px 6px; }

        .two-col { display: table; width: 100%; }
        .two-col .col { display: table-cell; width: 50%; vertical-align: top; padding-right: 10px; }
        .two-col .col:last-child { padding-right: 0; padding-left: 10px; }

        .footer { text-align: center; font-size: 9px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; }
        .badge { display: inline-block; padding: 2px 8px; font-size: 9px; font-weight: bold; border-radius: 3px; text-transform: uppercase; }
        .badge-draft { background: #e5e7eb; color: #374151; }
        .badge-submitted { background: #fef3c7; color: #92400e; }
        .badge-pending { background: #dbeafe; color: #1e40af; }
        .badge-unlocked { background: #d1fae5; color: #065f46; }
        .badge-completed { background: #ede9fe; color: #5b21b6; }

        .page-break { page-break-before: always; }
    </style>
</head>
<body>

@php
    $fd = $application->form_data ?? [];
    $pet = $fd['petitioner'] ?? [];
    $ben = $fd['beneficiary'] ?? [];

    // Helper: safely print a value — if it's an array/object, return '—'
    function pv($val, $default = '—') {
        if (is_array($val) || is_object($val)) return $default;
        return e($val !== '' && $val !== null ? $val : $default);
    }

    // Helper: format boolean
    function pb($val) {
        if ($val === true || $val === 'true') return 'Yes';
        if ($val === false || $val === 'false') return 'No';
        return '—';
    }
@endphp

<div class="header">
    <h1>D. R. SKLAR & ASSOCIATES IMMIGRATION LAW OFFICES</h1>
    <h2>Family Immigration Petition Questionnaire — Application #{{ $application->id }}</h2>
    <div class="meta">
        Client: {{ $application->user->email ?? '—' }} &nbsp;|&nbsp;
        Status: <span class="badge
            @if($application->status === 'draft') badge-draft
            @elseif($application->status === 'stage1_submitted') badge-submitted
            @elseif($application->status === 'pending_i130') badge-pending
            @elseif($application->status === 'stage2_unlocked') badge-unlocked
            @elseif($application->status === 'stage2_submitted') badge-submitted
            @else badge-completed
            @endif
        ">{{ str_replace('_', ' ', $application->status) }}</span>
        &nbsp;|&nbsp;
        Generated: {{ now()->format('M d, Y H:i') }}
    </div>
</div>

{{-- STEP 1: BASIC INFORMATION --}}
<div class="section">
    <div class="section-title">Step 1: Basic Information</div>
    <div class="section-body">
        <div class="two-col">
            <div class="col">
                <div class="subsection">
                    <div class="subsection-title">Petitioner (US Citizen)</div>
                    <table class="fields">
                        <tr><td class="label">Full Name</td><td class="value">{!! pv($pet['fullName'] ?? null) !!}</td></tr>
                        <tr><td class="label">Relationship</td><td class="value">{!! pv($pet['relationship'] ?? null) !!}</td></tr>
                        <tr><td class="label">Date of Birth</td><td class="value">{!! pv($pet['dateOfBirth'] ?? null) !!}</td></tr>
                        <tr><td class="label">City of Birth</td><td class="value">{!! pv($pet['cityOfBirth'] ?? null) !!}</td></tr>
                        <tr><td class="label">State of Birth</td><td class="value">{!! pv($pet['stateOfBirth'] ?? null) !!}</td></tr>
                        <tr><td class="label">Country of Birth</td><td class="value">{!! pv($pet['countryOfBirth'] ?? null) !!}</td></tr>
                        <tr><td class="label">Sex</td><td class="value">{!! pv($pet['sex'] ?? null) !!}</td></tr>
                        <tr><td class="label">Email</td><td class="value">{!! pv($pet['email'] ?? null) !!}</td></tr>
                        <tr><td class="label">Phone</td><td class="value">{!! pv(($pet['phoneCountryCode'] ?? '') . ' ' . ($pet['phoneNumber'] ?? '')) !!}</td></tr>
                        <tr><td class="label">SSN</td><td class="value">{!! pv($pet['socialSecurityNumber'] ?? null) !!}</td></tr>
                        <tr><td class="label">A-Number</td><td class="value">{!! pv($pet['aNumber'] ?? null) !!}</td></tr>
                    </table>
                </div>
            </div>
            <div class="col">
                <div class="subsection">
                    <div class="subsection-title">Beneficiary (Foreign National)</div>
                    <table class="fields">
                        <tr><td class="label">Full Name</td><td class="value">{!! pv($ben['fullName'] ?? null) !!}</td></tr>
                        <tr><td class="label">Relationship</td><td class="value">{!! pv($ben['relationship'] ?? null) !!}</td></tr>
                        <tr><td class="label">Date of Birth</td><td class="value">{!! pv($ben['dateOfBirth'] ?? null) !!}</td></tr>
                        <tr><td class="label">City of Birth</td><td class="value">{!! pv($ben['cityOfBirth'] ?? null) !!}</td></tr>
                        <tr><td class="label">State of Birth</td><td class="value">{!! pv($ben['stateOfBirth'] ?? null) !!}</td></tr>
                        <tr><td class="label">Country of Birth</td><td class="value">{!! pv($ben['countryOfBirth'] ?? null) !!}</td></tr>
                        <tr><td class="label">Sex</td><td class="value">{!! pv($ben['sex'] ?? null) !!}</td></tr>
                        <tr><td class="label">Email</td><td class="value">{!! pv($ben['email'] ?? null) !!}</td></tr>
                        <tr><td class="label">Phone</td><td class="value">{!! pv(($ben['phoneCountryCode'] ?? '') . ' ' . ($ben['phoneNumber'] ?? '')) !!}</td></tr>
                        <tr><td class="label">SSN</td><td class="value">{!! pv($ben['socialSecurityNumber'] ?? null) !!}</td></tr>
                        <tr><td class="label">A-Number</td><td class="value">{!! pv($ben['aNumber'] ?? null) !!}</td></tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- STEP 2: ADDRESS HISTORY --}}
@php
    $petAddr = $fd['petitionerAddress'] ?? [];
    $petCur  = $petAddr['currentAddress'] ?? [];
    $benAddr = $fd['beneficiaryAddress'] ?? [];
    $benCur  = $benAddr['currentAddress'] ?? [];
    $futAddr = $fd['futureUSAddress'] ?? [];
@endphp
<div class="section">
    <div class="section-title">Step 2: Address History</div>
    <div class="section-body">
        <div class="two-col">
            <div class="col">
                <div class="subsection">
                    <div class="subsection-title">Petitioner — Current Address</div>
                    <table class="fields">
                        <tr><td class="label">Street</td><td class="value">{!! pv($petCur['street'] ?? null) !!}</td></tr>
                        <tr><td class="label">Apt/Unit</td><td class="value">{!! pv($petCur['floorAptSuite'] ?? null) !!}</td></tr>
                        <tr><td class="label">City</td><td class="value">{!! pv($petCur['city'] ?? null) !!}</td></tr>
                        <tr><td class="label">State/Country</td><td class="value">{!! pv($petCur['stateOrCountry'] ?? null) !!}</td></tr>
                        <tr><td class="label">ZIP</td><td class="value">{!! pv($petCur['zip'] ?? null) !!}</td></tr>
                        <tr><td class="label">From Date</td><td class="value">{!! pv($petCur['startDate'] ?? null) !!}</td></tr>
                    </table>
                </div>
                @php $petPrev = $petAddr['previousAddresses'] ?? []; @endphp
                @if(!empty($petPrev) && is_array($petPrev))
                <div class="subsection">
                    <div class="subsection-title">Petitioner — Previous Addresses</div>
                    <table class="data-table">
                        <tr><th>Street</th><th>City</th><th>State</th><th>From</th><th>To</th></tr>
                        @foreach($petPrev as $addr)
                        <tr>
                            <td>{!! pv($addr['street'] ?? null) !!}</td>
                            <td>{!! pv($addr['city'] ?? null) !!}</td>
                            <td>{!! pv($addr['stateOrCountry'] ?? null) !!}</td>
                            <td>{!! pv($addr['startDate'] ?? null) !!}</td>
                            <td>{!! pv($addr['endDate'] ?? null) !!}</td>
                        </tr>
                        @endforeach
                    </table>
                </div>
                @endif
            </div>
            <div class="col">
                <div class="subsection">
                    <div class="subsection-title">Beneficiary — Current Address</div>
                    <table class="fields">
                        <tr><td class="label">Street</td><td class="value">{!! pv($benCur['street'] ?? null) !!}</td></tr>
                        <tr><td class="label">Apt/Unit</td><td class="value">{!! pv($benCur['floorAptSuite'] ?? null) !!}</td></tr>
                        <tr><td class="label">City</td><td class="value">{!! pv($benCur['city'] ?? null) !!}</td></tr>
                        <tr><td class="label">State/Country</td><td class="value">{!! pv($benCur['stateOrCountry'] ?? null) !!}</td></tr>
                        <tr><td class="label">ZIP</td><td class="value">{!! pv($benCur['zip'] ?? null) !!}</td></tr>
                        <tr><td class="label">From Date</td><td class="value">{!! pv($benCur['startDate'] ?? null) !!}</td></tr>
                    </table>
                </div>
                @php $benPrev = $benAddr['previousAddresses'] ?? []; @endphp
                @if(!empty($benPrev) && is_array($benPrev))
                <div class="subsection">
                    <div class="subsection-title">Beneficiary — Previous Addresses</div>
                    <table class="data-table">
                        <tr><th>Street</th><th>City</th><th>State</th><th>From</th><th>To</th></tr>
                        @foreach($benPrev as $addr)
                        <tr>
                            <td>{!! pv($addr['street'] ?? null) !!}</td>
                            <td>{!! pv($addr['city'] ?? null) !!}</td>
                            <td>{!! pv($addr['stateOrCountry'] ?? null) !!}</td>
                            <td>{!! pv($addr['startDate'] ?? null) !!}</td>
                            <td>{!! pv($addr['endDate'] ?? null) !!}</td>
                        </tr>
                        @endforeach
                    </table>
                </div>
                @endif
            </div>
        </div>

        @if(!empty($futAddr) && is_array($futAddr))
        <div class="subsection">
            <div class="subsection-title">Future US Address (Beneficiary)</div>
            <table class="fields">
                <tr><td class="label">Person Living There</td><td class="value">{!! pv($futAddr['nameOfPersonLiving'] ?? null) !!}</td></tr>
                <tr><td class="label">Address</td><td class="value">{!! pv($futAddr['address'] ?? null) !!}</td></tr>
                <tr><td class="label">Apt/Suite</td><td class="value">{!! pv($futAddr['floorAptSuite'] ?? null) !!}</td></tr>
                <tr><td class="label">City</td><td class="value">{!! pv($futAddr['city'] ?? null) !!}</td></tr>
                <tr><td class="label">State</td><td class="value">{!! pv($futAddr['state'] ?? null) !!}</td></tr>
                <tr><td class="label">ZIP</td><td class="value">{!! pv($futAddr['zipCode'] ?? null) !!}</td></tr>
                <tr><td class="label">Green Card Delivery</td><td class="value">{!! pb($futAddr['isGreenCardDeliveryAddress'] ?? null) !!}</td></tr>
            </table>
        </div>
        @endif

        @foreach(['petitioner' => $petAddr, 'beneficiary' => $benAddr] as $roleName => $addrData)
        @php $livedOther = $addrData['livedInOtherCountryDetails'] ?? []; @endphp
        @if(!empty($livedOther) && is_array($livedOther))
        <div class="subsection">
            <div class="subsection-title">{{ ucfirst($roleName) }} — Countries Lived In (6+ months)</div>
            <table class="data-table">
                <tr><th>Country</th><th>Duration</th></tr>
                @foreach($livedOther as $entry)
                <tr>
                    <td>{!! pv($entry['country'] ?? null) !!}</td>
                    <td>{!! pv($entry['duration'] ?? null) !!}</td>
                </tr>
                @endforeach
            </table>
        </div>
        @endif
        @endforeach
    </div>
</div>

{{-- STEP 3: MARITAL STATUS --}}
@php $step3 = $fd['step3Data'] ?? []; @endphp
<div class="section">
    <div class="section-title">Step 3: Marital Status</div>
    <div class="section-body">
        @foreach(['petitioner', 'beneficiary'] as $role)
        @php
            $roleData = $step3[$role] ?? [];
            $ms = $roleData['maritalStatus'] ?? [];
        @endphp
        <div class="subsection">
            <div class="subsection-title">{{ ucfirst($role) }} — Marital Status</div>
            <table class="fields">
                <tr><td class="label">Times Married</td><td class="value">{!! pv($ms['timesMarried'] ?? null) !!}</td></tr>
            </table>
            @if(!empty($ms['currentMarriage']) && is_array($ms['currentMarriage']))
            @php $cm = $ms['currentMarriage']; @endphp
            <p style="font-size:10px; font-weight:bold; margin:4px 0 2px; color:#555;">Current Marriage:</p>
            <table class="fields">
                <tr><td class="label">Date</td><td class="value">{!! pv($cm['date'] ?? null) !!}</td></tr>
                <tr><td class="label">City</td><td class="value">{!! pv($cm['city'] ?? null) !!}</td></tr>
                <tr><td class="label">Country</td><td class="value">{!! pv($cm['country'] ?? null) !!}</td></tr>
                <tr><td class="label">Spouse Name</td><td class="value">{!! pv($cm['spouseName'] ?? null) !!}</td></tr>
                <tr><td class="label">Spouse DOB</td><td class="value">{!! pv($cm['spouseDateOfBirth'] ?? null) !!}</td></tr>
            </table>
            @endif
            @if(!empty($ms['priorMarriages']) && is_array($ms['priorMarriages']))
            <p style="font-size:10px; font-weight:bold; margin:4px 0 2px; color:#555;">Prior Marriages:</p>
            <table class="data-table">
                <tr><th>Full Name</th><th>DOB</th><th>Marriage Date</th><th>City</th><th>Country</th><th>Divorce Date</th></tr>
                @foreach($ms['priorMarriages'] as $pm)
                <tr>
                    <td>{!! pv($pm['fullName'] ?? null) !!}</td>
                    <td>{!! pv($pm['dateOfBirth'] ?? null) !!}</td>
                    <td>{!! pv($pm['marriageDate'] ?? null) !!}</td>
                    <td>{!! pv($pm['marriageCity'] ?? null) !!}</td>
                    <td>{!! pv($pm['marriageCountry'] ?? null) !!}</td>
                    <td>{!! pv($pm['divorceDate'] ?? null) !!}</td>
                </tr>
                @endforeach
            </table>
            @endif
        </div>
        @endforeach
    </div>
</div>

<div class="page-break"></div>

{{-- STEP 4: FAMILY --}}
<div class="section">
    <div class="section-title">Step 4: Family Information</div>
    <div class="section-body">
        @foreach(['petitioner', 'beneficiary'] as $role)
        @php $roleData = $step3[$role] ?? []; @endphp
        <div class="subsection">
            <div class="subsection-title">{{ ucfirst($role) }} — Parents</div>
            @foreach(['father', 'mother'] as $parent)
            @php $p = $roleData[$parent] ?? []; @endphp
            @if(!empty($p) && is_array($p))
            <p style="font-size:10px; font-weight:bold; margin:4px 0 2px; color:#555;">{{ ucfirst($parent) }}:</p>
            <table class="fields">
                <tr><td class="label">Surnames</td><td class="value">{!! pv($p['surnames'] ?? null) !!}</td></tr>
                <tr><td class="label">Given Names</td><td class="value">{!! pv($p['givenNames'] ?? null) !!}</td></tr>
                @if(!empty($p['surnamesAtBirth']))
                <tr><td class="label">Surnames at Birth</td><td class="value">{!! pv($p['surnamesAtBirth'] ?? null) !!}</td></tr>
                @endif
                <tr><td class="label">Date of Birth</td><td class="value">{!! pv($p['dateOfBirth'] ?? null) !!}</td></tr>
                <tr><td class="label">City of Birth</td><td class="value">{!! pv($p['cityOfBirth'] ?? null) !!}</td></tr>
                <tr><td class="label">Country of Birth</td><td class="value">{!! pv($p['countryOfBirth'] ?? null) !!}</td></tr>
                <tr><td class="label">Is Living</td><td class="value">{!! pb($p['isLiving'] ?? null) !!}</td></tr>
                @if(!empty($p['currentCity']))
                <tr><td class="label">Current City</td><td class="value">{!! pv($p['currentCity'] ?? null) !!}</td></tr>
                @endif
                @if(!empty($p['currentCountry']))
                <tr><td class="label">Current Country</td><td class="value">{!! pv($p['currentCountry'] ?? null) !!}</td></tr>
                @endif
                @if(!empty($p['fullCurrentAddress']))
                <tr><td class="label">Current Address</td><td class="value">{!! pv($p['fullCurrentAddress'] ?? null) !!}</td></tr>
                @endif
                @if(!empty($p['yearOfDeath']))
                <tr><td class="label">Year of Death</td><td class="value">{!! pv($p['yearOfDeath'] ?? null) !!}</td></tr>
                @endif
            </table>
            @endif
            @endforeach
        </div>
        @endforeach

        @php $benChildren = $step3['beneficiary']['children'] ?? []; @endphp
        @if(!empty($benChildren) && is_array($benChildren))
        <div class="subsection">
            <div class="subsection-title">Beneficiary's Children</div>
            <table class="data-table">
                <tr><th>Name</th><th>Date of Birth</th><th>City of Birth</th><th>Country</th></tr>
                @foreach($benChildren as $child)
                <tr>
                    <td>{!! pv($child['nameSurname'] ?? $child['fullName'] ?? null) !!}</td>
                    <td>{!! pv($child['dateOfBirth'] ?? null) !!}</td>
                    <td>{!! pv($child['cityOfBirth'] ?? null) !!}</td>
                    <td>{!! pv($child['stateOrCountryOfBirth'] ?? $child['countryOfBirth'] ?? null) !!}</td>
                </tr>
                @endforeach
            </table>
        </div>
        @endif
    </div>
</div>

{{-- STEP 5: EMPLOYMENT HISTORY --}}
@php $step5 = $fd['step5Data'] ?? []; @endphp
<div class="section">
    <div class="section-title">Step 5: Employment &amp; Education</div>
    <div class="section-body">
        @foreach(['petitioner', 'beneficiary'] as $role)
        @php $emp = $step5[$role] ?? []; @endphp
        <div class="subsection">
            <div class="subsection-title">{{ ucfirst($role) }} — Employment</div>
            <table class="fields">
                <tr><td class="label">Status</td><td class="value">{!! pv($emp['currentEmploymentStatus'] ?? null) !!}</td></tr>
                @if($role === 'petitioner')
                <tr><td class="label">Salary</td><td class="value">{!! pv($emp['petitionerSalary'] ?? null) !!}</td></tr>
                @else
                <tr><td class="label">Salary</td><td class="value">{!! pv($emp['beneficiarySalary'] ?? null) !!}</td></tr>
                <tr><td class="label">Intended US Job</td><td class="value">{!! pv($emp['intendedJobFieldInUS'] ?? null) !!}</td></tr>
                @endif
            </table>
            @php $jobs = $emp['employments'] ?? []; @endphp
            @if(!empty($jobs) && is_array($jobs))
            <table class="data-table">
                <tr><th>Position</th><th>Employer</th><th>Address</th><th>From</th><th>To</th></tr>
                @foreach($jobs as $job)
                <tr>
                    <td>{!! pv($job['position'] ?? null) !!}</td>
                    <td>{!! pv($job['employerName'] ?? null) !!}</td>
                    <td>{!! pv($job['employerAddress'] ?? null) !!}</td>
                    <td>{!! pv($job['fromDate'] ?? null) !!}</td>
                    <td>{!! pv($job['toDate'] ?? null, 'Present') !!}</td>
                </tr>
                @endforeach
            </table>
            @endif
        </div>
        @endforeach

        @php $institutions = $step5['beneficiary']['institutions'] ?? []; @endphp
        @if(!empty($institutions) && is_array($institutions))
        <div class="subsection">
            <div class="subsection-title">Beneficiary — Education</div>
            <table class="data-table">
                <tr><th>Institution</th><th>Address</th><th>Degree</th><th>From</th><th>To</th></tr>
                @foreach($institutions as $inst)
                <tr>
                    <td>{!! pv($inst['name'] ?? null) !!}</td>
                    <td>{!! pv($inst['address'] ?? null) !!}</td>
                    <td>{!! pv($inst['degree'] ?? null) !!}</td>
                    <td>{!! pv($inst['fromDate'] ?? null) !!}</td>
                    <td>{!! pv($inst['toDate'] ?? null) !!}</td>
                </tr>
                @endforeach
            </table>
        </div>
        @endif
    </div>
</div>

{{-- STEP 6: OTHER INFORMATION --}}
@php $step6 = $fd['step6Data'] ?? []; @endphp
<div class="section">
    <div class="section-title">Step 6: Other Information</div>
    <div class="section-body">
        @foreach(['petitioner', 'beneficiary'] as $role)
        @php $info = $step6[$role] ?? []; @endphp
        <div class="subsection">
            <div class="subsection-title">{{ ucfirst($role) }}</div>
            <table class="fields">
                @php $nats = $info['nationalities'] ?? []; @endphp
                @if(!empty($nats) && is_array($nats))
                <tr>
                    <td class="label">Nationalities</td>
                    <td class="value">{{ collect($nats)->pluck('nationality')->filter()->implode(', ') ?: '—' }}</td>
                </tr>
                @endif
                <tr><td class="label">Eye Color</td><td class="value">{!! pv($info['eyeColor'] ?? null) !!}</td></tr>
                <tr><td class="label">Hair Color</td><td class="value">{!! pv($info['hairColor'] ?? null) !!}</td></tr>
                <tr><td class="label">Height</td><td class="value">{!! pv(($info['heightFeet'] ?? '') . "'" . ($info['heightInches'] ?? '') . '"') !!}</td></tr>
                <tr><td class="label">Weight (lbs)</td><td class="value">{!! pv($info['weightLbs'] ?? null) !!}</td></tr>
                @php $speaksOther = $info['speakOtherLanguages'] ?? null; @endphp
                <tr><td class="label">Speaks Other Languages</td><td class="value">
                    @if($speaksOther === true || $speaksOther === 'true')
                        Yes: {!! pv($info['languagesSpoken'] ?? null) !!}
                    @elseif($speaksOther === false || $speaksOther === 'false')
                        No
                    @else
                        —
                    @endif
                </td></tr>
            </table>
        </div>
        @endforeach
    </div>
</div>

{{-- STEP 7: SECURITY & BACKGROUND --}}
@php $step7 = $fd['step7Data'] ?? []; $answers = $step7['securityAnswers'] ?? []; @endphp
@if(!empty($answers) && is_array($answers))
<div class="section">
    <div class="section-title">Step 7: Security &amp; Background</div>
    <div class="section-body">
        <table class="data-table">
            <tr><th style="width:10%">#</th><th style="width:15%">Answer</th><th>Explanation</th></tr>
            @foreach($answers as $i => $ans)
            @php
                $ansVal = $ans['answer'] ?? null;
                $ansText = ($ansVal === true || $ansVal === 'true') ? 'Yes' : (($ansVal === false || $ansVal === 'false') ? 'No' : '—');
                $isYes = ($ansVal === true || $ansVal === 'true');
            @endphp
            <tr>
                <td>Q{{ $i + 1 }}</td>
                <td style="{{ $isYes ? 'color:#b72b2b; font-weight:bold;' : '' }}">{{ $ansText }}</td>
                <td>{!! pv($ans['explanation'] ?? null) !!}</td>
            </tr>
            @endforeach
        </table>
    </div>
</div>
@endif

{{-- DOCUMENTS --}}
@php $docs = $application->documents ?? collect(); @endphp
@if($docs->count() > 0)
<div class="section">
    <div class="section-title">Uploaded Documents</div>
    <div class="section-body">
        <table class="data-table">
            <tr><th>Document Type</th><th>File Name</th><th>Status</th><th>Needs Translation</th><th>Uploaded</th></tr>
            @foreach($docs as $doc)
            <tr>
                <td>{{ str_replace('-', ' ', ucwords($doc->document_type, '-')) }}</td>
                <td>{!! pv($doc->original_name ?? null) !!}</td>
                <td style="{{ $doc->document_status === 'rejected' ? 'color:#b72b2b; font-weight:bold;' : ($doc->document_status === 'approved' ? 'color:#065f46;' : '') }}">{{ ucfirst($doc->document_status) }}</td>
                <td>{{ $doc->needs_translation ? 'Yes' : 'No' }}</td>
                <td>{{ $doc->created_at ? $doc->created_at->format('M d, Y') : '—' }}</td>
            </tr>
            @endforeach
        </table>
    </div>
</div>
@endif

<div class="footer">
    DRSI Law — D. R. Sklar & Associates Immigration Law Offices &nbsp;|&nbsp; Confidential — For Internal Use Only &nbsp;|&nbsp; Generated {{ now()->format('M d, Y H:i') }}
</div>

</body>
</html>
