import Header from "@/components/layout/Header";
import LeadFormWizard from "@/components/LeadFormWizard";
import { OfflineStatusBar } from "./OfflineStatusBar";

export function VendorLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      <Header />
      <OfflineStatusBar />

      {/* Form Section */}
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <LeadFormWizard />
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 bg-secondary text-white text-center">
        <div className="container mx-auto px-4">
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()} Mais Energia Solar. Todos os direitos reservados.
          </p>
          <p className="text-sm opacity-60 mt-1">
            <a href="tel:+5532998437675" className="hover:opacity-100">(32) 99843-7675</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
