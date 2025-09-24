// Test environment variables
console.log("🔧 Environment Variables Test:");
console.log("NEXT_PUBLIC_DOJAH_APP_ID:", process.env.NEXT_PUBLIC_DOJAH_APP_ID);
console.log("NEXT_PUBLIC_DOJAH_PUBLIC_KEY:", process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY);
console.log("NEXT_PUBLIC_DOJAH_ENVIRONMENT:", process.env.NEXT_PUBLIC_DOJAH_ENVIRONMENT);

// Check if they match what we expect
const expectedAppId = "6875f7ffcb4d46700c74336e";
const expectedPublicKey = "test_pk_TNoLXCX4T96k0WdbLnFJGYipd";
const expectedEnvironment = "test";

console.log("\n✅ Expected vs Actual:");
console.log("App ID matches:", process.env.NEXT_PUBLIC_DOJAH_APP_ID === expectedAppId);
console.log("Public Key matches:", process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY === expectedPublicKey);
console.log("Environment matches:", process.env.NEXT_PUBLIC_DOJAH_ENVIRONMENT === expectedEnvironment);

// Check if public key starts with test_
console.log("Public Key starts with 'test_pk_':", process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY?.startsWith("test_pk_"));
