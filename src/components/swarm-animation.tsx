"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Zap, TrendingUp, Heart, Sparkles, Clock } from "lucide-react"

const agents = [
  { name: "Urgency", icon: Clock, color: "#FF6B35" },
  { name: "Impact", icon: TrendingUp, color: "#06FFA5" },
  { name: "Sentiment", icon: Heart, color: "#FF4444" },
  { name: "Novelty", icon: Sparkles, color: "#FFD23F" },
  { name: "Effort", icon: Zap, color: "#45B7D1" },
]

interface SwarmAnimationProps {
  isActive?: boolean
}

export function SwarmAnimation({ isActive = true }: SwarmAnimationProps) {
  const [activeAgent, setActiveAgent] = useState(0)

  useEffect(() => {
    if (!isActive) return
    
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % agents.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className="relative w-full h-[200px] bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-lg border overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/5" />
      
      {/* Central pulse */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/20"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Agent particles */}
      {agents.map((agent, index) => {
        const angle = (index * 2 * Math.PI) / agents.length
        const radius = 60
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        const isActive = index === activeAgent

        return (
          <motion.div
            key={agent.name}
            className="absolute left-1/2 top-1/2"
            style={{
              x,
              y,
            }}
            animate={{
              x: [x, x * 1.2, x],
              y: [y, y * 1.2, y],
              scale: isActive ? [1, 1.3, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.4,
            }}
          >
            {/* Agent glow */}
            <motion.div
              className="absolute inset-0 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                width: 40,
                height: 40,
                backgroundColor: agent.color,
                filter: "blur(20px)",
              }}
              animate={{
                opacity: isActive ? [0.3, 0.7, 0.3] : 0.2,
                scale: isActive ? [1, 1.5, 1] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />

            {/* Agent icon */}
            <motion.div
              className="relative w-10 h-10 rounded-full flex items-center justify-center border-2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-sm shadow-lg"
              style={{
                backgroundColor: agent.color,
                borderColor: "rgba(255,255,255,0.3)",
              }}
              animate={{
                rotate: isActive ? 360 : 0,
              }}
              transition={{
                duration: 2,
                ease: "linear",
              }}
            >
              <agent.icon className="w-5 h-5 text-white" />
            </motion.div>

            {/* Agent label */}
            <motion.div
              className="absolute left-1/2 top-full -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap"
              style={{
                color: agent.color,
              }}
              animate={{
                opacity: isActive ? 1 : 0.5,
                scale: isActive ? 1.1 : 1,
              }}
            >
              {agent.name}
            </motion.div>

            {/* Connection line to center */}
            <svg
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              width="100"
              height="100"
              style={{ overflow: "visible" }}
            >
              <motion.line
                x1="50"
                y1="50"
                x2={50 + x}
                y2={50 + y}
                stroke={agent.color}
                strokeWidth={isActive ? 2 : 1}
                strokeOpacity={isActive ? 0.6 : 0.2}
                strokeDasharray="4 4"
                animate={{
                  strokeDashoffset: [0, -8],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </svg>
          </motion.div>
        )
      })}

      {/* Center icon */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg z-10">
        <Sparkles className="w-6 h-6 text-primary-foreground" />
      </div>

      {/* Status text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
        {isActive ? (
          <motion.span
            key={activeAgent}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="font-medium" style={{ color: agents[activeAgent].color }}>
              {agents[activeAgent].name} Agent
            </span>
            {" "}analyzing feedback...
          </motion.span>
        ) : (
          "Swarm agents idle"
        )}
      </div>
    </div>
  )
}