"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, FileText, Scale, Eye, Clock, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LegalPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Legal Information</h1>
            </div>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our commitment to transparency and your rights. Please read these documents carefully to understand how we
            operate and protect your interests.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: January 15, 2024</span>
          </div>
        </div>

        {/* Legal Documents */}
        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy Policy
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Terms of Service
            </TabsTrigger>
            <TabsTrigger value="cookies" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Cookie Policy
            </TabsTrigger>
          </TabsList>

          {/* Privacy Policy */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Privacy Policy
                  </CardTitle>
                  <Badge variant="secondary">Effective: Jan 15, 2024</Badge>
                </div>
              </CardHeader>
              <CardContent className="prose max-w-none space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Information We Collect</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong>Personal Information:</strong> When you create an account, we collect information such as
                      your name, email address, phone number, and profile information.
                    </p>
                    <p>
                      <strong>Professional Information:</strong> Skills, work experience, portfolio items, and
                      professional certifications you choose to share.
                    </p>
                    <p>
                      <strong>Usage Data:</strong> Information about how you use our platform, including pages visited,
                      features used, and interaction patterns.
                    </p>
                    <p>
                      <strong>Communication Data:</strong> Messages, files, and other content you share through our
                      platform.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. How We Use Your Information</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong>Platform Services:</strong> To provide, maintain, and improve our freelancing platform
                      services.
                    </p>
                    <p>
                      <strong>Matching:</strong> To connect freelancers with relevant job opportunities and help clients
                      find suitable talent.
                    </p>
                    <p>
                      <strong>Communication:</strong> To facilitate communication between users and send important
                      platform updates.
                    </p>
                    <p>
                      <strong>Security:</strong> To protect against fraud, abuse, and other harmful activities.
                    </p>
                    <p>
                      <strong>Analytics:</strong> To understand platform usage and improve user experience.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. Information Sharing</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong>With Other Users:</strong> Profile information, work samples, and ratings are visible to
                      other platform users as part of the service.
                    </p>
                    <p>
                      <strong>Service Providers:</strong> We may share information with trusted third-party service
                      providers who help us operate the platform.
                    </p>
                    <p>
                      <strong>Legal Requirements:</strong> We may disclose information when required by law or to
                      protect our rights and safety.
                    </p>
                    <p>
                      <strong>Business Transfers:</strong> Information may be transferred in connection with mergers,
                      acquisitions, or other business transactions.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">4. Data Security</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      We implement appropriate technical and organizational measures to protect your personal
                      information against unauthorized access, alteration, disclosure, or destruction.
                    </p>
                    <p>
                      This includes encryption of sensitive data, secure data transmission, regular security
                      assessments, and access controls.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">5. Your Rights</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong>Access:</strong> You can access and review your personal information through your account
                      settings.
                    </p>
                    <p>
                      <strong>Correction:</strong> You can update or correct your information at any time.
                    </p>
                    <p>
                      <strong>Deletion:</strong> You can request deletion of your account and associated data.
                    </p>
                    <p>
                      <strong>Portability:</strong> You can request a copy of your data in a portable format.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">6. Contact Us</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>If you have questions about this Privacy Policy or our data practices, please contact us at:</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>privacy@tasklinkers.com</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms of Service */}
          <TabsContent value="terms" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Terms of Service
                  </CardTitle>
                  <Badge variant="secondary">Effective: Jan 15, 2024</Badge>
                </div>
              </CardHeader>
              <CardContent className="prose max-w-none space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      By accessing and using Tasklinkers, you accept and agree to be bound by the terms and provision of
                      this agreement.
                    </p>
                    <p>If you do not agree to abide by the above, please do not use this service.</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Platform Description</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Tasklinkers is a platform that connects freelancers with clients seeking professional services.
                    </p>
                    <p>
                      We provide tools for project posting, proposal submission, communication, and secure payment
                      processing.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. User Responsibilities</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your
                      account credentials.
                    </p>
                    <p>
                      <strong>Accurate Information:</strong> You must provide accurate and complete information in your
                      profile and project postings.
                    </p>
                    <p>
                      <strong>Professional Conduct:</strong> You must conduct yourself professionally and respectfully
                      with other users.
                    </p>
                    <p>
                      <strong>Compliance:</strong> You must comply with all applicable laws and regulations.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">4. Payment Terms</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong>Escrow System:</strong> Payments are held in escrow until project milestones are completed
                      and approved.
                    </p>
                    <p>
                      <strong>Platform Fees:</strong> We charge a service fee on completed transactions as outlined in
                      our fee schedule.
                    </p>
                    <p>
                      <strong>Disputes:</strong> Payment disputes are handled through our resolution process.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">5. Intellectual Property</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>Users retain ownership of their original work and content shared on the platform.</p>
                    <p>
                      By using our platform, you grant us a license to use your content for platform operation and
                      improvement.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">6. Prohibited Activities</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong>Fraud:</strong> Any fraudulent activity, including fake profiles or misleading
                      information.
                    </p>
                    <p>
                      <strong>Harassment:</strong> Harassment, abuse, or inappropriate behavior toward other users.
                    </p>
                    <p>
                      <strong>Spam:</strong> Sending unsolicited messages or posting irrelevant content.
                    </p>
                    <p>
                      <strong>Circumvention:</strong> Attempting to bypass platform fees or security measures.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">7. Termination</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      We reserve the right to terminate or suspend accounts that violate these terms or engage in
                      prohibited activities.
                    </p>
                    <p>Users may terminate their accounts at any time through their account settings.</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">8. Contact Information</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>For questions about these Terms of Service, please contact us at:</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>legal@tasklinkers.com</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cookie Policy */}
          <TabsContent value="cookies" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Cookie Policy
                  </CardTitle>
                  <Badge variant="secondary">Effective: Jan 15, 2024</Badge>
                </div>
              </CardHeader>
              <CardContent className="prose max-w-none space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">What Are Cookies</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Cookies are small text files that are stored on your device when you visit our website. They help
                      us provide you with a better experience by remembering your preferences and improving our
                      services.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Types of Cookies We Use</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong>Essential Cookies:</strong> Required for the website to function properly, including
                      authentication and security features.
                    </p>
                    <p>
                      <strong>Performance Cookies:</strong> Help us understand how visitors interact with our website by
                      collecting anonymous information.
                    </p>
                    <p>
                      <strong>Functionality Cookies:</strong> Remember your preferences and settings to provide a
                      personalized experience.
                    </p>
                    <p>
                      <strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track the
                      effectiveness of our marketing campaigns.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Managing Cookies</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      You can control and manage cookies through your browser settings. Most browsers allow you to block
                      or delete cookies, but this may affect your experience on our website.
                    </p>
                    <p>
                      You can also manage your cookie preferences through our cookie consent banner when you first visit
                      our website.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Third-Party Cookies</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      We may use third-party services that set their own cookies, including analytics providers and
                      payment processors.
                    </p>
                    <p>
                      These third parties have their own privacy policies and cookie practices, which we encourage you
                      to review.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>If you have questions about our use of cookies, please contact us at:</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>privacy@tasklinkers.com</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
