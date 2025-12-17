import { z } from "zod";

// Step 1: Applicant Information
export const applicantInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  dateOfBirth: z.object({
    day: z.string().min(1, "Day required").max(2),
    month: z.string().min(1, "Month required").max(2),
    year: z.string().length(4, "Year must be 4 digits"),
  }),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  cityOfBirth: z.string().min(2, "City of birth required"),
  countryOfBirth: z.string().min(2, "Country of birth required"),
  mailingAddress: z.string().min(10, "Please enter complete mailing address"),
  educationLevel: z.enum([
    "primary",
    "high_school_no_degree",
    "high_school_degree",
    "university",
    "masters",
    "doctorate",
  ], {
    errorMap: () => ({ message: "Please select education level" }),
  }),
  currentResidence: z.object({
    streetAddress: z.string().min(5, "Street address required"),
    streetAddress2: z.string().optional(),
    city: z.string().min(2, "City required"),
    stateProvince: z.string().min(2, "State/Province required"),
    postalCode: z.string().min(3, "Postal code required"),
  }),
});

export type ApplicantInfoFormData = z.infer<typeof applicantInfoSchema>;

// Step 2: Marital Status & Spouse
export const maritalStatusSchema = z.object({
  maritalStatus: z.enum(["single", "married", "divorced", "widowed", "separated"], {
    errorMap: () => ({ message: "Please select marital status" }),
  }),
});

export const spouseInfoSchema = z.object({
  fullName: z.string().min(2, "Spouse full name required"),
  dateOfBirth: z.object({
    day: z.string().min(1, "Day required"),
    month: z.string().min(1, "Month required"),
    year: z.string().length(4, "Year must be 4 digits"),
  }),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Please select gender" }),
  }),
  cityOfBirth: z.string().min(2, "City of birth required"),
  countryOfBirth: z.string().min(2, "Country of birth required"),
  educationLevel: z.string().min(1, "Education level required"),
  isUSCitizenOrLPR: z.boolean(),
});

export type SpouseInfoFormData = z.infer<typeof spouseInfoSchema>;

// Step 3: Children
export const childInfoSchema = z.object({
  fullName: z.string().min(2, "Child's full name required"),
  dateOfBirth: z.object({
    day: z.string().min(1, "Day required"),
    month: z.string().min(1, "Month required"),
    year: z.string().length(4, "Year must be 4 digits"),
  }),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Please select gender" }),
  }),
  birthPlace: z.string().min(2, "Birth place required"),
  isUSCitizenOrLPR: z.boolean(),
});

export type ChildInfoFormData = z.infer<typeof childInfoSchema>;

// Helper function to validate date
export function isValidDate(day: string, month: string, year: string): boolean {
  const d = parseInt(day);
  const m = parseInt(month);
  const y = parseInt(year);
  
  if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
  if (d < 1 || d > 31) return false;
  if (m < 1 || m > 12) return false;
  if (y < 1900 || y > new Date().getFullYear()) return false;
  
  const date = new Date(y, m - 1, d);
  return date.getDate() === d && date.getMonth() === m - 1 && date.getFullYear() === y;
}

// Helper function to calculate age
export function calculateAge(day: string, month: string, year: string): number {
  const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Education levels with labels
export const educationLevels = [
  { value: "primary", label: "Primary School" },
  { value: "high_school_no_degree", label: "High School (No Degree)" },
  { value: "high_school_degree", label: "High School (Degree)" },
  { value: "university", label: "University / Bachelor's Degree" },
  { value: "masters", label: "Master's Degree" },
  { value: "doctorate", label: "Doctorate / PhD" },
];

// Countries list (sample - add more as needed)
export const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
  "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kiribati", "North Korea", "South Korea", "Kuwait", "Kyrgyzstan", "Laos",
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
  "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
  "Nigeria", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
  "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
  "Zambia", "Zimbabwe"
];

// Helper function to format marital status for display
export function formatMaritalStatus(status: string | null): string {
  if (!status) return "N/A";
  
  const statusMap: { [key: string]: string } = {
    "single": "Single",
    "married": "Married",
    "married_to_citizen": "Married to US Citizen",
    "married_to_lpr": "Married to Legal Permanent Resident",
    "divorced": "Divorced",
    "widowed": "Widowed",
    "separated": "Legally Separated",
    "legally_separated": "Legally Separated",
  };
  
  return statusMap[status] || status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

