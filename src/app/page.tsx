"use client";

import Link from "next/link";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Laptop, Wallet, LayoutDashboard } from "lucide-react";

const prototipos = [
  {
    title: "E-commerce Laptops",
    description: "Catálogo de laptops con financiamiento, calculadora de cuotas y flujo de compra conversacional",
    href: "/prototipos/laptops",
    icon: Laptop,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Fintech BaldeCash",
    description: "Mobile-First Conversational Wizard para financiamiento estudiantil con formulario de 3 pasos",
    href: "/prototipos/fintech",
    icon: Wallet,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Dashboard Super-App",
    description: "Panel tipo Nubank/Yape con widgets de crédito, estado de cuenta y productos destacados",
    href: "/prototipos/dashboard",
    icon: LayoutDashboard,
    color: "from-purple-500 to-pink-500",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            BaldeCash
            <span className="text-emerald-400">.com</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Prototipos UI/UX State-of-the-Art para Financiamiento Estudiantil en Perú
          </p>
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">NextUI</span>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">DaisyUI</span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Shadcn</span>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {prototipos.map((proto) => {
            const IconComponent = proto.icon;
            return (
              <Link key={proto.href} href={proto.href}>
                <Card
                  className="bg-slate-800/50 border border-slate-700 hover:border-slate-500 transition-all duration-300 hover:scale-105 cursor-pointer h-full"
                  isPressable
                >
                  <CardHeader className="flex flex-col items-center pt-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${proto.color} flex items-center justify-center mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{proto.title}</h2>
                  </CardHeader>
                  <CardBody className="text-center px-6 pb-8">
                    <p className="text-slate-400">{proto.description}</p>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>

        <footer className="mt-20 text-center text-slate-500">
          <p>Diseño Mobile-First basado en estudio UI/UX - Diciembre 2025</p>
          <p className="mt-2 text-sm">KPIs Objetivo: &gt;70% completitud, &lt;3 min aplicación, 40-50% attach rate</p>
        </footer>
      </div>
    </main>
  );
}
