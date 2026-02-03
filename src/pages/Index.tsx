import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();

  // Detecta se é link de vendedor
  const isVendorLink = useMemo(() => {
    return !!(searchParams.get("v") || searchParams.get("vendedor"));
  }, [searchParams]);

  // Auto-scroll to form when accessing via salesperson link
  useEffect(() => {
    if (isVendorLink) {
      // Small delay to ensure the page has rendered
      setTimeout(() => {
        const formSection = document.getElementById("orcamento");
        if (formSection) {
          formSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  }, [isVendorLink]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      <AboutSection />
      {!isVendorLink && <CTASection />}
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
