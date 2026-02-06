
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { Services } from '@/components/sections/services';
import { Projects } from '@/components/sections/projects';
import { Testimonials } from '@/components/sections/testimonials';
import { Contact } from '@/components/sections/contact';
import { Timeline } from '@/components/sections/timeline';
import { Marquee } from '@/components/layout/marquee';
import { ToolStack } from '@/components/sections/tool-stack';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <Marquee />
      <main className="flex-1">
        <Hero />
        <About />
        <Timeline />
        <Services />
        <ToolStack />
        <Projects />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
