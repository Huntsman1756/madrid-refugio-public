"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Building2, Users, Clock3, Navigation, ArrowRight, Download } from "lucide-react";
import { TreePine } from "@/components/ui/Icons";
import { AlcalaLogo, PremiumHeroVisual, OrganicTree } from "@/components/branding/HomeVisuals";
import { RoutingSection } from "@/components/RoutingSection";

function CountUp({ end }: { end: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setVal(Math.floor(progress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end]);
  return <>{val.toLocaleString('es-ES')}</>;
}

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    mainRef.current?.querySelectorAll('.fade-in-up').forEach(n => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <main ref={mainRef} className="min-h-screen">
      {/* Navbar — Floating reference style */}
      <nav className="sticky top-0 z-50 navbar px-6 py-4">
        <div className="flex justify-between items-center max-w-[1800px] mx-auto">
          <div className="flex items-center gap-3">
            <AlcalaLogo className="h-8 w-8" />
            <div>
              <span className="block font-semibold text-[var(--ds-black)] tracking-tight">Madrid Refugio</span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--ds-gray-500)]">Criterio Climático</span>
            </div>
          </div>
          <Link href="/metodologia">
            <Button variant="secondary" className="hero-chip-secondary text-[10px] h-10 px-6">Metodología</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Masterpiece — Panoramic teal style */}
      <div className="max-w-[1800px] mx-auto px-6 pb-8 pt-6 sm:px-6 sm:pb-12 sm:pt-10">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_480px] gap-16 items-start">
          
          <div id="routing" className="text-left space-y-12 py-4">
            <div className="space-y-8">
              <div className="fade-in-up flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--teal-700)] opacity-60">
                <OrganicTree className="h-4 w-4" />
                Madrid caminado con criterio climático
              </div>
              <h1 className="hero-title-serif fade-in-up text-[clamp(4rem,7vw,7.5rem)] text-[var(--ds-black)]">
                Camina por Madrid <br/>con menos calor
              </h1>
              <p className="fade-in-up max-w-2xl text-xl font-medium leading-relaxed text-[var(--ds-gray-500)]">
                Calcula tu ruta a pie evitando el sol directo. Comparamos el trayecto directo con una alternativa más fresca usando sombra real de edificios, arbolado urbano y fuentes.
              </p>
              
              <div className="fade-in-up flex flex-wrap gap-5">
                <span className="hero-chip-main flex items-center gap-3">
                  <Navigation className="w-3.5 h-3.5" />
                  Sombra urbana real
                </span>
                <span className="hero-chip-secondary flex items-center gap-3 hover:bg-white/80 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                  Comparación inmediata
                </span>
              </div>
            </div>

            {/* Epic Stats Strip — Identical to Image */}
            <div className="fade-in-up grid grid-cols-2 md:grid-cols-4 gap-12 pt-12 border-t border-black/5">
              {[
                { end: 662173, label: "polígonos LiDAR", icon: Building2 },
                { end: 661192, label: "árboles catalogados", icon: TreePine },
                { end: 430000, label: "mayores de 65", icon: Users },
                { end: 13, label: "franjas horarias", icon: Clock3 },
              ].map((stat) => (
                <div key={stat.label} className="space-y-2 group">
                  <div className="flex items-center gap-2 mb-2 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                    <stat.icon className="h-4 w-4" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <span className="font-serif italic text-4xl font-light text-[var(--ds-black)] tabular-nums leading-none block">
                    <CountUp end={stat.end} />
                  </span>
                </div>
              ))}
            </div>

            {/* Skyline Reference Box */}
            <div className="fade-in-up pt-4">
              <PremiumHeroVisual className="h-[280px] w-full" />
            </div>
          </div>

          {/* Right: The Planning & Results Cards */}
          <div className="space-y-10">
            <RoutingSection />
            
            {/* Disclaimer identical to reference footer */}
            <div className="fade-in-up pt-4 text-center lg:text-left border-t border-black/5">
               <p className="text-[10px] text-gray-400 font-medium italic leading-relaxed">
                * Cálculos basados en proyección geométrica de edificios (LiDAR) y 661.192 árboles del Inventario Municipal. <br/>Diseño bajo filosofía Civic Thermalism. Madrid 2026.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Secondary content for full page consistency */}
      <section className="bg-white/30 py-24 border-t border-black/5">
        <div className="max-w-[1200px] mx-auto px-6">
           <h2 className="serif text-4xl mb-12 italic text-center">Arquitectura y Algoritmia</h2>
           <div className="grid md:grid-cols-3 gap-8">
              <Card level={1} className="premium-card p-8">
                <h3 className="card-title text-xl mb-4">01. LiDAR</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Procesamiento de volumetría real para sombras deterministas por hora.</p>
              </Card>
              <Card level={1} className="premium-card p-8">
                <h3 className="card-title text-xl mb-4">02. Grafo</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Integración de NetworkX sobre topología oficial de Madrid.</p>
              </Card>
              <Card level={1} className="premium-card p-8">
                <h3 className="card-title text-xl mb-4">03. Impacto</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Priorización de rutas en barrios con déficit de refugios operativos.</p>
              </Card>
           </div>
        </div>
      </section>
    </main>
  );
}
