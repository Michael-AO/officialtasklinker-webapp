import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const receiptData = await request.json()

    // In a real app, you would use a PDF generation library like:
    // - puppeteer
    // - jsPDF
    // - PDFKit
    // - react-pdf

    // For now, we'll create a simple HTML receipt and return it as text
    const htmlReceipt = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receiptData.reference}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .details { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .total { font-weight: bold; font-size: 1.2em; border-top: 1px solid #333; padding-top: 10px; }
            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TaskLance</h1>
            <h2>Transaction Receipt</h2>
            <p>Reference: ${receiptData.reference}</p>
          </div>
          
          <div class="details">
            <div class="row">
              <span>Transaction Type:</span>
              <span>${receiptData.type === "escrow" ? "Escrow Payment" : "Withdrawal"}</span>
            </div>
            <div class="row">
              <span>Date:</span>
              <span>${new Date(receiptData.date).toLocaleDateString()}</span>
            </div>
            <div class="row">
              <span>Status:</span>
              <span>${receiptData.status}</span>
            </div>
            ${
              receiptData.clientName
                ? `
            <div class="row">
              <span>Client:</span>
              <span>${receiptData.clientName}</span>
            </div>
            `
                : ""
            }
            ${
              receiptData.bankAccount
                ? `
            <div class="row">
              <span>Bank:</span>
              <span>${receiptData.bankAccount.bankName}</span>
            </div>
            <div class="row">
              <span>Account:</span>
              <span>${receiptData.bankAccount.accountName} - ***${receiptData.bankAccount.accountNumber.slice(-4)}</span>
            </div>
            `
                : ""
            }
          </div>
          
          <div class="details">
            <div class="row">
              <span>Amount:</span>
              <span>₦${(receiptData.amount / 100).toLocaleString()}</span>
            </div>
            ${
              receiptData.fee
                ? `
            <div class="row">
              <span>Fee:</span>
              <span>₦${(receiptData.fee / 100).toLocaleString()}</span>
            </div>
            `
                : ""
            }
            ${
              receiptData.netAmount
                ? `
            <div class="row total">
              <span>Net Amount:</span>
              <span>₦${(receiptData.netAmount / 100).toLocaleString()}</span>
            </div>
            `
                : ""
            }
          </div>
          
          <div class="footer">
            <p>This is a computer-generated receipt.</p>
            <p>For support, contact: support@tasklance.com</p>
          </div>
        </body>
      </html>
    `

    // Convert HTML to PDF (in a real app, you'd use a proper PDF library)
    const buffer = Buffer.from(htmlReceipt, "utf-8")

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${receiptData.reference}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Receipt generation error:", error)
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 })
  }
}
