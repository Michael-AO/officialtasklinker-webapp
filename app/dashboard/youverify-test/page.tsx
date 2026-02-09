"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Loader2, ChevronDown, ChevronRight } from "lucide-react"

type EndpointResult = {
  endpoint: string
  method: string
  status: number | null
  ok: boolean | null
  body: unknown
  error?: string
  durationMs?: number
}

const ENDPOINTS = [
  {
    id: "health",
    label: "Health check",
    method: "GET",
    path: "/api/verification/youverify/start",
    description: "Config status, masked baseUrl, environment (no auth).",
  },
  {
    id: "start",
    label: "Start session",
    method: "POST",
    path: "/api/verification/youverify/start",
    description: "Get sessionId for YouVerify SDK (requires auth).",
  },
] as const

export default function YouVerifyTestPage() {
  const [results, setResults] = useState<Record<string, EndpointResult>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [webhookPayload, setWebhookPayload] = useState(
    JSON.stringify(
      {
        event: "verification.approved",
        data: {
          status: "approved",
          customerId: "test-customer-123",
          metadata: { userId: "REPLACE_WITH_REAL_USER_UUID", email: "test@example.com" },
        },
      },
      null,
      2
    )
  )
  const [webhookResult, setWebhookResult] = useState<EndpointResult | null>(null)
  const [webhookLoading, setWebhookLoading] = useState(false)

  const [ninInput, setNinInput] = useState("")
  const [premiumNin, setPremiumNin] = useState(false)
  const [validationFirstName, setValidationFirstName] = useState("")
  const [validationLastName, setValidationLastName] = useState("")
  const [validationDateOfBirth, setValidationDateOfBirth] = useState("")
  const [validationSelfieImage, setValidationSelfieImage] = useState("")
  const [ninResult, setNinResult] = useState<EndpointResult | null>(null)
  const [ninLoading, setNinLoading] = useState(false)
  const [validationsOpen, setValidationsOpen] = useState(false)

  async function testEndpoint(id: string, method: string, path: string) {
    setLoading(id)
    const start = Date.now()
    try {
      const res = await fetch(path, { method, credentials: "include" })
      const durationMs = Date.now() - start
      let body: unknown
      try {
        body = await res.json()
      } catch {
        body = { _raw: await res.text() }
      }
      setResults((prev) => ({
        ...prev,
        [id]: {
          endpoint: path,
          method,
          status: res.status,
          ok: res.ok,
          body,
          durationMs,
        },
      }))
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [id]: {
          endpoint: path,
          method,
          status: null,
          ok: null,
          body: {},
          error: err instanceof Error ? err.message : "Request failed",
          durationMs: Date.now() - start,
        },
      }))
    } finally {
      setLoading(null)
    }
  }

  async function testWebhook() {
    setWebhookLoading(true)
    const start = Date.now()
    try {
      let payload: unknown
      try {
        payload = JSON.parse(webhookPayload)
      } catch {
        setWebhookResult({
          endpoint: "/api/debug/youverify-webhook-test",
          method: "POST",
          status: null,
          ok: false,
          body: {},
          error: "Invalid JSON in payload",
          durationMs: Date.now() - start,
        })
        return
      }
      const res = await fetch("/api/debug/youverify-webhook-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ payload }),
      })
      const durationMs = Date.now() - start
      let body: unknown
      try {
        body = await res.json()
      } catch {
        body = { _raw: await res.text() }
      }
      setWebhookResult({
        endpoint: "/api/debug/youverify-webhook-test → /api/webhooks/youverify",
        method: "POST",
        status: res.status,
        ok: res.ok,
        body,
        durationMs,
      })
    } catch (err) {
      setWebhookResult({
        endpoint: "/api/debug/youverify-webhook-test",
        method: "POST",
        status: null,
        ok: null,
        body: {},
        error: err instanceof Error ? err.message : "Request failed",
        durationMs: Date.now() - start,
      })
    } finally {
      setWebhookLoading(false)
    }
  }

  async function testNin() {
    const nin = ninInput.trim().replace(/\s/g, "")
    if (!nin || !/^\d{11}$/.test(nin)) {
      setNinResult({
        endpoint: "/api/verification/youverify/nin",
        method: "POST",
        status: null,
        ok: false,
        body: { error: "Please enter an 11-digit NIN." },
        error: "Invalid NIN",
      })
      return
    }
    setNinLoading(true)
    const start = Date.now()
    try {
      const body: { nin: string; premiumNin?: boolean; validations?: unknown } = {
        nin,
        premiumNin: premiumNin || undefined,
      }
      const hasDataValidation =
        validationFirstName.trim() ||
        validationLastName.trim() ||
        validationDateOfBirth.trim()
      const hasSelfieValidation = validationSelfieImage.trim()
      if (hasDataValidation) {
        body.validations = {
          data: {
            ...(validationFirstName.trim() && { firstName: validationFirstName.trim() }),
            ...(validationLastName.trim() && { lastName: validationLastName.trim() }),
            ...(validationDateOfBirth.trim() && { dateOfBirth: validationDateOfBirth.trim() }),
          },
        }
      } else if (hasSelfieValidation) {
        body.validations = {
          selfie: { image: validationSelfieImage.trim() },
        }
      }

      const res = await fetch("/api/verification/youverify/nin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const durationMs = Date.now() - start
      let resBody: unknown
      try {
        resBody = await res.json()
      } catch {
        resBody = { _raw: await res.text() }
      }
      setNinResult({
        endpoint: "/api/verification/youverify/nin",
        method: "POST",
        status: res.status,
        ok: res.ok,
        body: resBody,
        durationMs,
      })
    } catch (err) {
      setNinResult({
        endpoint: "/api/verification/youverify/nin",
        method: "POST",
        status: null,
        ok: null,
        body: {},
        error: err instanceof Error ? err.message : "Request failed",
        durationMs: Date.now() - start,
      })
    } finally {
      setNinLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">YouVerify API Test</h1>
          <p className="text-muted-foreground mt-1">
            Hit each endpoint and inspect status, response body, and errors.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!!loading}
          onClick={() => {
            testEndpoint("health", "GET", "/api/verification/youverify/start")
            setTimeout(
              () =>
                testEndpoint("start", "POST", "/api/verification/youverify/start"),
              300
            )
          }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test health + start"}
        </Button>
      </div>

      {ENDPOINTS.map((ep) => {
        const r = results[ep.id]
        return (
          <Card key={ep.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {ep.method}
                    </Badge>
                    {ep.label}
                  </CardTitle>
                  <CardDescription className="mt-1 font-mono text-xs">
                    {ep.path}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => testEndpoint(ep.id, ep.method, ep.path)}
                  disabled={loading === ep.id}
                >
                  {loading === ep.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Test"
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{ep.description}</p>
            </CardHeader>
            {r && (
              <CardContent className="space-y-2 pt-0">
                <div className="flex gap-2 items-center flex-wrap">
                  {r.status != null && (
                    <Badge variant={r.ok ? "default" : "destructive"}>
                      {r.status}
                    </Badge>
                  )}
                  {r.durationMs != null && (
                    <span className="text-xs text-muted-foreground">
                      {r.durationMs} ms
                    </span>
                  )}
                  {r.error && (
                    <span className="text-sm text-destructive">{r.error}</span>
                  )}
                </div>
                <pre className="bg-muted rounded-md p-3 text-xs overflow-auto max-h-64">
                  {JSON.stringify(r.body, null, 2)}
                </pre>
              </CardContent>
            )}
          </Card>
        )
      })}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  POST
                </Badge>
                Verify NIN (Nigeria)
              </CardTitle>
              <CardDescription className="mt-1 font-mono text-xs">
                /api/verification/youverify/nin
              </CardDescription>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Verify a Nigerian National Identification Number (11 digits). Optional: premium NIN, or validations (name/DOB or selfie image).
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid gap-2">
            <Label htmlFor="nin-input">NIN (11 digits)</Label>
            <Input
              id="nin-input"
              type="text"
              inputMode="numeric"
              maxLength={11}
              placeholder="e.g. 11111111111"
              value={ninInput}
              onChange={(e) => setNinInput(e.target.value.replace(/\D/g, ""))}
              className="font-mono max-w-[200px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="premium-nin"
              checked={premiumNin}
              onCheckedChange={(checked) => setPremiumNin(checked === true)}
            />
            <Label htmlFor="premium-nin" className="text-sm font-normal cursor-pointer">
              Premium NIN
            </Label>
          </div>
          <Collapsible open={validationsOpen} onOpenChange={setValidationsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 px-0">
                {validationsOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Validations (optional)
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground">
                Validate against name/DOB or provide selfie image (URL or base64).
              </p>
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="val-first" className="text-xs">First name</Label>
                  <Input
                    id="val-first"
                    className="font-mono text-sm"
                    placeholder="Sarah"
                    value={validationFirstName}
                    onChange={(e) => setValidationFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="val-last" className="text-xs">Last name</Label>
                  <Input
                    id="val-last"
                    className="font-mono text-sm"
                    placeholder="Doe"
                    value={validationLastName}
                    onChange={(e) => setValidationLastName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="val-dob" className="text-xs">Date of birth</Label>
                  <Input
                    id="val-dob"
                    className="font-mono text-sm"
                    placeholder="1988-04-04"
                    value={validationDateOfBirth}
                    onChange={(e) => setValidationDateOfBirth(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="val-selfie" className="text-xs">Selfie image (URL or base64)</Label>
                <Textarea
                  id="val-selfie"
                  className="font-mono text-xs min-h-[60px]"
                  placeholder="URL or base64 string"
                  value={validationSelfieImage}
                  onChange={(e) => setValidationSelfieImage(e.target.value)}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
          <Button
            size="sm"
            variant="secondary"
            onClick={testNin}
            disabled={ninLoading}
          >
            {ninLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Verify NIN"
            )}
          </Button>
          {ninResult && (
            <>
              <div className="flex gap-2 items-center flex-wrap">
                {ninResult.status != null && (
                  <Badge variant={ninResult.ok ? "default" : "destructive"}>
                    {ninResult.status}
                  </Badge>
                )}
                {ninResult.durationMs != null && (
                  <span className="text-xs text-muted-foreground">
                    {ninResult.durationMs} ms
                  </span>
                )}
                {ninResult.error && (
                  <span className="text-sm text-destructive">{ninResult.error}</span>
                )}
              </div>
              <pre className="bg-muted rounded-md p-3 text-xs overflow-auto max-h-64">
                {JSON.stringify(ninResult.body, null, 2)}
              </pre>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  POST
                </Badge>
                Webhook (simulated)
              </CardTitle>
              <CardDescription className="mt-1 font-mono text-xs">
                /api/debug/youverify-webhook-test → /api/webhooks/youverify
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={testWebhook}
              disabled={webhookLoading}
            >
              {webhookLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send signed webhook"
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Sends the payload below with a valid HMAC signature to the webhook.
            Set <code className="bg-muted px-1 rounded">data.metadata.userId</code> to a real user UUID to
            update that user.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <Textarea
            className="font-mono text-xs min-h-[180px]"
            value={webhookPayload}
            onChange={(e) => setWebhookPayload(e.target.value)}
            placeholder="Webhook JSON payload"
          />
          {webhookResult && (
            <>
              <div className="flex gap-2 items-center flex-wrap">
                {webhookResult.status != null && (
                  <Badge
                    variant={webhookResult.ok ? "default" : "destructive"}
                  >
                    {webhookResult.status}
                  </Badge>
                )}
                {webhookResult.durationMs != null && (
                  <span className="text-xs text-muted-foreground">
                    {webhookResult.durationMs} ms
                  </span>
                )}
                {webhookResult.error && (
                  <span className="text-sm text-destructive">
                    {webhookResult.error}
                  </span>
                )}
              </div>
              <pre className="bg-muted rounded-md p-3 text-xs overflow-auto max-h-64">
                {JSON.stringify(webhookResult.body, null, 2)}
              </pre>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
