import WhatsAppButton from "@/components/WhatsAppButton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LeadFormSection } from "@/components/home";
import {
  HeroBanner,
  AboutSection,
  ServicesSection,
  ProjectsSection,
  InstagramSection,
  TestimonialsSection,
  CTASection,
} from "@/components/institutional";

// WhatsApp da Mais Energia Solar
const WHATSAPP_NUMBER = "5532998437675";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      <AboutSection />
      <CTASection />
      <ServicesSection />
      <ProjectsSection />
      <InstagramSection />
      <TestimonialsSection />
      <div id="orcamento">
        <LeadFormSection />
      </div>
      <Footer />
      <WhatsAppButton phoneNumber={WHATSAPP_NUMBER} />
    </div>
  );
}
