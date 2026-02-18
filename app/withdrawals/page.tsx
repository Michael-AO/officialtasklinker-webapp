import { redirect } from "next/navigation"

/**
 * Canonical withdrawals page is /dashboard/payments/withdrawals.
 * Redirect to avoid duplicate routes and ensure real data is used.
 */
export default function WithdrawalsRedirectPage() {
  redirect("/dashboard/payments/withdrawals")
}
