"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardBody, CardFooter, Button, Chip, Slider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Heart, Star, Laptop, Monitor, Cpu, HardDrive, Filter, Search, Check, Shield, Headphones, Mouse } from "lucide-react";

const laptops = [
  {
    id: 1,
    name: "MacBook Air M2",
    brand: "Apple",
    price: 4999,
    image: "https://placehold.co/400x300/1a1a2e/ffffff?text=MacBook+Air",
    specs: { ram: "8GB", storage: "256GB", processor: "M2" },
    rating: 4.9,
    reviews: 234,
    available: true,
  },
  {
    id: 2,
    name: "Lenovo IdeaPad 3",
    brand: "Lenovo",
    price: 2499,
    image: "https://placehold.co/400x300/16213e/ffffff?text=IdeaPad+3",
    specs: { ram: "8GB", storage: "512GB", processor: "Ryzen 5" },
    rating: 4.5,
    reviews: 189,
    available: true,
  },
  {
    id: 3,
    name: "HP Pavilion 15",
    brand: "HP",
    price: 2999,
    image: "https://placehold.co/400x300/0f3460/ffffff?text=HP+Pavilion",
    specs: { ram: "16GB", storage: "512GB", processor: "i5-12th" },
    rating: 4.6,
    reviews: 156,
    available: true,
  },
  {
    id: 4,
    name: "ASUS VivoBook 15",
    brand: "ASUS",
    price: 1999,
    image: "https://placehold.co/400x300/1a1a2e/ffffff?text=VivoBook+15",
    specs: { ram: "8GB", storage: "256GB", processor: "i3-11th" },
    rating: 4.3,
    reviews: 98,
    available: true,
  },
  {
    id: 5,
    name: "Dell Inspiron 14",
    brand: "Dell",
    price: 3299,
    image: "https://placehold.co/400x300/16213e/ffffff?text=Inspiron+14",
    specs: { ram: "16GB", storage: "512GB", processor: "i7-12th" },
    rating: 4.7,
    reviews: 211,
    available: true,
  },
  {
    id: 6,
    name: "Acer Aspire 5",
    brand: "Acer",
    price: 2199,
    image: "https://placehold.co/400x300/0f3460/ffffff?text=Aspire+5",
    specs: { ram: "8GB", storage: "512GB", processor: "Ryzen 7" },
    rating: 4.4,
    reviews: 145,
    available: false,
  },
];

const accessories = [
  { id: 1, name: "Mouse Inalámbrico", price: 89, icon: Mouse },
  { id: 2, name: "Audífonos Bluetooth", price: 149, icon: Headphones },
  { id: 3, name: "Garantía Extendida 2 años", price: 199, icon: Shield },
];

function calculateMonthlyPayment(price: number, months: number) {
  const interestRate = 0.025;
  return Math.round((price * (1 + interestRate * months / 12)) / months);
}

export default function LaptopsPage() {
  const [selectedLaptop, setSelectedLaptop] = useState<typeof laptops[0] | null>(null);
  const [months, setMonths] = useState(12);
  const [selectedAccessories, setSelectedAccessories] = useState<number[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cart, setCart] = useState<number[]>([]);

  const totalPrice = selectedLaptop
    ? selectedLaptop.price + accessories.filter(a => selectedAccessories.includes(a.id)).reduce((sum, a) => sum + a.price, 0)
    : 0;

  const handleAddToCart = () => {
    if (selectedLaptop) {
      setCart([...cart, selectedLaptop.id]);
      onClose();
    }
  };

  const toggleAccessory = (id: number) => {
    setSelectedAccessories(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">TechStore</h1>
                <p className="text-sm text-slate-500">Laptops con financiamiento</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-100 rounded-full transition relative">
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Calculator */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tu laptop desde S/89/mes
          </h2>
          <p className="text-blue-100 mb-6">Sin cuenta bancaria. Aprobación en minutos.</p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-6 py-3">
            <span className="text-sm">Calcula tu cuota:</span>
            <select className="bg-transparent border-none text-white font-semibold focus:outline-none">
              <option value="6" className="text-slate-900">6 meses</option>
              <option value="12" className="text-slate-900">12 meses</option>
              <option value="18" className="text-slate-900">18 meses</option>
              <option value="24" className="text-slate-900">24 meses</option>
            </select>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <Button size="sm" variant="flat" startContent={<Filter className="w-4 h-4" />}>
            Filtros
          </Button>
          <Chip variant="flat" className="cursor-pointer">Todas</Chip>
          <Chip variant="bordered" className="cursor-pointer">Apple</Chip>
          <Chip variant="bordered" className="cursor-pointer">Lenovo</Chip>
          <Chip variant="bordered" className="cursor-pointer">HP</Chip>
          <Chip variant="bordered" className="cursor-pointer">ASUS</Chip>
          <Chip variant="bordered" className="cursor-pointer">Dell</Chip>
        </div>
      </section>

      {/* Product Grid */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {laptops.map((laptop) => (
            <Card
              key={laptop.id}
              className="group hover:shadow-xl transition-all duration-300"
              isPressable
              onPress={() => {
                setSelectedLaptop(laptop);
                setSelectedAccessories([]);
                onOpen();
              }}
            >
              <CardBody className="p-0 overflow-hidden">
                <div className="relative">
                  <img
                    src={laptop.image}
                    alt={laptop.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {laptop.available ? (
                    <Badge className="absolute top-3 left-3 bg-emerald-500">
                      Disponible
                    </Badge>
                  ) : (
                    <Badge className="absolute top-3 left-3 bg-slate-500">
                      Agotado
                    </Badge>
                  )}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()}
                    className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{laptop.brand}</p>
                  <h3 className="font-semibold text-slate-900 mt-1">{laptop.name}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> {laptop.specs.processor}
                    </span>
                    <span>•</span>
                    <span>{laptop.specs.ram}</span>
                    <span>•</span>
                    <span>{laptop.specs.storage}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{laptop.rating}</span>
                    <span className="text-xs text-slate-400">({laptop.reviews})</span>
                  </div>
                </div>
              </CardBody>
              <CardFooter className="border-t border-slate-100 bg-slate-50/50">
                <div className="w-full">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold text-slate-900">S/{laptop.price}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Desde</p>
                      <p className="text-lg font-bold text-blue-600">
                        S/{calculateMonthlyPayment(laptop.price, 12)}/mes
                      </p>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Product Modal */}
      <Modal size="2xl" isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
        <ModalContent>
          {selectedLaptop && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 uppercase">{selectedLaptop.brand}</span>
                <span>{selectedLaptop.name}</span>
              </ModalHeader>
              <ModalBody>
                <img
                  src={selectedLaptop.image}
                  alt={selectedLaptop.name}
                  className="w-full h-64 object-cover rounded-xl"
                />

                <div className="space-y-6 mt-4">
                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-slate-100 rounded-xl">
                      <Cpu className="w-5 h-5 mx-auto text-slate-600" />
                      <p className="text-xs text-slate-500 mt-1">Procesador</p>
                      <p className="font-semibold text-sm">{selectedLaptop.specs.processor}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-100 rounded-xl">
                      <Monitor className="w-5 h-5 mx-auto text-slate-600" />
                      <p className="text-xs text-slate-500 mt-1">RAM</p>
                      <p className="font-semibold text-sm">{selectedLaptop.specs.ram}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-100 rounded-xl">
                      <HardDrive className="w-5 h-5 mx-auto text-slate-600" />
                      <p className="text-xs text-slate-500 mt-1">Almacenamiento</p>
                      <p className="font-semibold text-sm">{selectedLaptop.specs.storage}</p>
                    </div>
                  </div>

                  {/* Payment Calculator */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-slate-900 mb-3">Configura tu financiamiento</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Plazo</span>
                          <span className="font-semibold">{months} meses</span>
                        </div>
                        <Slider
                          size="sm"
                          step={6}
                          minValue={6}
                          maxValue={24}
                          value={months}
                          onChange={(val) => setMonths(val as number)}
                          className="max-w-full"
                          color="primary"
                        />
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                        <span className="text-slate-600">Tu cuota mensual</span>
                        <span className="text-2xl font-bold text-blue-600">
                          S/{calculateMonthlyPayment(totalPrice, months)}/mes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Accessories Upsell */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Complementa tu compra</h4>
                    <div className="space-y-2">
                      {accessories.map((acc) => (
                        <div
                          key={acc.id}
                          onClick={() => toggleAccessory(acc.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition ${
                            selectedAccessories.includes(acc.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              selectedAccessories.includes(acc.id) ? "bg-blue-500 text-white" : "bg-slate-100"
                            }`}>
                              <acc.icon className="w-5 h-5" />
                            </div>
                            <span className="font-medium">{acc.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600">+S/{acc.price}</span>
                            {selectedAccessories.includes(acc.id) && (
                              <Check className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-600">Total a financiar</span>
                    <span className="text-xl font-bold">S/{totalPrice}</span>
                  </div>
                  <Button
                    color="primary"
                    size="lg"
                    className="w-full font-semibold"
                    onPress={handleAddToCart}
                  >
                    Solicitar este equipo - S/{calculateMonthlyPayment(totalPrice, months)}/mes
                  </Button>
                  <p className="text-xs text-center text-slate-500 mt-2">
                    🔒 Conexión segura. No compartimos tus datos.
                  </p>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Bottom Navigation Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-50">
        <div className="flex justify-around py-3">
          <button className="flex flex-col items-center text-blue-600">
            <Laptop className="w-5 h-5" />
            <span className="text-xs mt-1">Productos</span>
          </button>
          <button className="flex flex-col items-center text-slate-400">
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Buscar</span>
          </button>
          <button className="flex flex-col items-center text-slate-400">
            <Heart className="w-5 h-5" />
            <span className="text-xs mt-1">Favoritos</span>
          </button>
          <button className="flex flex-col items-center text-slate-400 relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs mt-1">Carrito</span>
            {cart.length > 0 && (
              <span className="absolute -top-1 right-2 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}
