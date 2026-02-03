import WhatsAppButton from "@/components/WhatsAppButton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { HeroSection, LeadFormSection } from "@/components/home";

// WhatsApp da Mais Energia Solar
const WHATSAPP_NUMBER = "5532998437675";

export default function Index() {
  return (
    <div className="min-h-screen gradient-solar-soft">
      <Header />
      <HeroSection />
      <LeadFormSection />
      <Footer />
      <WhatsAppButton phoneNumber={WHATSAPP_NUMBER} />
    </div>
  );
}
