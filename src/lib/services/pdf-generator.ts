import { jsPDF } from "jspdf";
import { MaritalStatus } from "../pricing";

interface ContractData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  maritalStatus: MaritalStatus;
  amount: string;
  signature: string;
  date: string;
}

/**
 * Format marital status for display
 */
function formatMaritalStatus(status: MaritalStatus): string {
  const statusMap: Record<MaritalStatus, string> = {
    single: "Single",
    married: "Married",
    married_to_citizen: "Married to US Citizen / Legal Resident",
    divorced: "Divorced",
    widowed: "Widowed",
    legally_separated: "Legally Separated",
  };
  
  return statusMap[status] || status;
}

export async function generateContractPDF(data: ContractData): Promise<Buffer> {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("DRSI Law", 105, 20, { align: "center" });
  
  doc.setFontSize(16);
  doc.text("Service Agreement", 105, 30, { align: "center" });

  // Client Information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Client Information:", 20, 50);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.firstName} ${data.lastName}`, 20, 60);
  doc.text(`Email: ${data.email}`, 20, 67);
  doc.text(`Phone: ${data.phone}`, 20, 74);
  doc.text(`Marital Status: ${formatMaritalStatus(data.maritalStatus)}`, 20, 81);

  // Agreement Details
  doc.setFont("helvetica", "bold");
  doc.text("Agreement Details:", 20, 95);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Total Amount: $${data.amount}`, 20, 105);
  doc.text(`Date: ${data.date}`, 20, 112);

  // Agreement Text
  doc.setFont("helvetica", "bold");
  doc.text("Terms and Conditions:", 20, 126);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const agreementText = `This Service Agreement is entered into by and between DRSI Law and the Client.

The Service Provider agrees to provide immigration lottery registration services, including 
the preparation and submission of all necessary documentation for the Diversity Visa (DV) 
Lottery program.

The Client agrees to pay the Service Provider the total amount stated above. This fee includes 
professional consultation, application preparation, and government filing fees.

Payment is due in full before the submission of the application. All fees are non-refundable 
once the application has been submitted to the appropriate government agency.

The Service Provider makes no guarantee regarding the outcome of the lottery registration. 
Selection is determined solely by the U.S. government through a random lottery process.

The Service Provider agrees to maintain the confidentiality of all Client information and will 
not disclose such information to third parties without the Client's consent, except as required 
by law.

By signing below, the Client acknowledges that they have read, understood, and agree to be 
bound by the terms and conditions of this Agreement.`;

  const lines = doc.splitTextToSize(agreementText, 170);
  doc.text(lines, 20, 136);

  // Signature
  if (data.signature) {
    doc.setFont("helvetica", "bold");
    doc.text("Client Signature:", 20, 240);
    
    try {
      // Add signature image
      doc.addImage(data.signature, "PNG", 20, 245, 60, 20);
    } catch (error) {
      console.error("Error adding signature to PDF:", error);
      doc.setFont("helvetica", "italic");
      doc.text("[Signature on file]", 20, 255);
    }
  }

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
}

