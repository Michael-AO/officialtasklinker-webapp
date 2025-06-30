import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { userId, token } = await request.json();

    if (!userId && !token) {
      return NextResponse.json(
        { error: "User ID or confirmation token is required" },
        { status: 400 }
      );
    }

    let userEmail: string | null = null;

    // If we have a token, verify it with Supabase
    if (token) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup'
      });

      if (error) {
        console.error("Token verification error:", error);
        return NextResponse.json(
          { error: "Invalid or expired confirmation token" },
          { status: 400 }
        );
      }

      if (data.user) {
        userEmail = data.user.email;
      }
    } else if (userId) {
      // If we have userId, get user info
      const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
      
      if (error || !user) {
        console.error("User lookup error:", error);
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      userEmail = user.email;
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "Could not determine user email" },
        { status: 400 }
      );
    }

    // Mark user as verified in our database
    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("email", userEmail);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update user verification status" },
        { status: 500 }
      );
    }

    console.log(`✅ User ${userEmail} marked as verified`);

    return NextResponse.json({
      success: true,
      message: "User confirmed successfully",
      email: userEmail
    });

  } catch (error) {
    console.error("Confirm user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 