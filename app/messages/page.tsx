"use client"

import { useState } from "react"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Search, Send, Users } from "lucide-react"

export default function MessagesPage() {
  const [selectedContact, setSelectedContact] = useState(1)
  const [message, setMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const contacts = [
    { id: 1, name: "User #1234", lastMessage: "Thanks for the trade!", time: "2m ago", unread: 2 },
    { id: 2, name: "User #5678", lastMessage: "When can we start?", time: "1h ago", unread: 0 },
    { id: 3, name: "User #9012", lastMessage: "Payment sent", time: "3h ago", unread: 1 },
    { id: 4, name: "User #3456", lastMessage: "Great doing business!", time: "1d ago", unread: 0 },
  ]

  const messages = [
    { id: 1, sender: "them", text: "Hi! I'm interested in your offer", time: "10:30 AM" },
    { id: 2, sender: "me", text: "Great! Let me know when you're ready", time: "10:32 AM" },
    { id: 3, sender: "them", text: "I'm ready now. Can we proceed?", time: "10:35 AM" },
    { id: 4, sender: "me", text: "Sure, I'll initiate the trade", time: "10:36 AM" },
    { id: 5, sender: "them", text: "Thanks for the trade!", time: "10:45 AM" },
  ]

  const handleSendMessage = () => {
    if (!message.trim()) return
    // Add message logic here
    setMessage("")
  }

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen bg-background">
      <NavHeader isAuthenticated />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
          <p className="text-muted-foreground">Chat with your referrals and trading partners</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Contacts List */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-input text-foreground"
                />
              </div>

              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedContact === contact.id
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground text-sm">{contact.name}</span>
                      </div>
                      {contact.unread > 0 && (
                        <Badge className="bg-secondary text-secondary-foreground h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {contact.unread}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{contact.lastMessage}</p>
                    <p className="text-xs text-muted-foreground mt-1">{contact.time}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardContent className="p-0">
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {contacts.find((c) => c.id === selectedContact)?.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender === "me"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted border border-border text-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-background border-input text-foreground resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
