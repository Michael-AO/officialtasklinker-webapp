'use client'

export default function ManualVerificationFallback() {
  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h3 className="font-bold text-yellow-800">AI Verification Required</h3>
      <p className="text-yellow-600 mb-4">
        Our automated verification system is temporarily unavailable. 
        Please contact support to complete your verification manually.
      </p>
      
      <div className="space-y-2">
        <a 
          href="mailto:support@tasklinker.com"
          className="inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Email Support
        </a>
        
        <button 
          onClick={() => window.location.reload()}
          className="ml-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Try Again
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 rounded text-sm text-yellow-700">
        <p><strong>What to include in your email:</strong></p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Your full name and email address</li>
          <li>Account type (Individual or Business)</li>
          <li>Government-issued ID (passport, driver's license, or national ID)</li>
          <li>Proof of address (utility bill or bank statement)</li>
          <li>For business accounts: business registration documents</li>
        </ul>
      </div>
    </div>
  )
}
