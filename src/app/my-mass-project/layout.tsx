import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// This file provides a layout for the mass projects section without duplicating the global nav.
export default function MyMassProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 py-24 sm:py-32">
        <div className="container mx-auto px-4 md:px-6 md:pl-20">
            <div className="flex justify-center mb-8">
                <Button asChild variant="outline">
                    <Link href="/my-mass-project">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                    </Link>
                </Button>
            </div>
            <div className="flex items-center justify-center">
                {children}
            </div>
        </div>
    </main>
  );
}
