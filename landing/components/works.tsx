"use client"

import { motion } from "framer-motion"

const projects = [
  {
    title: "Swap in seconds",
    tags: ["OpenOcean", "Merchant Moe", "Uniswap V3", "Agni"],
    year: "TRADE",
  },
  {
    title: "Never miss a yield",
    tags: ["Supply", "Borrow", "Repay", "Lendle"],
    year: "LEND",
  },
  {
    title: "Stake & earn",
    tags: ["View Positions", "WETH ↔ mETH"],
    year: "STAKE",
  },
  {
    title: "Your keys, your coins",
    tags: ["Create/Manage", "Balances", "Sign Messages"],
    year: "WALLET",
  },
  {
    title: "Real-time prices",
    tags: ["Pyth", "Price Feeds"],
    year: "ORACLE",
  },
]

export function Works() {
  return (
    <section id="works" className="relative py-32 px-8 md:px-12 md:py-24">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-24"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">POWERED BY THE BEST</p>
        <h2 className="font-sans text-3xl md:text-5xl font-light italic">Everything you need. Nothing you don't.</h2>
      </motion.div>

      {/* Projects List */}
      <div className="relative">
        {projects.map((project, index) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="relative border-t border-white/10 py-8 md:py-12 group cursor-pointer"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 transition-transform duration-300 group-hover:translate-x-2">
              {/* Year */}
              <span className="font-mono text-xs text-muted-foreground tracking-widest order-1 md:order-none transition-colors duration-300 group-hover:text-accent">
                {project.year}
              </span>

              {/* Title */}
              <h3 className="font-sans text-4xl md:text-6xl lg:text-7xl font-light tracking-tight transition-colors duration-300 group-hover:text-white flex-1">
                {project.title}
              </h3>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap order-2 md:order-none">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] tracking-wider px-3 py-1 border border-white/20 rounded-full text-muted-foreground transition-all duration-300 group-hover:border-accent/50 group-hover:text-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Border */}
      <div className="border-t border-white/10" />
    </section>
  )
}
