import Link from "next/link"
import { socialLinks } from "@/lib/data"
import { Button } from "@/components/ui/button"
import Image from "next/image";


export function Footer() {
  return (
    <footer className="bg-card/50">
      <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/admin/login" aria-label="Admin Login" className="group">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Image
                      src="/my-photo.jpg"
                      alt="logo"
                      width={24}
                      height={24}
                      className="rounded-full object-cover transition-all duration-500 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                </div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                &copy; {new Date().getFullYear()} Mhd Yaseen V. All rights reserved.
              </p>
            </div>
        </Link>
        <div className="flex items-center gap-2">
            {socialLinks.map((link) => (
                <Button asChild key={link.name} variant="ghost" size="icon">
                    <Link href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
                        <link.icon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    </Link>
                </Button>
            ))}
        </div>
      </div>
    </footer>
  )
}
