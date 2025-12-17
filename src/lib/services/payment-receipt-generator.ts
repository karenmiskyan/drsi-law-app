import { jsPDF } from "jspdf";

interface PaymentReceiptData {
  receiptNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  maritalStatus: string;
  serviceFee: string;
  governmentFee: string;
  totalAmount: string;
  paymentDate: string;
  paymentMethod: string;
  stripeReceiptUrl?: string;
}

/**
 * Format marital status for display
 */
function formatMaritalStatus(status: string): string {
  const statusMap: Record<string, string> = {
    single: "Single",
    married: "Married",
    married_to_citizen: "Married to US Citizen / Legal Resident",
    divorced: "Divorced",
    widowed: "Widowed",
    legally_separated: "Legally Separated",
  };
  
  return statusMap[status] || status;
}

/**
 * Generate payment receipt PDF
 */
export async function generatePaymentReceiptPDF(data: PaymentReceiptData): Promise<Buffer> {
  const doc = new jsPDF();

  // Header with company branding
  doc.setFillColor(176, 40, 40); // #B02828
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("DRSI Law", 105, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Payment Receipt", 105, 30, { align: "center" });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Receipt Information
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Receipt #: ${data.receiptNumber}`, 20, 50);
  doc.text(`Date: ${data.paymentDate}`, 150, 50);

  // Client Information Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 20, 65);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.firstName} ${data.lastName}`, 20, 73);
  doc.text(`Email: ${data.email}`, 20, 80);
  doc.text(`Phone: ${data.phone}`, 20, 87);
  doc.text(`Service: ${formatMaritalStatus(data.maritalStatus)} Registration`, 20, 94);

  // Payment Details Table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details:", 20, 110);

  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 115, 170, 10, "F");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Description", 25, 121);
  doc.text("Amount", 160, 121);

  // Table Rows
  doc.setFont("helvetica", "normal");
  let yPos = 131;

  // Service Fee
  doc.text("Immigration Lottery Registration Service", 25, yPos);
  doc.text(`$${data.serviceFee}`, 160, yPos);
  yPos += 10;

  // Government Fee
  doc.text("Government Processing Fee", 25, yPos);
  doc.text(`$${data.governmentFee}`, 160, yPos);
  yPos += 10;

  // Divider line
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 7;

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total Paid:", 25, yPos);
  doc.text(`$${data.totalAmount}`, 160, yPos);

  // Payment Method
  yPos += 15;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Payment Method: ${data.paymentMethod}`, 20, yPos);
  doc.text("Status: PAID ✓", 20, yPos + 7);

  // Stripe Receipt Link
  if (data.stripeReceiptUrl) {
    yPos += 20;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 238);
    doc.textWithLink("View Stripe Receipt", 20, yPos, { url: data.stripeReceiptUrl });
    doc.setTextColor(0, 0, 0);
  }

  // Terms & Footer
  yPos = 220;
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  
  const termsText = `This receipt confirms your payment for DRSI Law immigration lottery registration services. 
All fees are non-refundable once services have been rendered. This receipt is valid for tax purposes.`;
  
  const lines = doc.splitTextToSize(termsText, 170);
  doc.text(lines, 20, yPos);

  // Footer
  doc.setFontSize(8);
  doc.text("DRSI Law | Immigration Services", 105, 280, { align: "center" });
  doc.text("Thank you for your business!", 105, 285, { align: "center" });

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
}

