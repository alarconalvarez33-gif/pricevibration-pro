// app/page.tsx
import HeroSection from '@/components/home/HeroSection'
import StatsBar from '@/components/home/StatsBar'
import CoursesSection from '@/components/home/CoursesSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import QuantumSection from '@/components/home/QuantumSection'
import MentorSection from '@/components/home/MentorSection'
import ContactSection from '@/components/home/ContactSection'  // ⬅️ AGREGAR
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <StatsBar />
      <CoursesSection />
      <TestimonialsSection />
      <QuantumSection />
      <MentorSection />
      <ContactSection />  {/* ⬅️ AGREGAR ANTES DEL FOOTER */}
      <Footer />
    </main>
  )
}
