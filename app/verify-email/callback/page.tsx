"use client"

import { Suspense } from "react";
import CallbackPageContent from "./CallbackPageContent";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'

export default function VerifyEmailCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackPageContent />
    </Suspense>
  );
} 