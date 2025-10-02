"use client"

import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Play, CheckCircle, TrendingUp, Clock, Heart, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SwarmAnimation } from "@/components/swarm-animation"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

interface AgentScore {
  score: number
  reasoning: string
}

interface AnalysisResult {
  feedbackId: number
  scores: Record<string, AgentScore>
  consensusScore: number
  message: string
}

const agentIcons: Record<string, any> = {
  urgency: Clock,
  impact: TrendingUp,
  sentiment: Heart,
  novelty: Sparkles,
  effort: Zap,
}

const agentColors: Record<string, string> = {
  urgency: "#FF6B35",
  impact: "#06FFA5",
  sentiment: "#FF4444",
  novelty: "#FFD23F",
  effort: "#45B7D1",
}

export default function SwarmPage() {
  const [feedbackId, setFeedbackId] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [currentAgent, setCurrentAgent] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!feedbackId.trim()) {
      toast.error('Please enter a valid feedback ID')
      return
    }

    setIsAnalyzing(true)
    setResult(null)
    setCurrentAgent(null)

    const agents = ['urgency', 'impact', 'sentiment', 'novelty', 'effort']
    
    try {
      // Simulate sequential agent analysis with delays
      for (let i = 0; i < agents.length; i++) {
        setCurrentAgent(agents[i])
        await new Promise(resolve => setTimeout(resolve, 1200))
      }

      const res = await fetch('/api/swarm-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId: parseInt(feedbackId) }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Analysis failed')
      }

      const data = await res.json()
      setResult(data)
      toast.success('Swarm analysis completed!')
    } catch (error: any) {
      console.error('Analysis error:', error)
      toast.error(error.message || 'Failed to analyze feedback')
    } finally {
      setIsAnalyzing(false)
      setCurrentAgent(null)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Swarm AI Analysis</h1>
              <p className="text-muted-foreground mt-1">
                Run multi-agent consensus scoring on feedback items
              </p>
            </div>
            <SidebarTrigger className="lg:hidden" />
          </div>

          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>Analyze Feedback</CardTitle>
              <CardDescription>
                Enter a feedback ID to run swarm intelligence analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="feedbackId">Feedback ID</Label>
                  <Input
                    id="feedbackId"
                    type="number"
                    placeholder="e.g., 1234"
                    value={feedbackId}
                    onChange={(e) => setFeedbackId(e.target.value)}
                    disabled={isAnalyzing}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !feedbackId.trim()}
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="mr-2">Analyzing...</span>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Swarm Animation */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Analysis in Progress</CardTitle>
                  <CardDescription>
                    {currentAgent ? (
                      <>
                        <span className="font-semibold capitalize" style={{ color: agentColors[currentAgent] }}>
                          {currentAgent} Agent
                        </span>
                        {" "}is evaluating the feedback...
                      </>
                    ) : (
                      "Initializing swarm agents..."
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SwarmAnimation isActive={isAnalyzing} />
                  <Progress value={(currentAgent ? ['urgency', 'impact', 'sentiment', 'novelty', 'effort'].indexOf(currentAgent) + 1 : 0) * 20} className="mt-4" />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Consensus Score */}
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          Analysis Complete
                        </CardTitle>
                        <CardDescription>
                          Feedback ID: {result.feedbackId}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          {result.consensusScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Consensus Score
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Individual Agent Scores */}
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(result.scores).map(([agentType, agentData], index) => {
                    const Icon = agentIcons[agentType]
                    const color = agentColors[agentType]

                    return (
                      <motion.div
                        key={agentType}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base capitalize flex items-center gap-2">
                                <div 
                                  className="flex h-8 w-8 items-center justify-center rounded-full"
                                  style={{ backgroundColor: color + '20' }}
                                >
                                  <Icon className="h-4 w-4" style={{ color }} />
                                </div>
                                {agentType}
                              </CardTitle>
                              <Badge 
                                variant={agentData.score >= 70 ? "destructive" : agentData.score >= 40 ? "default" : "secondary"}
                              >
                                {agentData.score.toFixed(1)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {agentData.reasoning}
                            </p>
                            <Progress 
                              value={agentData.score} 
                              className="mt-3"
                              style={{ 
                                //@ts-ignore
                                '--progress-background': color 
                              }}
                            />
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Summary */}
                <Card className="bg-muted">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3">Analysis Summary</h3>
                    <div className="grid gap-3 md:grid-cols-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Overall Priority:</span>
                        <Badge variant={result.consensusScore >= 70 ? "destructive" : "default"} className="ml-2">
                          {result.consensusScore >= 70 ? "High" : result.consensusScore >= 40 ? "Medium" : "Low"}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Agents Analyzed:</span>
                        <span className="ml-2 font-medium">5/5</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="outline" className="ml-2">
                          Added to Priorities
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Toaster />
    </SidebarProvider>
  )
}