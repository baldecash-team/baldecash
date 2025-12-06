"use client";

import { useState } from "react";
import Link from "next/link";
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
  MoreHorizontal,
  Smartphone,
} from "lucide-react";

const transactions = [
  { id: 1, type: "pago", description: "Pago cuota Dic", amount: -189, date: "05 Dic", status: "completado" },
  { id: 2, type: "pago", description: "Pago cuota Nov", amount: -189, date: "05 Nov", status: "completado" },
  { id: 3, type: "credito", description: "Crédito aprobado", amount: 3500, date: "15 Oct", status: "completado" },
];

const featuredProducts = [
  { id: 1, name: "MacBook Air M2", price: 4999, cuota: 208, image: "https://placehold.co/120x80/1a1a2e/ffffff?text=MacBook", available: true },
  { id: 2, name: "Lenovo IdeaPad", price: 2499, cuota: 104, image: "https://placehold.co/120x80/16213e/ffffff?text=IdeaPad", available: true },
  { id: 3, name: "HP Pavilion 15", price: 2999, cuota: 125, image: "https://placehold.co/120x80/0f3460/ffffff?text=Pavilion", available: true },
];

const quickActions = [
  { icon: Send, label: "Pagar cuota", color: "bg-purple-500" },
  { icon: QrCode, label: "QR Yape", color: "bg-pink-500" },
  { icon: Receipt, label: "Estado de cuenta", color: "bg-blue-500" },
  { icon: HelpCircle, label: "Ayuda", color: "bg-amber-500" },
];

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  const creditLimit = 3500;
  const creditUsed = 2499;
  const creditAvailable = creditLimit - creditUsed;
  const creditPercent = (creditUsed / creditLimit) * 100;

  const nextPaymentDate = "05 Enero 2026";
  const nextPaymentAmount = 189;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-purple-900/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-purple-800 rounded-full transition">
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <Avatar
                src="https://placehold.co/40x40/6366f1/ffffff?text=JP"
                className="w-10 h-10 border-2 border-purple-400"
              />
              <div>
                <p className="text-white font-medium">Hola, Juan</p>
                <p className="text-purple-300 text-sm">Estudiante verificado</p>
              </div>
            </div>
            <button className="p-2 hover:bg-purple-800 rounded-full transition relative">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Credit Card Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="relative">
          {/* Credit Card */}
          <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-purple-200 text-sm">Línea disponible</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-white">
                    {showBalance ? `S/${creditAvailable.toLocaleString()}` : "S/••••"}
                  </p>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1 hover:bg-white/10 rounded-full transition"
                  >
                    {showBalance ? (
                      <EyeOff className="w-5 h-5 text-purple-200" />
                    ) : (
                      <Eye className="w-5 h-5 text-purple-200" />
                    )}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-white/20 text-white border-0">
                  <Shield className="w-3 h-3 mr-1" /> Activo
                </Badge>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-purple-200">Crédito utilizado</span>
                <span className="text-white font-medium">S/{creditUsed.toLocaleString()} / S/{creditLimit.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-purple-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${creditPercent}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-purple-400/30">
              <div>
                <p className="text-purple-200 text-xs">Próximo pago</p>
                <p className="text-white font-semibold flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {nextPaymentDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-purple-200 text-xs">Monto</p>
                <p className="text-white font-bold text-xl">S/{nextPaymentAmount}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 rounded-2xl hover:bg-slate-800 transition"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-slate-300">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="container mx-auto px-4 pb-24">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 rounded-xl p-1">
            <TabsTrigger value="home" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400">
              Inicio
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400">
              Actividad
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400">
              Productos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="mt-6 space-y-6">
            {/* Payment Reminder */}
            <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-amber-200 text-sm">Próximo pago en 30 días</p>
                    <p className="text-white font-semibold">S/{nextPaymentAmount}</p>
                  </div>
                </div>
                <Button size="sm" className="bg-amber-500 text-white">
                  Pagar ahora
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">Buen historial</span>
                  </div>
                  <p className="text-2xl font-bold text-white">100%</p>
                  <p className="text-xs text-slate-400">Pagos a tiempo</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <Star className="w-4 h-4" />
                    <span className="text-xs">Nivel BaldeCash</span>
                  </div>
                  <p className="text-2xl font-bold text-white">Bronce</p>
                  <p className="text-xs text-slate-400">250 pts para Plata</p>
                </CardContent>
              </Card>
            </div>

            {/* Featured Products */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Productos para ti</h3>
                <Link href="/prototipos/laptops" className="text-purple-400 text-sm flex items-center gap-1">
                  Ver todos <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
                {featuredProducts.map((product) => (
                  <Card key={product.id} className="bg-slate-800/50 border-slate-700 min-w-[200px] flex-shrink-0">
                    <CardContent className="p-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-20 object-cover rounded-lg mb-3"
                      />
                      <p className="text-white font-medium text-sm">{product.name}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div>
                          <p className="text-xs text-slate-400">Desde</p>
                          <p className="text-purple-400 font-bold">S/{product.cuota}/mes</p>
                        </div>
                        {product.available && (
                          <Chip size="sm" color="success" variant="flat">
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
            <Card className="bg-gradient-to-r from-pink-600 to-purple-600 border-0 overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Refiere y gana</p>
                    <p className="text-pink-200 text-sm">S/50 por cada amigo</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6 space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Movimientos recientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === "pago" ? "bg-red-500/20" : "bg-emerald-500/20"
                      }`}>
                        {tx.type === "pago" ? (
                          <ArrowUpRight className="w-5 h-5 text-red-400" />
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
                      <p className={`font-semibold ${tx.amount < 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {tx.amount < 0 ? "-" : "+"}S/{Math.abs(tx.amount)}
                      </p>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button variant="flat" className="w-full text-purple-400">
              Ver historial completo
            </Button>
          </TabsContent>

          <TabsContent value="products" className="mt-6 space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white text-lg">Mi equipo</CardTitle>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Financiando</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <img
                    src="https://placehold.co/100x80/16213e/ffffff?text=IdeaPad"
                    alt="Lenovo IdeaPad"
                    className="w-24 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">Lenovo IdeaPad 3</p>
                    <p className="text-slate-400 text-sm">Comprado el 15 Oct 2025</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Progreso</span>
                        <span className="text-purple-400">2/12 cuotas</span>
                      </div>
                      <Progress value={16.6} className="h-2" color="secondary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">¿Necesitas otro equipo?</p>
                    <p className="text-purple-300 text-sm">Tienes S/{creditAvailable} disponibles</p>
                  </div>
                </div>
                <Button
                  as={Link}
                  href="/prototipos/laptops"
                  size="sm"
                  className="bg-purple-500"
                >
                  Explorar
                </Button>
              </CardContent>
            </Card>

            {/* Insurance & Warranty */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-white font-medium text-sm">Garantía</p>
                  <p className="text-emerald-400 text-xs">12 meses activa</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <Smartphone className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-white font-medium text-sm">Seguro</p>
                  <p className="text-slate-400 text-xs">No contratado</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-50">
        <div className="flex justify-around py-3">
          <button className="flex flex-col items-center text-purple-400">
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Inicio</span>
          </button>
          <button className="flex flex-col items-center text-slate-500">
            <CreditCard className="w-5 h-5" />
            <span className="text-xs mt-1">Crédito</span>
          </button>
          <button className="flex flex-col items-center text-slate-500">
            <Laptop className="w-5 h-5" />
            <span className="text-xs mt-1">Tienda</span>
          </button>
          <button className="flex flex-col items-center text-slate-500">
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">Más</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
