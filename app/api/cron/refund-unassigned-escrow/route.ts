/**
 * Refund unassigned escrow (no freelancer awarded within 2 weeks).
 *
 * Netlify: schedule via an external cron (e.g. cron-job.org, EasyCron).
 * Call daily: POST https://your-site.netlify.app/api/cron/refund-unassigned-escrow
 * Header: Authorization: Bearer YOUR_CRON_SECRET (or ?secret=YOUR_CRON_SECRET)
 * Set CRON_SECRET or REFUND_CRON_SECRET in Netlify env.
 */
import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { paystackService } from "@/lib/paystack"

const CRON_SECRET = process.env.CRON_SECRET || process.env.REFUND_CRON_SECRET

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const secret = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : request.nextUrl.searchParams.get("secret") ?? ""
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const summary = { processed: 0, skipped: 0, errors: [] as string[] }

  try {
    // Funded escrows for tasks with no assigned freelancer, created at least 14 days ago
    const { data: escrows, error: escrowError } = await supabase
      .from("escrow_accounts")
      .select("id, task_id, client_id, amount, status, created_at")
      .eq("status", "funded")
      .lt("created_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())

    if (escrowError) {
      console.error("Refund cron: escrow fetch error", escrowError)
      return NextResponse.json({ error: escrowError.message, summary }, { status: 500 })
    }

    if (!escrows?.length) {
      return NextResponse.json({ success: true, summary: { ...summary, message: "No eligible escrows" } })
    }

    for (const escrow of escrows) {
      const { data: task } = await supabase
        .from("tasks")
        .select("id, assigned_freelancer_id")
        .eq("id", escrow.task_id)
        .single()

      if (!task || task.assigned_freelancer_id != null) {
        summary.skipped += 1
        continue
      }

      const { data: bankAccounts } = await supabase
        .from("bank_accounts")
        .select("id, account_name, account_number, bank_code")
        .eq("user_id", escrow.client_id)
        .order("is_default", { ascending: false })
        .order("is_verified", { ascending: false })
        .limit(1)

      const bank = bankAccounts?.[0]
      if (!bank?.account_number || !bank?.bank_code || !bank?.account_name) {
        summary.skipped += 1
        summary.errors.push(`Escrow ${escrow.id}: no bank account for client ${escrow.client_id}`)
        continue
      }

      try {
        const recipient = await paystackService.createTransferRecipient({
          type: "nuban",
          name: bank.account_name,
          account_number: bank.account_number,
          bank_code: bank.bank_code,
        })
        if (!recipient.status || !recipient.data?.recipient_code) {
          summary.errors.push(`Escrow ${escrow.id}: create recipient failed — ${recipient.message ?? "unknown"}`)
          continue
        }

        const amountNaira = Number(escrow.amount)
        const transfer = await paystackService.initiateTransfer({
          source: "balance",
          amount: amountNaira,
          recipient: recipient.data.recipient_code,
          reason: "Escrow refund — no freelancer awarded within 2 weeks",
          reference: `TL_REFUND_${Date.now()}_${escrow.id}`,
        })

        if (!transfer.status) {
          summary.errors.push(`Escrow ${escrow.id}: transfer failed — ${transfer.message ?? "unknown"}`)
          continue
        }

        const { error: updateErr } = await supabase
          .from("escrow_accounts")
          .update({ status: "refunded", updated_at: new Date().toISOString() })
          .eq("id", escrow.id)

        if (updateErr) {
          summary.errors.push(`Escrow ${escrow.id}: DB update failed — ${updateErr.message}`)
          continue
        }
        summary.processed += 1
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        summary.errors.push(`Escrow ${escrow.id}: ${msg}`)
      }
    }

    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error("Refund cron error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error", summary },
      { status: 500 },
    )
  }
}
