"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

export function Footer() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <footer id="install" className="relative">
      {/* Main CTA */}
      <motion.a
        href="https://github.com/snehendu098/rayfine/tree/main"
        target="_blank"
        rel="noopener noreferrer"
        data-cursor-hover
        className="relative block overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Curtain */}
        <motion.div
          className="absolute inset-0 bg-accent"
          initial={{ y: "100%" }}
          animate={{ y: isHovered ? "0%" : "100%" }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />

        {/* Content */}
        <div className="relative py-16 md:py-24 px-8 md:px-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.h2
              className="font-sans text-4xl md:text-6xl lg:text-8xl font-light tracking-tight text-center md:text-left"
              animate={{
                color: isHovered ? "#050505" : "#fafafa",
              }}
              transition={{ duration: 0.3 }}
            >
              Contribute
            </motion.h2>

            <motion.div
              animate={{
                rotate: isHovered ? 45 : 0,
                color: isHovered ? "#050505" : "#fafafa",
              }}
              transition={{ duration: 0.3 }}
            >
              <ArrowUpRight className="w-12 h-12 md:w-16 md:h-16" />
            </motion.div>
          </div>
        </div>
      </motion.a>

      {/* Disclaimer */}
      <div className="px-8 md:px-12 py-6 border-t border-white/10 overflow-x-auto">
        <p className="font-mono text-[10px] md:text-xs tracking-wide text-muted-foreground text-center whitespace-nowrap">
          Rayfine is a visual interface on Raycast with all non-custodial wallet, swap, lending, and staking services powered by third-party protocols like OpenOcean, Lendle, mETH, Pyth, and more.
        </p>
      </div>

      {/* Footer Info */}
      <div className="px-8 md:px-12 py-6 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="font-mono text-xs tracking-widest text-muted-foreground">
Rayfine © All Rights Reserved
          </p>

          {/* Links */}
          <div className="flex gap-8">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              className="font-mono text-xs tracking-widest text-muted-foreground hover:text-white transition-colors duration-150"
            >
              GitHub
            </a>
            <a
              href="https://raycast.com/store"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              className="font-mono text-xs tracking-widest text-muted-foreground hover:text-white transition-colors duration-150"
            >
              Raycast Store
            </a>
            <a
              href="https://mantle.xyz"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              className="font-mono text-xs tracking-widest text-muted-foreground hover:text-white transition-colors duration-150"
            >
              Mantle
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
