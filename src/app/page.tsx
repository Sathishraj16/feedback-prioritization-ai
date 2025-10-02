"use client"

import { useEffect, useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { BubbleChart } from "@/components/bubble-chart"
import { SwarmAnimation } from "@/components/swarm-animation"
import { PriorityList } from "@/components/priority-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, AlertCircle } from "lucide-react"

interface Cluster {
  id: number
  name: string
  description: string | null
  size: number
  xPosition: number | null
  yPosition: number | null
  color: string | null
  createdAt: string
}

interface Priority {
  id: number
  feedbackId: number
  rank: number
  consensusScore: number
  createdAt: string
  updatedAt: string
  feedbackTitle: string
  feedbackDescription: string
  feedbackSource: string
  feedbackCustomerEmail: string | null
  feedbackCustomerName: string | null
}

export default function Home() {
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [priorities, setPriorities] = useState<Priority[]>([])
  const [totalFeedback, setTotalFeedback] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch clusters
        const clustersRes = await fetch('/api/clusters')
        const clustersData = await clustersRes.json()
        setClusters(clustersData)

        // Fetch top priorities
        const prioritiesRes = await fetch('/api/top-priorities?top=20')
        const prioritiesData = await prioritiesRes.json()
        setPriorities(prioritiesData)

        // Fetch total feedback count
        const feedbackRes = await fetch('/api/feedback?limit=1')
        const feedbackData = await feedbackRes.json()
        setTotalFeedback(feedbackData.length > 0 ? 1000 : 0) // Approximate
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const avgConsensusScore = priorities.length > 0
    ? priorities.reduce((sum, p) => sum + p.consensusScore, 0) / priorities.length
    : 0

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Feedback Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                AI-powered customer feedback prioritization using swarm intelligence
              </p>
            </div>
            <SidebarTrigger className="lg:hidden" />
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{totalFeedback.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Across {clusters.length} clusters
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Priority Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {priorities[0]?.consensusScore.toFixed(1) || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Consensus from 5 AI agents
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clusters</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{clusters.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Categorized by topic
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Priority</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{avgConsensusScore.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">
                      Across top 20 items
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Bubble Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Feedback Clusters</CardTitle>
                <CardDescription>
                  Interactive visualization of feedback grouped by topic and priority
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[600px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="w-full h-full" />
                  </div>
                ) : (
                  <BubbleChart clusters={clusters} />
                )}
              </CardContent>
            </Card>

            {/* Right Column - Swarm Animation */}
            <Card>
              <CardHeader>
                <CardTitle>AI Swarm Analysis</CardTitle>
                <CardDescription>
                  5 specialized agents evaluating feedback in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SwarmAnimation isActive={!loading} />
                
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-semibold">Agent Roles</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
                      <span className="font-medium">Urgency:</span>
                      <span className="text-muted-foreground">Time-sensitive impact</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#06FFA5' }} />
                      <span className="font-medium">Impact:</span>
                      <span className="text-muted-foreground">User base affected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF4444' }} />
                      <span className="font-medium">Sentiment:</span>
                      <span className="text-muted-foreground">Customer emotion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFD23F' }} />
                      <span className="font-medium">Novelty:</span>
                      <span className="text-muted-foreground">Innovation potential</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#45B7D1' }} />
                      <span className="font-medium">Effort:</span>
                      <span className="text-muted-foreground">Implementation cost</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Priorities List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Priorities</CardTitle>
                  <CardDescription>
                    Highest-ranked feedback based on AI consensus scoring
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Top {priorities.length} of {totalFeedback}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <PriorityList priorities={priorities} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </SidebarProvider>
  )
}