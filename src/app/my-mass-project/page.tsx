
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Calculator, Scissors, FileText } from "lucide-react";

export default function MyMassProjectPage() {
    return (
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">My Mass Projects</h1>
            <p className="text-lg text-muted-foreground mb-12">
              A collection of my larger and more experimental projects.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Link href="/my-mass-project/calculator">
                    <Card className="h-full hover:border-primary transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-primary"/>
                                Calculator
                            </CardTitle>
                            <CardDescription>A modern, stylish calculator built with React and Tailwind CSS.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                 <Link href="/my-mass-project/remove-background">
                    <Card className="h-full hover:border-primary transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scissors className="w-5 h-5 text-primary"/>
                                AI Background Remover
                            </CardTitle>
                            <CardDescription>An AI tool to automatically remove the background from any image.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
