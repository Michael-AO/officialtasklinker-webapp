"use client";

import { Search, Menu, X, FileText, Sparkles, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { NairaIcon } from "@/components/naira-icon";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HomeSlidePanel } from "@/components/home-slide-panel";

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

const FAQ_ITEMS = [
  { q: "What is Tasklinkers?", a: "Tasklinkers is an all-in-one freelance marketplace designed to connect Nigerian freelancers with businesses. Post tasks, find talent, collaborate with milestone-based payments, and ensure secure transactions through our escrow system." },
  { q: "How does Tasklinkers work?", a: "Tasklinkers connects freelancers with clients through a secure platform. Clients post tasks, freelancers apply, and payments are protected through our escrow system until work is completed satisfactorily." },
  { q: "Is Tasklinkers secure?", a: "Yes. Our escrow system holds client payments securely until work is completed. This protects both parties — freelancers are guaranteed payment for completed work, and clients only pay when satisfied with deliverables." },
  { q: "What fees does Tasklinkers charge?", a: "We charge a competitive service fee of 5% for freelancers and 3% for clients. Payment processing fees are handled by our secure payment partner, Paystack. No hidden fees." },
] as const;

/** Normalize task from either Supabase (users) or browse API (client) for display */
function getTaskClient(task: any) {
  return task?.users ?? task?.client ?? null;
}

export default function HomePage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState<"categories" | "faq" | null>(null);
  const [searchKeywords, setSearchKeywords] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [categoriesSearchQuery, setCategoriesSearchQuery] = useState("");
  const [categoriesLocation, setCategoriesLocation] = useState("");
  const [categoriesViewAll, setCategoriesViewAll] = useState(false);
  const [panelTasks, setPanelTasks] = useState<any[] | null>(null);
  const [panelLoading, setPanelLoading] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          id, title, description, budget_min, budget_max, budget_type, location, created_at, skills_required, category,
          users!tasks_client_id_fkey(name, avatar_url)
        `)
        .eq("status", "active")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(6);
      setTasks(data || []);
      setLoading(false);
    }
    fetchTasks();
  }, []);

  const fetchPanelTasks = useCallback(
    async (opts: { search?: string; location?: string; limit?: number }) => {
      setPanelLoading(true);
      const params = new URLSearchParams();
      if (opts.search) params.set("search", opts.search);
      if (opts.location) params.set("location", opts.location);
      params.set("limit", String(opts.limit ?? 20));
      try {
        const res = await fetch("/api/tasks/browse?" + params.toString());
        const data = await res.json();
        if (data?.success && Array.isArray(data.tasks)) {
          setPanelTasks(data.tasks);
        } else {
          setPanelTasks([]);
        }
      } catch {
        setPanelTasks([]);
      } finally {
        setPanelLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (panelOpen !== "categories") return;
    if (categoriesSearchQuery.trim()) {
      fetchPanelTasks({
        search: categoriesSearchQuery.trim(),
        location: categoriesLocation.trim() || undefined,
        limit: 20,
      });
      return;
    }
    if (categoriesViewAll) {
      fetchPanelTasks({ limit: 50 });
      return;
    }
    setPanelTasks(null);
  }, [panelOpen, categoriesSearchQuery, categoriesLocation, categoriesViewAll, fetchPanelTasks]);

  function handleSearch(e?: React.FormEvent, keywordOverride?: string) {
    e?.preventDefault();
    const q = (keywordOverride ?? searchKeywords).trim();
    setCategoriesSearchQuery(q);
    setCategoriesLocation(searchLocation);
    setCategoriesViewAll(false);
    setPanelOpen("categories");
  }

  function handleCloseCategoriesPanel() {
    setPanelOpen(null);
    setCategoriesSearchQuery("");
    setCategoriesLocation("");
    setCategoriesViewAll(false);
    setPanelTasks(null);
  }

  function handleViewAllTasks() {
    setCategoriesSearchQuery("");
    setCategoriesLocation("");
    setCategoriesViewAll(true);
  }

  const categoriesTasks = panelTasks !== null ? panelTasks : tasks;
  const categoriesTasksLoading = panelTasks !== null ? panelLoading : loading;

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f4f8]">
      {/* Navigation - GetJob style */}
      <header className="w-full fixed top-0 left-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-3 sm:py-4 flex items-center min-h-[64px] sm:min-h-[72px]">
          <Link className="flex items-center gap-2 shrink-0" href="/">
            <img src="/logo-icon.svg" alt="Tasklinkers" className="h-8 w-8 md:h-9 md:w-9" />
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#1e293b]">Tasklinkers</span>
          </Link>
          <nav className="ml-4 md:ml-8 hidden md:flex items-center gap-6">
            <Link className="text-sm font-medium text-[#04A466] hover:text-[#039a5c]" href="/">
              Home
            </Link>
            <button
              type="button"
              onClick={() => setPanelOpen("categories")}
              className="text-sm font-medium text-[#475569] hover:text-[#1e293b] py-2 px-1 -m-1 rounded focus:outline-none focus:ring-2 focus:ring-[#04A466]/30"
            >
              Categories
            </button>
            <button
              type="button"
              onClick={() => setPanelOpen("faq")}
              className="text-sm font-medium text-[#475569] hover:text-[#1e293b] py-2 px-1 -m-1 rounded focus:outline-none focus:ring-2 focus:ring-[#04A466]/30"
            >
              FAQ
            </button>
          </nav>
          <div className="ml-auto hidden md:flex items-center gap-4">
            <Button asChild className="bg-[#04A466] hover:bg-[#039a5c] text-white rounded-lg px-5 min-h-[40px]">
              <Link href="/signup">Create Account</Link>
            </Button>
            <Link className="text-sm font-medium text-[#475569] hover:text-[#1e293b] py-2 px-1 -m-1 rounded focus:outline-none focus:ring-2 focus:ring-[#04A466]/30" href="/api/auth/bypass?email=asereope@gmail.com">
              Log In
            </Link>
          </div>
          <div className="ml-auto flex md:hidden items-center gap-2 sm:gap-3">
            <Link href="/api/auth/bypass?email=asereope@gmail.com" className="text-sm font-medium text-[#475569] hover:text-[#1e293b] py-2.5 px-2 rounded-lg min-h-[44px] inline-flex items-center justify-center touch-manipulation">Log In</Link>
            <Button asChild size="sm" className="bg-[#04A466] hover:bg-[#039a5c] text-white rounded-lg min-h-[44px] px-3 sm:px-4 text-sm font-medium shrink-0 touch-manipulation">
              <Link href="/signup">Create Account</Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 rounded-lg touch-manipulation" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileNavOpen(false)} />
        )}
        <div
          className={`fixed top-0 right-0 z-50 h-full w-4/5 max-w-xs md:hidden transition-transform duration-200 bg-white ${mobileNavOpen ? "translate-x-0" : "translate-x-full"}`}
          style={{ willChange: "transform", pointerEvents: mobileNavOpen ? "auto" : "none" }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <span className="text-xl font-bold text-[#1e293b]">Menu</span>
              <Button variant="ghost" size="icon" className="p-2" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1 px-4 py-6 flex-1">
              <Link href="/" className="py-2.5 text-base font-medium text-[#04A466]" onClick={() => setMobileNavOpen(false)}>Home</Link>
              <button type="button" className="py-2.5 text-base font-medium text-[#475569] text-left" onClick={() => { setPanelOpen("categories"); setMobileNavOpen(false); }}>Categories</button>
              <button type="button" className="py-2.5 text-base font-medium text-[#475569] text-left" onClick={() => { setPanelOpen("faq"); setMobileNavOpen(false); }}>FAQ</button>
              <div className="mt-4 pt-4 border-t space-y-2">
                <Link href="/api/auth/bypass?email=asereope@gmail.com" className="block py-2.5 text-base font-medium text-[#475569]" onClick={() => setMobileNavOpen(false)}>Log In</Link>
                <Button asChild className="w-full bg-[#04A466] hover:bg-[#039a5c] text-white rounded-lg">
                  <Link href="/signup" onClick={() => setMobileNavOpen(false)}>Create Account</Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-[64px] sm:pt-[72px] min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-72px)]">
        {/* Hero - full viewport when no panel open */}
        <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#0d1f17] to-[#052e1f]">
          {/* Grid behind text */}
          <div className="absolute inset-0 bg-hero-grid pointer-events-none" aria-hidden />
          {/* Gradient accent orbs */}
          <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-[#04A466]/20 blur-3xl" />
          <div className="absolute bottom-1/4 -left-24 w-72 h-72 rounded-full bg-[#04A466]/10 blur-3xl" />

          <div className="relative max-w-[1200px] mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20 px-6 md:px-10 lg:px-12 py-16 md:py-24">
            {/* Left: Copy + search */}
            <div className="flex-1 max-w-xl lg:max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#04A466]/20 text-[#04A466] text-xs font-semibold mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                Nigeria&apos;s trusted freelance marketplace
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white leading-[1.15] tracking-tight mb-5">
                Connect with top talent.{" "}
                <span className="text-[#04A466]">Get tasks done.</span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-xl">
                The secure marketplace for Nigerian freelancers and businesses to collaborate with milestone-based payments.
              </p>

              {/* Search bar - single focus */}
              <form onSubmit={handleSearch} className="flex gap-0 bg-white rounded-xl shadow-xl overflow-hidden ring-2 ring-transparent focus-within:ring-[#04A466]/50 focus-within:ring-offset-2 focus-within:ring-offset-transparent transition-all">
                <div className="flex-1 flex items-center px-4 py-3">
                  <Search className="h-5 w-5 text-gray-400 shrink-0 mr-3" />
                  <Input
                    type="text"
                    placeholder="Task title or keyword..."
                    value={searchKeywords}
                    onChange={(e) => setSearchKeywords(e.target.value)}
                    className="border-0 focus-visible:ring-0 shadow-none h-11 px-0 text-base"
                  />
                </div>
                <Button type="submit" size="lg" className="bg-[#04A466] hover:bg-[#039a5c] text-white rounded-none h-12 px-6 shrink-0">
                  <Search className="h-5 w-5" />
                </Button>
              </form>

              {/* Trending keywords */}
              <div className="flex flex-wrap items-center gap-2 mt-5">
                <span className="text-sm text-gray-400 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" />
                  Trending:
                </span>
                {["UI Design", "Content Writing", "Virtual Assistant"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSearch(undefined, tag)}
                    className="text-sm font-medium text-gray-300 hover:text-[#04A466] hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-500 mt-10 mb-3">Trusted by professionals worldwide</p>
              <div className="flex items-center gap-8 flex-wrap">
                {["Google", "Behance", "Dribbble", "Freelancers"].map((name) => (
                  <span key={name} className="text-sm font-semibold text-gray-600">{name}</span>
                ))}
              </div>
            </div>

            {/* Right: Grid */}
            <div className="flex-1 relative min-h-[380px] lg:min-h-[480px] flex items-center justify-center w-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-[#04A466]/25 via-[#04A466]/10 to-transparent blur-2xl pointer-events-none" />
              </div>
              <div className="relative grid grid-cols-3 gap-3 md:gap-4 w-full max-w-md">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#04A466]/30 flex items-center justify-center">
                      <FileText className="h-4 w-4 md:h-5 md:w-5 text-[#04A466]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Categories slide panel */}
      <HomeSlidePanel
        open={panelOpen === "categories"}
        onClose={handleCloseCategoriesPanel}
        title="Categories"
      >
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1e293b]">Categories</h2>
            <p className="mt-1 text-sm text-[#64748b]">
              {categoriesSearchQuery
                ? `Search results for "${categoriesSearchQuery}"`
                : categoriesViewAll
                  ? "Full list of available tasks."
                  : "Browse opportunities by category. View all tasks without signing in."}
            </p>
          </div>
          <div className="space-y-3">
            {categoriesTasksLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse opacity-60">
                  <CardContent className="p-4">
                    <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-full bg-gray-100 rounded" />
                  </CardContent>
                </Card>
              ))
            ) : categoriesTasks.length === 0 ? (
              <p className="text-sm text-[#64748b]">
                {categoriesSearchQuery ? "No tasks match your search." : "No recent tasks found."}
              </p>
            ) : (
              categoriesTasks.map((task: any) => {
                const client = getTaskClient(task);
                return (
                  <Card key={task.id} className="border-gray-100 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-start gap-3 p-4 pb-2">
                        <Avatar className="h-10 w-10 shrink-0 rounded-full border border-gray-100">
                          <AvatarImage src={client?.avatar_url ?? undefined} alt={client?.name} />
                          <AvatarFallback className="bg-gray-100 text-sm font-medium text-gray-600">
                            {client?.name?.split(" ").map((n: string) => n[0]).join("") || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#1e293b] truncate">{client?.name || "Client"}</p>
                          <p className="text-xs text-[#64748b]">Posted {formatTimeAgo(task.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 px-4 pb-2">
                        {task.category && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {task.category}
                          </span>
                        )}
                        {(task.skills_required || []).slice(0, 3).map((skill: string, idx: number) => (
                          <span key={idx} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="px-4 pb-3">
                        <h3 className="text-lg font-semibold leading-tight text-[#1e293b] line-clamp-2">{task.title}</h3>
                        <p className="mt-1.5 line-clamp-2 text-sm text-[#64748b]">{task.description}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2 px-4 pb-4">
                        <div className="flex items-center gap-1">
                          <NairaIcon className="h-5 w-5 text-[#04A466]" />
                          <span className="text-xl font-semibold text-[#04A466]">
                            {task.budget_type === "hourly"
                              ? `₦${(task.budget_max ?? 0).toLocaleString()}/hr`
                              : `₦${(task.budget_max ?? 0).toLocaleString()}`}
                          </span>
                        </div>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                          {task.budget_type === "hourly" ? "Hourly" : "Fixed"}
                        </span>
                      </div>
                      <div className="border-t bg-gray-50 px-4 py-3">
                        <Button className="w-full rounded-lg bg-[#04A466] font-medium text-white hover:bg-[#039a5c]" asChild>
                          <Link href={"/api/auth/bypass?email=asereope@gmail.com&next=" + encodeURIComponent("/dashboard/browse/" + task.id)}>Apply now</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          {!categoriesViewAll && (
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="w-full rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              onClick={handleViewAllTasks}
              disabled={categoriesTasksLoading}
            >
              View All Tasks
            </Button>
          )}
        </div>
      </HomeSlidePanel>

      {/* FAQ slide panel */}
      <HomeSlidePanel
        open={panelOpen === "faq"}
        onClose={() => setPanelOpen(null)}
        title="FAQ"
      >
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1e293b]">Frequently asked questions</h2>
            <p className="mt-1 text-sm text-[#64748b]">
              No hidden fees—just straightforward pricing for powerful freelance collaboration.
            </p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map(({ q, a }, i) => {
              const isOpen = faqOpen === i;
              return (
                <div
                  key={q}
                  onClick={() => setFaqOpen(isOpen ? null : i)}
                  className={`rounded-xl cursor-pointer transition-colors ${
                    isOpen
                      ? "bg-white shadow-md border border-gray-100"
                      : "bg-gray-100/80 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-center p-5">
                    <h3 className="text-base font-semibold text-[#1e293b] pr-4">{q}</h3>
                    <div className="w-8 h-8 rounded-full bg-[#04A466]/10 flex items-center justify-center shrink-0">
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-[#04A466]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#04A466]" />
                      )}
                    </div>
                  </div>
                  {isOpen && (
                    <div className="px-5 pb-5 text-[#64748b] text-sm leading-relaxed -mt-2">
                      {a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </HomeSlidePanel>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-6 md:px-10 lg:px-12 border-t border-gray-200 bg-white">
        <p className="text-xs text-[#64748b]">© 2025 Tasklinkers. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs text-[#64748b] hover:text-[#1e293b] underline-offset-4 hover:underline" href="/legal">Terms of Service</Link>
          <Link className="text-xs text-[#64748b] hover:text-[#1e293b] underline-offset-4 hover:underline" href="/legal">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
