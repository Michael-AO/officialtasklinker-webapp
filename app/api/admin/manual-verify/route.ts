import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    console.log("🚨 EMERGENCY: Manual verification API called");
    
    const { userId, adminEmail } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Update user verification status
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        is_verified: true,
        dojah_verified: true,
        verification_type: "manual_admin_override",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("❌ Manual verification error:", error);
      return NextResponse.json(
        { error: "Failed to update user verification status" },
        { status: 500 }
      );
    }

    console.log(`✅ EMERGENCY: User ${updatedUser.email} manually verified by ${adminEmail || 'admin'}`);

    return NextResponse.json({
      success: true,
      message: "User manually verified successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        is_verified: updatedUser.is_verified,
        dojah_verified: updatedUser.dojah_verified,
        verification_type: updatedUser.verification_type,
      }
    });

  } catch (error) {
    console.error("❌ Manual verification API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
