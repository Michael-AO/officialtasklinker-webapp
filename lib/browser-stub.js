/**
 * Stub for Node-only modules (e.g. "ws") when bundled for the browser.
 * Prevents "Cannot read properties of undefined (reading 'call')" from
 * @supabase/realtime-js trying to use ws in the client bundle.
 */
module.exports = function Stub() {}
module.exports.Stub = Stub
