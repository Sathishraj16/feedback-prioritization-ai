"use client"

import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, ExternalLink, Settings2, Zap, Bell, Share2 } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  enabled: boolean
  color: string
  features: string[]
}

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "slack",
      name: "Slack",
      description: "Send priority updates and notifications to your Slack workspace",
      icon: "https://cdn.simpleicons.org/slack/4A154B",
      enabled: false,
      color: "#4A154B",
      features: [
        "Real-time priority updates",
        "New feedback notifications",
        "Weekly summary reports",
        "Custom channel routing",
      ],
    },
    {
      id: "notion",
      name: "Notion",
      description: "Sync feedback and priorities to your Notion workspace",
      icon: "https://cdn.simpleicons.org/notion/000000",
      enabled: false,
      color: "#000000",
      features: [
        "Automatic page creation",
        "Priority database sync",
        "Template customization",
        "Bidirectional updates",
      ],
    },
    {
      id: "jira",
      name: "Jira",
      description: "Create issues and epics from high-priority feedback",
      icon: "https://cdn.simpleicons.org/jira/0052CC",
      enabled: false,
      color: "#0052CC",
      features: [
        "Auto-create tickets",
        "Priority to story points mapping",
        "Sprint planning integration",
        "Status synchronization",
      ],
    },
    {
      id: "github",
      name: "GitHub",
      description: "Create issues from feedback and link to repositories",
      icon: "https://cdn.simpleicons.org/github/181717",
      enabled: false,
      color: "#181717",
      features: [
        "Issue creation",
        "Label auto-assignment",
        "Repository linking",
        "PR mentions",
      ],
    },
    {
      id: "linear",
      name: "Linear",
      description: "Streamline issue tracking with Linear integration",
      icon: "https://cdn.simpleicons.org/linear/5E6AD2",
      enabled: false,
      color: "#5E6AD2",
      features: [
        "Issue creation",
        "Priority mapping",
        "Team assignment",
        "Cycle integration",
      ],
    },
    {
      id: "discord",
      name: "Discord",
      description: "Post feedback updates to Discord channels",
      icon: "https://cdn.simpleicons.org/discord/5865F2",
      enabled: false,
      color: "#5865F2",
      features: [
        "Channel webhooks",
        "Embed formatting",
        "Role mentions",
        "Thread creation",
      ],
    },
  ])

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [autoAnalysis, setAutoAnalysis] = useState(false)

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === id
          ? { ...integration, enabled: !integration.enabled }
          : integration
      )
    )
    
    const integration = integrations.find(i => i.id === id)
    if (integration) {
      toast.success(
        integration.enabled 
          ? `${integration.name} disconnected` 
          : `${integration.name} connected successfully!`
      )
    }
  }

  const handleConnect = (id: string) => {
    toast.info(`Opening ${integrations.find(i => i.id === id)?.name} authentication...`)
    // In production, this would redirect to OAuth flow
    setTimeout(() => {
      handleToggleIntegration(id)
    }, 1500)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Configure integrations and preferences
              </p>
            </div>
            <SidebarTrigger className="lg:hidden" />
          </div>

          <Tabs defaultValue="integrations" className="space-y-6">
            <TabsList>
              <TabsTrigger value="integrations">
                <Share2 className="h-4 w-4 mr-2" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="automation">
                <Zap className="h-4 w-4 mr-2" />
                Automation
              </TabsTrigger>
            </TabsList>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Connected Integrations</CardTitle>
                  <CardDescription>
                    Connect your favorite tools to streamline your workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {integrations.map((integration, index) => (
                      <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className={integration.enabled ? "border-primary" : ""}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                  <img 
                                    src={integration.icon} 
                                    alt={integration.name}
                                    className="w-6 h-6"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{integration.name}</h3>
                                    {integration.enabled && (
                                      <Badge variant="default" className="h-5">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Connected
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {integration.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <ul className="text-xs space-y-1">
                              {integration.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                                  <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                            
                            {integration.enabled ? (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleToggleIntegration(integration.id)}
                                >
                                  Disconnect
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Settings2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                className="w-full"
                                size="sm"
                                onClick={() => handleConnect(integration.id)}
                              >
                                Connect {integration.name}
                                <ExternalLink className="h-3 w-3 ml-2" />
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how and when you receive updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates for high-priority feedback
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get instant alerts for critical feedback items
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-digest">Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Summary of feedback trends and top priorities
                      </p>
                    </div>
                    <Switch
                      id="weekly-digest"
                      checked={weeklyDigest}
                      onCheckedChange={setWeeklyDigest}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Automation Tab */}
            <TabsContent value="automation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Automation Rules</CardTitle>
                  <CardDescription>
                    Configure automatic actions for feedback management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-analysis">Automatic Swarm Analysis</Label>
                      <p className="text-sm text-muted-foreground">
                        Run AI analysis on all new feedback submissions
                      </p>
                    </div>
                    <Switch
                      id="auto-analysis"
                      checked={autoAnalysis}
                      onCheckedChange={setAutoAnalysis}
                    />
                  </div>

                  <div className="flex items-center justify-between opacity-50">
                    <div className="space-y-0.5">
                      <Label>Auto-Assign to Teams</Label>
                      <p className="text-sm text-muted-foreground">
                        Route feedback to relevant teams based on clusters
                      </p>
                    </div>
                    <Switch disabled />
                  </div>

                  <div className="flex items-center justify-between opacity-50">
                    <div className="space-y-0.5">
                      <Label>Smart Clustering</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically categorize feedback using ML
                      </p>
                    </div>
                    <Switch disabled />
                  </div>

                  <Card className="bg-muted/50 border-dashed">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">Coming Soon</p>
                          <p className="text-muted-foreground">
                            More automation rules and workflow triggers are in development
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Toaster />
    </SidebarProvider>
  )
}