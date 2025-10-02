"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, TrendingUp, AlertTriangle, Star, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

interface PriorityListProps {
  priorities: Priority[]
}

export function PriorityList({ priorities }: PriorityListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-red-500"
    if (score >= 60) return "text-orange-500"
    if (score >= 40) return "text-yellow-500"
    return "text-green-500"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "destructive"
    if (score >= 60) return "default"
    return "secondary"
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {priorities.map((priority, index) => {
          const isExpanded = expandedId === priority.id
          const scoreColor = getScoreColor(priority.consensusScore)

          return (
            <motion.div
              key={priority.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isExpanded && "ring-2 ring-primary"
              )}>
                <CardHeader 
                  className="p-4 pb-3"
                  onClick={() => setExpandedId(isExpanded ? null : priority.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Rank badge */}
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm",
                      priority.rank <= 3 ? "bg-amber-500 text-white" :
                      priority.rank <= 10 ? "bg-blue-500 text-white" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {priority.rank}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-sm font-semibold truncate">
                          {priority.feedbackTitle}
                        </CardTitle>
                        {priority.rank <= 5 && (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getScoreBadgeVariant(priority.consensusScore)} className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Score: {priority.consensusScore.toFixed(1)}
                        </Badge>
                        
                        <Badge variant="outline" className="text-xs capitalize">
                          {priority.feedbackSource}
                        </Badge>

                        {priority.feedbackCustomerName && (
                          <span className="text-xs text-muted-foreground truncate">
                            {priority.feedbackCustomerName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expand button */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                    </motion.div>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="p-4 pt-0 border-t">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground mb-1">
                              Description
                            </h4>
                            <p className="text-sm text-foreground">
                              {priority.feedbackDescription}
                            </p>
                          </div>

                          {priority.feedbackCustomerEmail && (
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground mb-1">
                                Customer Contact
                              </h4>
                              <p className="text-sm text-foreground">
                                {priority.feedbackCustomerEmail}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Submitted {new Date(priority.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="default" className="flex-1">
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              Add to Sprint
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}