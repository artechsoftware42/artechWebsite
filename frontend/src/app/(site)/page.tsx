import Hero from "@/features/home/hero/Hero";
import Explore from "@/features/home/explore/Explore";
import About from "@/features/home/about/About";
import Contact from "@/features/home/contact/Contact";
import Projects from "@/features/home/projects/Projects";
import Partners from "@/features/home/partners/Partners";
import Career from "@/features/home/career/Career";


export default function HomePage() {
  return (
    <main>
      <Hero />
      <Explore />
      <About />
      <Contact />
      <Projects />
      <Career />
      <Partners />
    </main>
  );
}