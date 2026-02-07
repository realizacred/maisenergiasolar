import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CalculadoraWizard } from "@/components/calculadora";

export default function Calculadora() {
  return (
    <div className="min-h-screen gradient-mesh flex flex-col">
      <Header showCalculadora={false}>
        <Link to="/">
          <Button variant="default" size="sm" className="gap-2">
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="hidden sm:inline">Página Inicial</span>
            <span className="sm:hidden">Início</span>
          </Button>
        </Link>
      </Header>

      <main className="container mx-auto px-4 pt-24 pb-8 max-w-3xl flex-1">
        <CalculadoraWizard />
      </main>

      <Footer />
    </div>
  );
}
