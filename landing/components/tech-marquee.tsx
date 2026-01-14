"use client"

import { motion } from "framer-motion"

const logoItems = [
  { id: "uniswap", src: "/images/uniswap.png", alt: "Uniswap" },
  { id: "okx", src: "/images/okx.webp", alt: "OKX" },
  { id: "agnifinance", src: "/images/agnifinance.avif", alt: "Agni Finance" },
  { id: "openocean", src: "/images/openocean.png", alt: "Open Ocean" },
  { id: "moe", src: "/images/merchatmoe.jpg", alt: "Merchant Moe" },
  { id: "pyth", src: "/images/pyth.png", alt: "Pyth" },
  { id: "meth", src: "/images/meth.svg", alt: "mETH" },
]

function LogoItem({ logo }: { logo: typeof logoItems[0] }) {
  return (
    <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-white/5 border border-white/10 overflow-hidden">
      <img
        src={logo.src}
        alt={logo.alt}
        className="w-full h-full object-cover rounded-full"
        loading="eager"
        decoding="async"
      />
    </div>
  )
}

export function TechMarquee() {
  return (
    <section id="integrations" className="relative py-24 overflow-hidden md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="px-8 md:px-12 mb-16"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">BEST-IN-CLASS INTEGRATIONS</p>
      </motion.div>

      <div className="marquee-container">
        <div className="marquee-track">
          {logoItems.map((logo) => (
            <LogoItem key={`a-${logo.id}`} logo={logo} />
          ))}
          {logoItems.map((logo) => (
            <LogoItem key={`b-${logo.id}`} logo={logo} />
          ))}
        </div>
      </div>
    </section>
  )
}
