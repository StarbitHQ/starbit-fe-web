"use client"

import type React from "react"

import { useState } from "react"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Plus, Upload, Clock, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SupportPage() {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    file: null as File | null,
  })

  const tickets = [
    {
      id: 1,
      subject: "Unable to complete KYC verification",
      status: "open",
      date: "2 hours ago",
      replies: 3,
    },
    {
      id: 2,
      subject: "Payment not received in P2P trade",
      status: "open",
      date: "1 day ago",
      replies: 5,
    },
    {
      id: 3,
      subject: "How to increase trading limits?",
      status: "closed",
      date: "3 days ago",
      replies: 2,
    },
    {
      id: 4,
      subject: "Referral bonus not credited",
      status: "closed",
      date: "1 week ago",
      replies: 4,
    },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, file })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject || !formData.description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Ticket created!",
      description: "Our support team will respond within 24 hours",
      className: "bg-primary text-primary-foreground",
    })
    setFormData({ subject: "", description: "", file: null })
    setIsCreating(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 gap-1">
            <Clock className="h-3 w-3" />
            Open
          </Badge>
        )
      case "closed":
        return (
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Closed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <XCircle className="h-3 w-3" />
            Unknown
          </Badge>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Support Center</h1>
            <p className="text-muted-foreground">Get help from our support team</p>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>

        {/* Create Ticket Form */}
        {isCreating && (
          <Card className="mb-6 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Create Support Ticket</CardTitle>
              <CardDescription className="text-muted-foreground">
                Describe your issue and we'll help you resolve it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-foreground">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="bg-background border-input text-foreground"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your issue..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-background border-input text-foreground resize-none"
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file" className="text-foreground">
                    Attachment (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-4 text-center hover:border-primary/40 transition-colors">
                    <input
                      type="file"
                      id="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      <Upload className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-sm text-foreground">
                        {formData.file ? formData.file.name : "Click to upload screenshot or document"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF, DOC up to 10MB</p>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                    Submit Ticket
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tickets List */}
        <Tabs defaultValue="open" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted">
            <TabsTrigger value="open">Open Tickets</TabsTrigger>
            <TabsTrigger value="closed">Closed Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-4">
            {tickets
              .filter((ticket) => ticket.status === "open")
              .map((ticket) => (
                <Card key={ticket.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-secondary/10">
                          <MessageSquare className="h-5 w-5 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{ticket.subject}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{ticket.date}</span>
                            <span>{ticket.replies} replies</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(ticket.status)}
                        <Button variant="outline" size="sm" className="bg-transparent">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="closed" className="space-y-4">
            {tickets
              .filter((ticket) => ticket.status === "closed")
              .map((ticket) => (
                <Card key={ticket.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{ticket.subject}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{ticket.date}</span>
                            <span>{ticket.replies} replies</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(ticket.status)}
                        <Button variant="outline" size="sm" className="bg-transparent">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
