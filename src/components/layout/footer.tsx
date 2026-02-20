import Link from "next/link"
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-background/50 border-t border-border/30">
      <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col items-center justify-center gap-6">
        <Link href="/admin/login" aria-label="Admin Login" className="group">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <Image
                      src="/my-photo.jpg"
                      alt="logo"
                      width={32}
                      height={32}
                      className="rounded-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 ring-2 ring-primary/10 group-hover:ring-primary/30"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 group-hover:text-primary/60 transition-colors text-center">
                &copy; {new Date().getFullYear()} Mhd Yaseen V. Secure Studio Node v2.0
              </p>
            </div>
        </Link>
      </div>
    </footer>
  )
}