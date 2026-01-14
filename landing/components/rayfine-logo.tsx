import Image from "next/image"

export function RayfineLogoIcon() {
  return (
    <Image
      src="/rayfine-logo.png"
      alt="Rayfine"
      width={24}
      height={24}
      className="w-6 h-6"
    />
  )
}

export function RayfineLogoText() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/rayfine-logo.png"
        alt="Rayfine"
        width={32}
        height={32}
        className="w-8 h-8"
      />
      <span className="font-mono text-base md:text-lg tracking-widest font-bold text-foreground">RAYFINE</span>
    </div>
  )
}
