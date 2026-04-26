"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlcalaLogo, OrganicTree } from "@/components/branding/HomeVisuals";
import { ArrowLeft, ExternalLink, Database, Cpu, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Metodologia() {
  return (
    <main className="min-h-screen pb-24">
      {/* Hero Editorial */}
      <nav className="sticky top-0 z-50 navbar px-8 py-6">
        <div className="flex justify-between items-center max-w-[1400px] mx-auto">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-black/5 group-hover:scale-105 transition-transform">
                <ArrowLeft className="w-5 h-5 text-[var(--teal-700)]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--teal-700)]">Volver al Dashboard</span>
          </Link>
          <AlcalaLogo className="h-8 w-8 opacity-20" />
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-8 pt-16 space-y-24">
        
        <header className="space-y-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-black/5 text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--teal-700)]">
             <ShieldCheck className="w-3 h-3" />
             Documentación Abierta · 2026
          </div>
          <h1 className="hero-title-serif text-8xl">Memoria de <br/>Inteligencia Urbana</h1>
          <p className="text-xl font-medium text-[var(--sand-500)] leading-relaxed">
            Madrid Refugio convierte 662.173 polígonos LiDAR y el Inventario Municipal de Arbolado en una señal operativa para la salud pública.
          </p>
        </header>

        {/* 1. Resumen Ejecutivo Bento */}
        <section className="grid md:grid-cols-[1fr_400px] gap-8">
           <Card level={1} className="premium-card p-12 space-y-8">
              <h2 className="serif text-4xl italic text-[var(--teal-700)]">01. Resumen Ejecutivo</h2>
              <div className="prose prose-teal max-w-none text-lg text-[var(--foreground)] font-medium leading-relaxed">
                <p>
                  El proyecto responde a una brecha crítica: el 64,1% de los barrios de Madrid no dispone de un refugio climático operativo a menos de 300 metros. Frente a este déficit, el sistema combina datos abiertos con topología de red para ofrecer navegación que prioriza el confort térmico.
                </p>
              </div>
              <div className="bg-[var(--teal-700)] text-white p-8 rounded-[32px] shadow-xl shadow-teal-900/10">
                <p className="italic serif text-2xl leading-snug">"No buscamos la ruta más corta, sino la de menor coste térmico para poblaciones vulnerables."</p>
              </div>
           </Card>
           <div className="space-y-8">
              <div className="premium-card p-8 flex flex-col items-center text-center gap-4 aspect-square justify-center">
                 <Database className="w-12 h-12 text-[var(--gold-500)]" />
                 <h3 className="serif text-2xl font-bold">Datos Abiertos</h3>
                 <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--sand-500)]">Consumo directo de datos.madrid.es</p>
              </div>
              <div className="premium-card p-8 flex flex-col items-center text-center gap-4 aspect-square justify-center bg-[var(--teal-700)] text-white">
                 <Cpu className="w-12 h-12 text-[var(--gold-500)]" />
                 <h3 className="serif text-2xl font-bold">Procesado</h3>
                 <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Cálculo determinista de sombras</p>
              </div>
           </div>
        </section>

        {/* 2. Pipeline Visual */}
        <section className="space-y-12">
            <div className="text-center space-y-4">
                <h2 className="serif text-5xl italic">Arquitectura del Dato</h2>
                <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-[var(--sand-500)]">Del sensor LiDAR al navegador peatonal</p>
            </div>
            <div className="premium-card p-4 overflow-hidden">
                <img src="/pipeline_diagram.png" className="w-full rounded-[28px]" alt="Pipeline de datos" />
            </div>
        </section>

        {/* 3. Función de Coste */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
                <h2 className="serif text-5xl italic">02. El Algoritmo</h2>
                <p className="text-lg font-medium text-[var(--sand-500)] leading-relaxed">
                    Utilizamos una función de coste dinámica sobre el callejero oficial (OSM), penalizando los tramos expuestos al sol y bonificando la proximidad a fuentes y refugios.
                </p>
                <div className="bg-white/40 p-10 rounded-[40px] border border-black/5 font-mono text-xl text-[var(--teal-700)] shadow-inner">
                    cost = length * (1.0 + P)
                </div>
            </div>
            <div className="premium-card p-4 overflow-hidden aspect-video flex items-center justify-center">
                <img src="/cost_function_diagram.png" className="w-full rounded-[28px]" alt="Función de coste" />
            </div>
        </section>

        {/* Footer Editorial */}
        <footer className="pt-24 border-t border-black/5 flex justify-between items-end">
            <div className="space-y-4">
                <AlcalaLogo className="w-12 h-12 opacity-40" />
                <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--sand-500)]">Madrid Refugio · Laboratorio de Inteligencia Urbana</p>
            </div>
            <a href="https://github.com/vuestra-repo" className="flex items-center gap-2 text-xs font-bold text-[var(--teal-700)] hover:underline">
                VER CÓDIGO FUENTE <ExternalLink className="w-3 h-3" />
            </a>
        </footer>

      </div>
    </main>
  );
}
