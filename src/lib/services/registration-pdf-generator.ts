/**
 * Professional Registration PDF Generator for DV Lottery Application
 * 
 * Generates a comprehensive PDF document with all registration data
 */

import { jsPDF } from "jspdf";
import { ApplicantInfo, SpouseInfo, ChildInfo } from "@/stores/registrationFormStore";
import { educationLevels } from "@/lib/registrationValidation";
import fs from "fs";
import path from "path";

interface RegistrationPDFData {
  registrationId: string;
  submittedAt: string;
  applicantInfo: ApplicantInfo;
  maritalStatus: string;
  spouseInfo: SpouseInfo | null;
  children: ChildInfo[];
  documentsUploaded: {
    applicant: string[];
    spouse: string[];
    children: { [childId: string]: string[] };
  };
}

// Helper to format education level
function formatEducationLevel(value: string): string {
  const level = educationLevels.find(l => l.value === value);
  return level ? level.label : value;
}

// Helper to format marital status
function formatMaritalStatus(status: string): string {
  const statuses: { [key: string]: string } = {
    single: "Single",
    married: "Married",
    married_to_citizen: "Married to US Citizen",
    married_to_lpr: "Married to Legal Permanent Resident",
    divorced: "Divorced",
    widowed: "Widowed",
    separated: "Legally Separated",
    legally_separated: "Legally Separated",
  };
  return statuses[status] || status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Helper to format date
function formatDate(day: string, month: string, year: string): string {
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

// Helper to add section title
function addSectionTitle(doc: jsPDF, y: number, title: string): number {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, y);
  
  // Underline
  doc.setLineWidth(0.5);
  doc.line(20, y + 2, 190, y + 2);
  
  return y + 10;
}

// Helper to add labeled text
function addLabeledText(doc: jsPDF, y: number, label: string, value: string): number {
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(label + ":", 20, y);
  
  doc.setFont("helvetica", "normal");
  doc.text(value, 80, y);
  
  return y + 6;
}

// Helper to add checkbox list
function addCheckboxList(doc: jsPDF, y: number, items: string[]): number {
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  items.forEach(item => {
    doc.text("✓", 25, y);
    doc.text(item, 32, y);
    y += 6;
  });
  
  return y;
}

export async function generateRegistrationPDF(data: RegistrationPDFData): Promise<Buffer> {
  const doc = new jsPDF();
  let yPos = 20;

  // ============================================
  // HEADER
  // ============================================
  doc.setFillColor(176, 40, 40); // #B02828
  doc.rect(0, 0, 210, 40, "F");
  
  // Add logo
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "drsi-logo.png");
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
      doc.addImage(logoBase64, "PNG", 15, 8, 25, 25); // x, y, width, height
    }
  } catch (error) {
    console.log("⚠️ Could not load logo for PDF:", error);
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("DV LOTTERY REGISTRATION FORM", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("DRSI Law Services", 105, 30, { align: "center" });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPos = 50;

  // ============================================
  // REGISTRATION DETAILS
  // ============================================
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(`Registration ID: ${data.registrationId}`, 20, yPos);
  doc.text(`Submitted: ${data.submittedAt}`, 20, yPos + 5);
  yPos += 15;

  // ============================================
  // APPLICANT INFORMATION
  // ============================================
  yPos = addSectionTitle(doc, yPos, "APPLICANT INFORMATION");
  
  yPos = addLabeledText(doc, yPos, "Full Name", 
    `${data.applicantInfo.firstName} ${data.applicantInfo.lastName}`);
  
  yPos = addLabeledText(doc, yPos, "Date of Birth", 
    formatDate(
      data.applicantInfo.dateOfBirth.day,
      data.applicantInfo.dateOfBirth.month,
      data.applicantInfo.dateOfBirth.year
    ));
  
  yPos = addLabeledText(doc, yPos, "Gender", 
    data.applicantInfo.gender.charAt(0).toUpperCase() + data.applicantInfo.gender.slice(1));
  
  yPos = addLabeledText(doc, yPos, "Place of Birth", 
    `${data.applicantInfo.cityOfBirth}, ${data.applicantInfo.countryOfBirth}`);
  
  yPos = addLabeledText(doc, yPos, "Current Address", 
    data.applicantInfo.mailingAddress);
  
  yPos = addLabeledText(doc, yPos, "Email", 
    data.applicantInfo.email);
  
  yPos = addLabeledText(doc, yPos, "Phone", 
    data.applicantInfo.phone);
  
  yPos = addLabeledText(doc, yPos, "Education Level", 
    formatEducationLevel(data.applicantInfo.educationLevel));
  
  yPos += 5;
  
  // Current Residence
  yPos = addSectionTitle(doc, yPos, "Current Residence");
  const residence = data.applicantInfo.currentResidence;
  yPos = addLabeledText(doc, yPos, "Street Address", residence.streetAddress);
  if (residence.streetAddress2) {
    yPos = addLabeledText(doc, yPos, "Street Address Line 2", residence.streetAddress2);
  }
  yPos = addLabeledText(doc, yPos, "City", residence.city);
  yPos = addLabeledText(doc, yPos, "State/Province", residence.stateProvince);
  yPos = addLabeledText(doc, yPos, "Postal/Zip Code", residence.postalCode);
  
  yPos += 5;

  // ============================================
  // MARITAL STATUS
  // ============================================
  yPos = addSectionTitle(doc, yPos, "MARITAL STATUS");
  yPos = addLabeledText(doc, yPos, "Status", formatMaritalStatus(data.maritalStatus));
  yPos += 5;

  // ============================================
  // SPOUSE INFORMATION (if married)
  // ============================================
  if (data.maritalStatus === "married" && data.spouseInfo) {
    yPos = addSectionTitle(doc, yPos, "SPOUSE INFORMATION");
    
    yPos = addLabeledText(doc, yPos, "Full Name", data.spouseInfo.fullName);
    
    yPos = addLabeledText(doc, yPos, "Date of Birth", 
      formatDate(
        data.spouseInfo.dateOfBirth.day,
        data.spouseInfo.dateOfBirth.month,
        data.spouseInfo.dateOfBirth.year
      ));
    
    yPos = addLabeledText(doc, yPos, "Gender", 
      data.spouseInfo.gender.charAt(0).toUpperCase() + data.spouseInfo.gender.slice(1));
    
    yPos = addLabeledText(doc, yPos, "Place of Birth", 
      `${data.spouseInfo.cityOfBirth}, ${data.spouseInfo.countryOfBirth}`);
    
    yPos = addLabeledText(doc, yPos, "Education Level", 
      formatEducationLevel(data.spouseInfo.educationLevel));
    
    yPos = addLabeledText(doc, yPos, "U.S. Citizen or Green Card Holder", 
      data.spouseInfo.isUSCitizenOrLPR ? "Yes" : "No");
    
    yPos += 5;
  }

  // ============================================
  // CHILDREN INFORMATION
  // ============================================
  if (data.children.length > 0) {
    // Check if we need a new page
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos = addSectionTitle(doc, yPos, `CHILDREN (${data.children.length})`);
    
    data.children.forEach((child, index) => {
      // Check if we need a new page for each child
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Child ${index + 1}:`, 20, yPos);
      yPos += 6;
      
      yPos = addLabeledText(doc, yPos, "  Name", child.fullName);
      
      yPos = addLabeledText(doc, yPos, "  Date of Birth", 
        formatDate(child.dateOfBirth.day, child.dateOfBirth.month, child.dateOfBirth.year));
      
      yPos = addLabeledText(doc, yPos, "  Gender", 
        child.gender.charAt(0).toUpperCase() + child.gender.slice(1));
      
      yPos = addLabeledText(doc, yPos, "  Place of Birth", child.birthPlace);
      
      yPos = addLabeledText(doc, yPos, "  US Citizen/LPR", 
        child.isUSCitizenOrLPR ? "Yes" : "No");
      
      yPos += 3;
    });
    
    yPos += 2;
  } else {
    yPos = addSectionTitle(doc, yPos, "CHILDREN");
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("No children under 21 or all children are married/over 21", 20, yPos);
    yPos += 10;
  }

  // ============================================
  // DOCUMENTS SUBMITTED
  // ============================================
  // Check if we need a new page
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }
  
  yPos = addSectionTitle(doc, yPos, "DOCUMENTS SUBMITTED");
  
  // Applicant documents
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Applicant:", 20, yPos);
  yPos += 6;
  
  yPos = addCheckboxList(doc, yPos, data.documentsUploaded.applicant);
  yPos += 3;
  
  // Spouse documents (if applicable)
  if (data.maritalStatus === "married" && data.documentsUploaded.spouse.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Spouse:", 20, yPos);
    yPos += 6;
    
    yPos = addCheckboxList(doc, yPos, data.documentsUploaded.spouse);
    yPos += 3;
  }
  
  // Children documents (if applicable)
  const childDocs = Object.entries(data.documentsUploaded.children);
  if (childDocs.length > 0) {
    childDocs.forEach(([childId, docs], index) => {
      const child = data.children.find(c => c.id === childId);
      if (child && docs.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text(`Child ${index + 1} (${child.fullName}):`, 20, yPos);
        yPos += 6;
        
        yPos = addCheckboxList(doc, yPos, docs);
        yPos += 3;
      }
    });
  }

  // ============================================
  // FOOTER
  // ============================================
  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos += 10;
  }
  
  // Separator line
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("This is an official registration document for the US Diversity Visa Lottery program.", 105, yPos, { align: "center" });
  yPos += 5;
  doc.text("All information provided has been verified and is accurate.", 105, yPos, { align: "center" });
  yPos += 10;
  
  doc.setFont("helvetica", "bold");
  doc.text("DRSI Law Services", 105, yPos, { align: "center" });
  yPos += 5;
  
  doc.setFont("helvetica", "normal");
  doc.text("office@drsi-law.com", 105, yPos, { align: "center" });
  yPos += 5;
  doc.text("WhatsApp: +972 58-764-4252", 105, yPos, { align: "center" });
  yPos += 5;
  doc.text("www.drsi-law.com", 105, yPos, { align: "center" });

  // Convert to buffer
  return Buffer.from(doc.output("arraybuffer"));
}
