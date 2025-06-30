import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    console.log("[confirm-user] Called with userId:", userId);
    if (!userId) {
      console.log("[confirm-user] Missing userId");
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      console.error("[confirm-user] Supabase admin error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[confirm-user] Success:", data);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[confirm-user] Exception:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 