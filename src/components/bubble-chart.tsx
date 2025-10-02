"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

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

interface BubbleChartProps {
  clusters: Cluster[]
  onClusterClick?: (cluster: Cluster) => void
}

export function BubbleChart({ clusters, onClusterClick }: BubbleChartProps) {
  const [hoveredCluster, setHoveredCluster] = useState<number | null>(null)

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-br from-background via-muted/20 to-background rounded-lg border overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
      
      {/* Axis labels */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground font-medium">
        Impact →
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium">
        Urgency →
      </div>

      {/* Bubbles */}
      {clusters.map((cluster) => {
        const x = cluster.xPosition ?? 50
        const y = cluster.yPosition ?? 50
        const size = Math.max(40, Math.min(150, cluster.size * 2))
        const isHovered = hoveredCluster === cluster.id

        return (
          <motion.div
            key={cluster.id}
            className="absolute cursor-pointer group"
            style={{
              left: `${x}%`,
              top: `${100 - y}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: cluster.id * 0.05,
            }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            onClick={() => onClusterClick?.(cluster)}
            onHoverStart={() => setHoveredCluster(cluster.id)}
            onHoverEnd={() => setHoveredCluster(null)}
          >
            {/* Bubble glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                width: size,
                height: size,
                background: `radial-gradient(circle, ${cluster.color || "#888"}, transparent)`,
                filter: "blur(20px)",
              }}
              animate={{
                scale: isHovered ? 1.3 : 1,
                opacity: isHovered ? 0.6 : 0.4,
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Bubble */}
            <div
              className="relative rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg backdrop-blur-sm"
              style={{
                width: size,
                height: size,
                backgroundColor: cluster.color || "#888",
                opacity: 0.9,
              }}
            >
              {/* Bubble shine effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent opacity-60" />
              
              {/* Cluster info */}
              <div className="relative z-10 text-center px-2">
                <div className="text-white font-semibold text-xs drop-shadow-md">
                  {cluster.name}
                </div>
                <div className="text-white/90 text-[10px] mt-1 drop-shadow-md">
                  {cluster.size} items
                </div>
              </div>
            </div>

            {/* Tooltip on hover */}
            {isHovered && (
              <motion.div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-popover border rounded-lg shadow-lg min-w-[200px] z-20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs font-semibold text-foreground">{cluster.name}</p>
                {cluster.description && (
                  <p className="text-xs text-muted-foreground mt-1">{cluster.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">{cluster.size}</span> feedback items
                </p>
              </motion.div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}