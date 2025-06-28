import ResetPasswordPage from "@/components/reset-password-page"

// Prevent prerendering since this page uses client-side hooks
export const dynamic = "force-dynamic"

export default function ResetPassword() {
  return <ResetPasswordPage />
}
