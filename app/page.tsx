import { ArrowRight, Shield, Users } from "lucide-react"
import { NairaIcon } from "@/components/naira-icon"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin, Star } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="w-full h-14 border-b">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-full flex items-center">
          <Link className="flex items-center justify-center" href="/">
            <img src="/logo-icon.svg" alt="Tasklinkers Logo" className="h-6 w-6" />
            <span className="ml-2 text-xl font-bold">Tasklinkers</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
              Features
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
              How It Works
            </Link>
          </nav>
          <div className="ml-4 flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 text-white" style={{ backgroundColor: "#04A466" }}>
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Connect. Work. Get Paid.
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

            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {/* Task Card 1 */}
                <Card className="min-w-[450px] max-w-[450px] flex-shrink-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Build E-commerce Website</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">Posted 2 hours ago</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">₦150,000</div>
                        <div className="text-sm text-gray-500">Fixed Price</div>
                      </div>
                    </div>
                    <CardDescription className="mt-3">
                      Looking for an experienced developer to build a modern e-commerce platform with payment
                      integration and admin dashboard.
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">React</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Node.js</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">MongoDB</span>
                    </div>
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>Remote</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>2-3 months</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>4.8 (12 reviews)</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Task Card 2 */}
                <Card className="min-w-[450px] max-w-[450px] flex-shrink-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Mobile App UI/UX Design</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">Posted 4 hours ago</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">₦80,000</div>
                        <div className="text-sm text-gray-500">Fixed Price</div>
                      </div>
                    </div>
                    <CardDescription className="mt-3">
                      Need a creative designer to create modern, user-friendly mobile app designs for iOS and Android
                      platforms.
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Figma</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">UI/UX</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        Mobile Design
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>Lagos, Nigeria</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>3-4 weeks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>4.9 (8 reviews)</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Task Card 3 */}
                <Card className="min-w-[450px] max-w-[450px] flex-shrink-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Content Writing & SEO</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">Posted 6 hours ago</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">₦45,000</div>
                        <div className="text-sm text-gray-500">Fixed Price</div>
                      </div>
                    </div>
                    <CardDescription className="mt-3">
                      Seeking a skilled content writer to create SEO-optimized blog posts and website content for a tech
                      startup.
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Content Writing
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">SEO</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Blog Writing</span>
                    </div>
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>Remote</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>2 weeks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>4.7 (15 reviews)</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Task Card 4 */}
                <Card className="min-w-[450px] max-w-[450px] flex-shrink-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Social Media Management</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">Posted 8 hours ago</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">₦60,000</div>
                        <div className="text-sm text-gray-500">Monthly</div>
                      </div>
                    </div>
                    <CardDescription className="mt-3">
                      Looking for a social media expert to manage Instagram, Twitter, and LinkedIn accounts for a
                      growing business.
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">Social Media</span>
                      <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">Content Creation</span>
                      <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">Marketing</span>
                    </div>
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>Abuja, Nigeria</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Ongoing</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>4.6 (20 reviews)</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Task Card 5 */}
                <Card className="min-w-[450px] max-w-[450px] flex-shrink-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Data Analysis & Visualization</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">Posted 10 hours ago</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">₦120,000</div>
                        <div className="text-sm text-gray-500">Fixed Price</div>
                      </div>
                    </div>
                    <CardDescription className="mt-3">
                      Need a data analyst to process large datasets and create interactive dashboards for business
                      insights.
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Python</span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Tableau</span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">SQL</span>
                    </div>
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>Remote</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>1 month</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>4.9 (6 reviews)</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Task Card 6 */}
                <Card className="min-w-[450px] max-w-[450px] flex-shrink-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Video Editing & Animation</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">Posted 12 hours ago</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">₦90,000</div>
                        <div className="text-sm text-gray-500">Fixed Price</div>
                      </div>
                    </div>
                    <CardDescription className="mt-3">
                      Looking for a creative video editor to produce promotional videos and animated content for
                      marketing campaigns.
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">After Effects</span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Premiere Pro</span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Animation</span>
                    </div>
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>Port Harcourt</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>3 weeks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>4.8 (10 reviews)</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              <div className="text-center mt-8">
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard/browse">View All Tasks</Link>
                </Button>
              </div>
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
