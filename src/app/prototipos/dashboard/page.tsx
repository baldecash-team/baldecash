"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Avatar, Chip, Progress } from "@nextui-org/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Home,
  CreditCard,
  Laptop,
  Bell,
  Menu,
  ChevronRight,
  TrendingUp,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Send,
  QrCode,
  Receipt,
  HelpCircle,
  Star,
  Shield,
  Gift,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  Wallet,
  PiggyBank,
  Target,
} from "lucide-react";

const transactions = [
  { id: 1, type: "pago", description: "Pago cuota Dic", amount: -189, date: "05 Dic", status: "completado" },
  { id: 2, type: "pago", description: "Pago cuota Nov", amount: -189, date: "05 Nov", status: "completado" },
  { id: 3, type: "credito", description: "Crédito aprobado", amount: 3500, date: "15 Oct", status: "completado" },
];

const featuredProducts = [
  { id: 1, name: "MacBook Air M2", price: 4999, cuota: 208, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80", available: true },
  { id: 2, name: "Lenovo IdeaPad", price: 2499, cuota: 104, image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80", available: true },
  { id: 3, name: "HP Pavilion 15", price: 2999, cuota: 125, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80", available: true },
];

const quickActions = [
  { icon: Send, label: "Pagar cuota", color: "bg-[#262877]" },
  { icon: QrCode, label: "QR Yape", color: "bg-[#8b5cf6]" },
  { icon: Receipt, label: "Estado cuenta", color: "bg-[#3b82f6]" },
  { icon: HelpCircle, label: "Ayuda", color: "bg-[#f59e0b]" },
];

// Format number with thousand separators (locale-independent)
function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true);

  const creditLimit = 3500;
  const creditUsed = 2499;
  const creditAvailable = creditLimit - creditUsed;
  const creditPercent = (creditUsed / creditLimit) * 100;

  const nextPaymentDate = "05 Enero 2026";
  const nextPaymentAmount = 189;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#262877] via-[#1e1f5c] to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#262877]/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-white/10 rounded-xl transition">
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                JP
              </div>
              <div>
                <p className="text-white font-semibold">Hola, Juan</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="text-blue-200 text-xs">Estudiante verificado</p>
                </div>
              </div>
            </div>
            <button className="p-2.5 hover:bg-white/10 rounded-xl transition relative">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#262877]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Credit Card Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="relative">
          {/* Credit Card */}
          <div className="relative bg-gradient-to-br from-[#3a3b9e] via-[#4f46e5] to-[#7c3aed] rounded-3xl p-6 shadow-2xl shadow-violet-500/20 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-violet-200 text-sm font-medium">Línea disponible</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-4xl font-bold text-white tracking-tight">
                      {showBalance ? `S/${formatNumber(creditAvailable)}` : "S/••••"}
                    </p>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-2 hover:bg-white/10 rounded-full transition"
                    >
                      {showBalance ? (
                        <EyeOff className="w-5 h-5 text-violet-200" />
                      ) : (
                        <Eye className="w-5 h-5 text-violet-200" />
                      )}
                    </button>
                  </div>
                </div>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-3 py-1">
                  <Shield className="w-3 h-3 mr-1.5" /> Activo
                </Badge>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-violet-200">Crédito utilizado</span>
                  <span className="text-white font-semibold">S/{formatNumber(creditUsed)} / S/{formatNumber(creditLimit)}</span>
                </div>
                <div className="h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-white rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${creditPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/20">
                <div>
                  <p className="text-violet-200 text-xs">Próximo pago</p>
                  <p className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-4 h-4" /> {nextPaymentDate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-violet-200 text-xs">Monto</p>
                  <p className="text-white font-bold text-2xl">S/{nextPaymentAmount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                className="flex flex-col items-center gap-2.5 p-4 bg-slate-800/60 backdrop-blur-sm rounded-2xl hover:bg-slate-800 transition-all hover:scale-105 border border-slate-700/50"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-slate-300 font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="container mx-auto px-4 pb-28">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/60 backdrop-blur-sm rounded-2xl p-1.5 border border-slate-700/50">
            <TabsTrigger value="home" className="rounded-xl data-[state=active]:bg-[#262877] data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 font-medium transition-all">
              Inicio
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-xl data-[state=active]:bg-[#262877] data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 font-medium transition-all">
              Actividad
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl data-[state=active]:bg-[#262877] data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 font-medium transition-all">
              Productos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="mt-6 space-y-6">
            {/* Payment Reminder */}
            <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/30 backdrop-blur-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-amber-200 text-sm">Próximo pago en 30 días</p>
                    <p className="text-white font-bold text-lg">S/{nextPaymentAmount}</p>
                  </div>
                </div>
                <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg">
                  Pagar ahora
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">Buen historial</span>
                  </div>
                  <p className="text-3xl font-bold text-white">100%</p>
                  <p className="text-xs text-slate-400 mt-1">Pagos a tiempo</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-violet-400 mb-2">
                    <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">Nivel BaldeCash</span>
                  </div>
                  <p className="text-3xl font-bold text-white">Bronce</p>
                  <p className="text-xs text-slate-400 mt-1">250 pts para Plata</p>
                </CardContent>
              </Card>
            </div>

            {/* Featured Products */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Productos para ti</h3>
                <Link href="/prototipos/laptops" className="text-[#818cf8] text-sm flex items-center gap-1 font-medium hover:text-violet-300 transition">
                  Ver todos <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {featuredProducts.map((product) => (
                  <Card key={product.id} className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 min-w-[200px] flex-shrink-0 hover:bg-slate-800 transition-all hover:scale-[1.02]">
                    <CardContent className="p-3">
                      <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-700/50 mb-3">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      </div>
                      <p className="text-white font-semibold text-sm">{product.name}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div>
                          <p className="text-xs text-slate-400">Desde</p>
                          <p className="text-[#818cf8] font-bold">S/{product.cuota}/mes</p>
                        </div>
                        {product.available && (
                          <Chip size="sm" className="bg-emerald-500/20 text-emerald-400 border-0">
                            Disponible
                          </Chip>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Promo Banner */}
            <Card className="bg-gradient-to-r from-[#262877] via-[#4f46e5] to-[#7c3aed] border-0 overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Gift className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Refiere y gana</p>
                    <p className="text-violet-200 text-sm">S/50 por cada amigo</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white relative z-10" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6 space-y-4">
            <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg font-bold">Movimientos recientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-4 border-b border-slate-700/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        tx.type === "pago" ? "bg-rose-500/20" : "bg-emerald-500/20"
                      }`}>
                        {tx.type === "pago" ? (
                          <ArrowUpRight className="w-5 h-5 text-rose-400" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{tx.description}</p>
                        <p className="text-slate-400 text-sm">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.amount < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        {tx.amount < 0 ? "-" : "+"}S/{Math.abs(tx.amount)}
                      </p>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400 mt-1">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button variant="flat" className="w-full text-[#818cf8] bg-slate-800/60 hover:bg-slate-700">
              Ver historial completo
            </Button>
          </TabsContent>

          <TabsContent value="products" className="mt-6 space-y-4">
            <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white text-lg font-bold">Mi equipo</CardTitle>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Financiando</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="relative w-28 h-24 rounded-xl overflow-hidden bg-slate-700/50">
                    <Image
                      src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&q=80"
                      alt="Lenovo IdeaPad"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">Lenovo IdeaPad 3</p>
                    <p className="text-slate-400 text-sm">Comprado el 15 Oct 2025</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-400">Progreso</span>
                        <span className="text-[#818cf8] font-medium">2/12 cuotas</span>
                      </div>
                      <Progress value={16.6} className="h-2" color="secondary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-[#262877]/40 to-violet-600/20 border-[#262877]/50 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#262877] rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold">¿Necesitas otro equipo?</p>
                    <p className="text-violet-300 text-sm">Tienes S/{creditAvailable} disponibles</p>
                  </div>
                </div>
                <Button
                  as={Link}
                  href="/prototipos/laptops"
                  size="sm"
                  className="bg-[#262877] text-white font-semibold"
                >
                  Explorar
                </Button>
              </CardContent>
            </Card>

            {/* Insurance & Warranty */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-white font-semibold text-sm">Garantía</p>
                  <p className="text-emerald-400 text-xs mt-1">12 meses activa</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-white font-semibold text-sm">Seguro</p>
                  <p className="text-slate-400 text-xs mt-1">No contratado</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-50">
        <div className="flex justify-around py-3 pb-safe">
          <button className="flex flex-col items-center text-[#818cf8]">
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Inicio</span>
          </button>
          <button className="flex flex-col items-center text-slate-500 hover:text-slate-300 transition">
            <CreditCard className="w-5 h-5" />
            <span className="text-xs mt-1">Crédito</span>
          </button>
          <button className="flex flex-col items-center text-slate-500 hover:text-slate-300 transition">
            <Laptop className="w-5 h-5" />
            <span className="text-xs mt-1">Tienda</span>
          </button>
          <button className="flex flex-col items-center text-slate-500 hover:text-slate-300 transition">
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">Más</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
