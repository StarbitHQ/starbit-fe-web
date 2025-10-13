"use client"

import type React from "react"

import { useState } from "react"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Shield, Upload, CheckCircle2, XCircle, Clock, AlertCircle, FileText, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type KYCStatus = "not-started" | "pending" | "approved" | "rejected"

export default function KYCPage() {
  const { toast } = useToast()
  const [kycStatus, setKycStatus] = useState<KYCStatus>("not-started")
  const [idFile, setIdFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const rejectionReason = "The ID document provided is not clear enough. Please upload a higher quality image."

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "id" | "selfie") => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === "id") {
        setIdFile(file)
      } else {
        setSelfieFile(file)
      }
      toast({
        title: "File selected",
        description: `${file.name} ready to upload`,
        className: "bg-primary text-primary-foreground",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idFile || !selfieFile) {
      toast({
        title: "Missing files",
        description: "Please upload both ID and selfie",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setKycStatus("pending")
      toast({
        title: "KYC submitted!",
        description: "Your documents are being reviewed. This usually takes 24-48 hours.",
        className: "bg-primary text-primary-foreground",
      })
      setIsSubmitting(false)
    }, 2000)
  }

  const getStatusBadge = () => {
    switch (kycStatus) {
      case "approved":
        return (
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 gap-1">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Not Started
          </Badge>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">KYC Verification</h1>
            {getStatusBadge()}
          </div>
          <p className="text-muted-foreground">Verify your identity to unlock full trading features</p>
        </div>

        {/* Status Alert */}
        {kycStatus === "approved" && (
          <Alert className="mb-6 bg-primary/10 border-primary/20">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              Your account is verified! You now have access to all trading features.
            </AlertDescription>
          </Alert>
        )}

        {kycStatus === "pending" && (
          <Alert className="mb-6 bg-secondary/10 border-secondary/20">
            <Clock className="h-4 w-4 text-secondary" />
            <AlertDescription className="text-foreground">
              Your documents are being reviewed. We'll notify you once the verification is complete.
            </AlertDescription>
          </Alert>
        )}

        {kycStatus === "rejected" && (
          <Alert className="mb-6 bg-destructive/10 border-destructive/20">
            <XCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-foreground">
              <p className="font-semibold mb-1">Verification Rejected</p>
              <p className="text-sm">{rejectionReason}</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* KYC Form */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Identity Verification
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Upload your documents to verify your identity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ID Upload */}
                <div className="space-y-3">
                  <Label className="text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Government-Issued ID
                  </Label>
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:border-primary/40 transition-colors">
                    <input
                      type="file"
                      id="id-upload"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, "id")}
                      className="hidden"
                      disabled={kycStatus === "approved" || kycStatus === "pending"}
                    />
                    <label htmlFor="id-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        {idFile ? idFile.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Passport, Driver's License, or National ID (PNG, JPG, PDF up to 10MB)
                      </p>
                    </label>
                  </div>
                </div>

                {/* Selfie Upload */}
                <div className="space-y-3">
                  <Label className="text-foreground flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Selfie with ID
                  </Label>
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:border-primary/40 transition-colors">
                    <input
                      type="file"
                      id="selfie-upload"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "selfie")}
                      className="hidden"
                      disabled={kycStatus === "approved" || kycStatus === "pending"}
                    />
                    <label htmlFor="selfie-upload" className="cursor-pointer">
                      <Camera className="h-8 w-8 text-secondary mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        {selfieFile ? selfieFile.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Clear photo of you holding your ID (PNG, JPG up to 10MB)
                      </p>
                    </label>
                  </div>
                </div>

                {/* Instructions */}
                <Alert className="bg-muted/50 border-border">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm text-foreground">
                    <p className="font-semibold mb-2">Important Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Ensure all text on your ID is clearly visible</li>
                      <li>Photo should be well-lit with no glare</li>
                      <li>Your face must be clearly visible in the selfie</li>
                      <li>Hold your ID next to your face in the selfie</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Submit Button */}
                {kycStatus === "not-started" || kycStatus === "rejected" ? (
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting || !idFile || !selfieFile}
                  >
                    {isSubmitting ? "Submitting..." : "Submit for Verification"}
                  </Button>
                ) : null}
              </form>
            </CardContent>
          </Card>

          {/* Status & Benefits */}
          <div className="space-y-6">
            {/* Verification Progress */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Verification Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-foreground">
                      {kycStatus === "approved" ? "100%" : kycStatus === "pending" ? "50%" : "0%"}
                    </span>
                  </div>
                  <Progress value={kycStatus === "approved" ? 100 : kycStatus === "pending" ? 50 : 0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {kycStatus !== "not-started" ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span className="text-sm text-foreground">Documents Submitted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {kycStatus === "approved" ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : kycStatus === "pending" ? (
                      <Clock className="h-4 w-4 text-secondary" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span className="text-sm text-foreground">Under Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {kycStatus === "approved" ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span className="text-sm text-foreground">Verified</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Verification Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Higher Trading Limits</p>
                    <p className="text-xs text-muted-foreground">Trade up to $50,000 per day</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Priority Support</p>
                    <p className="text-xs text-muted-foreground">Get help faster from our team</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Lower Fees</p>
                    <p className="text-xs text-muted-foreground">Enjoy reduced trading fees</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Advanced Features</p>
                    <p className="text-xs text-muted-foreground">Access to premium tools</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
