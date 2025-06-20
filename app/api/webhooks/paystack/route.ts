import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    // Verify webhook signature
    const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(body).digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    // Handle different webhook events
    switch (event.event) {
      case "charge.success":
        await handleSuccessfulPayment(event.data)
        break
      case "charge.failed":
        await handleFailedPayment(event.data)
        break
      case "transfer.success":
        await handleSuccessfulTransfer(event.data)
        break
      case "transfer.failed":
        await handleFailedTransfer(event.data)
        break
      default:
        console.log(`Unhandled event type: ${event.event}`)
    }

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleSuccessfulPayment(data: any) {
  const { reference, metadata } = data

  if (metadata?.escrowId) {
    // Update escrow status to funded
    console.log(`Escrow ${metadata.escrowId} funded successfully with reference ${reference}`)

    // Here you would typically update your database
    // await updateEscrowStatus(metadata.escrowId, 'funded', reference)

    // Send notification to freelancer
    // await notifyFreelancer(metadata.escrowId)
  }
}

async function handleFailedPayment(data: any) {
  const { reference, metadata } = data

  if (metadata?.escrowId) {
    console.log(`Payment failed for escrow ${metadata.escrowId}`)

    // Update escrow status and notify client
    // await updateEscrowStatus(metadata.escrowId, 'payment_failed')
    // await notifyClient(metadata.escrowId, 'payment_failed')
  }
}

async function handleSuccessfulTransfer(data: any) {
  const { reference, metadata } = data

  if (metadata?.escrowId) {
    console.log(`Funds released successfully for escrow ${metadata.escrowId}`)

    // Update escrow status to released
    // await updateEscrowStatus(metadata.escrowId, 'released')
    // await notifyFreelancer(metadata.escrowId, 'funds_released')
  }
}

async function handleFailedTransfer(data: any) {
  const { reference, metadata } = data

  if (metadata?.escrowId) {
    console.log(`Fund release failed for escrow ${metadata.escrowId}`)

    // Handle failed transfer
    // await handleTransferFailure(metadata.escrowId)
  }
}
