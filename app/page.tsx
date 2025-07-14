"use client";

import { ArrowRight, Shield, Users, Menu, X, Calendar } from "lucide-react"
import { NairaIcon } from "@/components/naira-icon"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin, Star } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"

// Add a helper for relative time
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

// Add a helper for 'June 25th, 2025' style date
function formatFullDate(dateString: string) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  // Get ordinal suffix
  function ordinal(n: number) {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
  return `${month} ${day}${ordinal(day)}, ${year}`;
}

export default function HomePage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paidText, setPaidText] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true)
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, description, budget_min, budget_max, budget_type, location, created_at, skills_required")
        .eq("status", "active")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(6)
      setTasks(data || [])
      setLoading(false)
    }
    fetchTasks()
  }, [])

  // Typewriter effect for 'Paid'
  useEffect(() => {
    const fullText = "Paid.";
    let idx = 0;
    setPaidText("");
    const interval = setInterval(() => {
      setPaidText(fullText.slice(0, idx + 1));
      idx++;
      if (idx === fullText.length) {
        clearInterval(interval);
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="w-full fixed top-0 left-0 z-50 border-b bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-5 flex items-center min-h-[72px]">
          <Link className="flex items-center justify-center" href="/">
            <img src="/logo-icon.svg" alt="Tasklinkers Logo" className="h-8 w-8 md:h-10 md:w-10" />
            <span className="ml-2 text-xl md:text-2xl font-bold">Tasklinkers</span>
          </Link>
          {/* Desktop nav */}
          <nav className="ml-auto hidden md:flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
              Features
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
              How It Works
            </Link>
          </nav>
          <div className="ml-4 hidden md:flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
          {/* Mobile hamburger + Get Started */}
          <div className="ml-auto flex md:hidden items-center gap-2">
            <Button asChild size="sm" className="px-3 py-2">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button variant="ghost" size="icon" className="p-2" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        {/* Mobile menu overlay */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileNavOpen(false)} />
        )}
        {/* Mobile menu drawer */}
        <div className={`fixed top-0 right-0 z-50 h-full w-4/5 max-w-xs md:hidden transition-transform duration-200 ${mobileNavOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ willChange: 'transform', pointerEvents: mobileNavOpen ? 'auto' : 'none', backgroundColor: '#fff' }}
        >
          <div className="flex flex-col h-full bg-white">
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <span className="text-xl font-bold">Menu</span>
              <Button variant="ghost" size="icon" className="p-2" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex flex-col gap-2 px-4 py-6 flex-1">
              <Link href="#features" className="py-2 text-base font-medium hover:underline" onClick={() => setMobileNavOpen(false)}>
                Features
              </Link>
              <Link href="#how-it-works" className="py-2 text-base font-medium hover:underline" onClick={() => setMobileNavOpen(false)}>
                How It Works
              </Link>
              <Link href="/login" className="py-2 text-base font-medium hover:underline" onClick={() => setMobileNavOpen(false)}>
                Sign In
              </Link>
              <Button asChild className="mt-4 w-full">
                <Link href="/signup" onClick={() => setMobileNavOpen(false)}>Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-[88px]">
        {/* Hero Section */}
        <section className="w-full min-h-screen flex items-center text-white" style={{ backgroundColor: "#04A466" }}>
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Connect. Work. Get <span className="inline-block min-w-[3.5ch] border-r-2 border-white animate-blink caret-transparent">{paidText}</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-white/90 md:text-xl">
                  The secure platform where freelancers and clients meet. Post tasks, find talent, and manage payments
                  with confidence through our escrow system.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Start Finding Tasks <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white text-black border-white hover:bg-gray-100"
                  asChild
                >
                  <Link href="/signup">Post a Task</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Tasks Section */}
        <section className="w-full py-8 md:py-16 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Recent Tasks</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mt-4">
                Discover the latest opportunities from our community
              </p>
            </div>

            <div className="flex flex-row gap-4 pb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <Card key={i} className="min-w-[350px] max-w-[450px] flex-shrink-0 animate-pulse opacity-60">
                    <CardHeader>
                      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-1/2 bg-gray-100 rounded mb-2" />
                      <div className="h-4 w-1/3 bg-gray-100 rounded mb-2" />
                      <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                      <div className="h-4 w-2/3 bg-gray-100 rounded" />
                    </CardHeader>
                  </Card>
                ))
              ) : tasks.length === 0 ? (
                <div className="text-center w-full text-gray-500 py-8">No recent tasks found.</div>
              ) : (
                tasks.map((task) => (
                  <Link href="/login" key={task.id} className="min-w-[350px] max-w-[450px] flex-shrink-0">
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                      <CardHeader className="relative">
                        {/* Title */}
                        <CardTitle
                          className="text-lg font-semibold truncate pr-32 max-w-[calc(100%-3.5rem)] md:max-w-[calc(100%-5rem)]"
                          title={task.title}
                        >
                          {task.title}
                        </CardTitle>
                        {/* Date and Location (no gap below title) */}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatFullDate(task.created_at)}</span>
                          <span className="mx-1">•</span>
                          <span>{task.location || "Remote"}</span>
                        </div>
                        {/* Small gap before description */}
                        <div className="h-2" />
                        {/* Description */}
                        <CardDescription className="mb-4 line-clamp-2 text-sm text-gray-700">{task.description}</CardDescription>
                        {/* Bottom: Skills left, Duration right */}
                        <div className="flex items-end justify-between mt-4">
                          <div className="flex flex-wrap gap-2">
                            {(task.skills_required || []).slice(0, 3).map((skill: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{skill}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{task.duration || "-"}</span>
                          </div>
                        </div>
                        {/* Budget at top right */}
                        <div className="absolute top-4 right-4 text-right">
                          <div className="text-lg font-bold text-green-600">₦{task.budget_max?.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{task.budget_type === "hourly" ? "Hourly" : "Fixed Price"}</div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))
              )}
            </div>
            <div className="text-center mt-8">
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">View All Tasks</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-8 md:py-16 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose Tasklinkers?</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mt-4">
                Everything you need to manage freelance work safely and efficiently.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8" style={{ color: "#04A466" }} />
                  <CardTitle>Secure Escrow System</CardTitle>
                  <CardDescription>
                    Your payments are protected. Funds are held securely until work is completed to satisfaction.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8" style={{ color: "#04A466" }} />
                  <CardTitle>Quality Talent Pool</CardTitle>
                  <CardDescription>
                    Connect with verified freelancers and trusted clients. Build lasting professional relationships.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <NairaIcon className="h-8 w-8" style={{ color: "#04A466" }} />
                  <CardTitle>Transparent Pricing</CardTitle>
                  <CardDescription>
                    No hidden fees. Clear pricing structure with competitive rates for both freelancers and clients.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-8 md:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mt-4">Get started in three simple steps</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white font-bold text-lg mb-4"
                  style={{ backgroundColor: "#04A466" }}
                >
                  1
                </div>
                <h3 className="text-xl font-bold mb-2">Post or Browse Tasks</h3>
                <p className="text-gray-500">
                  Clients post tasks with clear requirements. Freelancers browse and find opportunities that match their
                  skills.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white font-bold text-lg mb-4"
                  style={{ backgroundColor: "#04A466" }}
                >
                  2
                </div>
                <h3 className="text-xl font-bold mb-2">Connect & Collaborate</h3>
                <p className="text-gray-500">
                  Apply to tasks or review applications. Communicate directly and agree on terms before starting work.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white font-bold text-lg mb-4"
                  style={{ backgroundColor: "#04A466" }}
                >
                  3
                </div>
                <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
                <p className="text-gray-500">
                  Payments are held in escrow until work is completed. Both parties are protected throughout the
                  process.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-8 md:py-16 lg:py-20">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Frequently Asked Questions
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mt-4">
                Everything you need to know about Tasklinkers
              </p>
            </div>
            <div className="max-w-4xl mx-auto space-y-4">
              <details className="group border border-gray-200 rounded-lg">
                <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50">
                  <h3 className="text-lg font-semibold">How does Tasklinkers work?</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  Tasklinkers connects freelancers with clients through a secure platform. Clients post tasks,
                  freelancers apply, and payments are protected through our escrow system until work is completed
                  satisfactorily.
                </div>
              </details>

              <details className="group border border-gray-200 rounded-lg">
                <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50">
                  <h3 className="text-lg font-semibold">How does the escrow system work?</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  Our escrow system holds client payments securely until work is completed. This protects both parties -
                  freelancers are guaranteed payment for completed work, and clients only pay when satisfied with
                  deliverables.
                </div>
              </details>

              <details className="group border border-gray-200 rounded-lg">
                <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50">
                  <h3 className="text-lg font-semibold">What fees does Tasklinkers charge?</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  We charge a competitive service fee of 5% for freelancers and 3% for clients. Payment processing fees
                  are handled by our secure payment partner, Paystack. No hidden fees or surprise charges.
                </div>
              </details>

              <details className="group border border-gray-200 rounded-lg">
                <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50">
                  <h3 className="text-lg font-semibold">How do I get started as a freelancer?</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  Simply sign up, complete your profile with your skills and portfolio, then browse available tasks.
                  Apply to projects that match your expertise and start building your reputation on the platform.
                </div>
              </details>

              <details className="group border border-gray-200 rounded-lg">
                <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50">
                  <h3 className="text-lg font-semibold">How do I post a task as a client?</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  Create an account, click "Post a Task," provide detailed project requirements, set your budget, and
                  publish. You'll receive applications from qualified freelancers within hours.
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-8 md:py-16 lg:py-20 text-white" style={{ backgroundColor: "#04A466" }}>
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
                <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl">
                  Join thousands of freelancers and clients who trust Tasklinkers for their projects.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup">Join as Freelancer</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-black text-white border-black hover:bg-gray-800"
                  asChild
                >
                  <Link href="/signup">Hire Talent</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2025 Tasklinkers. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="/legal">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/legal">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
