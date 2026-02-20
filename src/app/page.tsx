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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Mhd Yaseen V',
    jobTitle: 'Graphic & UI/UX Designer',
    url: 'https://yazzfolio.com',
    sameAs: [
      'https://instagram.com/_hey_yasii_',
      'https://github.com/mhdyaseenvattappara',
      'https://linkedin.com'
    ],
    description: 'Professional portfolio of Mhd Yaseen V, showcasing expertise in UI/UX and Graphic Design.',
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Marquee removed from static position as it is now integrated into the fixed MobileNav */}
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
