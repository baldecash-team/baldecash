"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardBody, CardFooter, Button, Chip, Slider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Heart, Star, Laptop, Monitor, Cpu, HardDrive, Filter, Search, Check, Shield, Headphones, Mouse, Zap, Truck, CreditCard, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";

const laptops = [
  {
    id: 1,
    name: "MacBook Air M2",
    brand: "Apple",
    price: 4999,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    specs: { ram: "8GB", storage: "256GB", processor: "M2" },
    rating: 4.9,
    reviews: 234,
    available: true,
    color: "Gris Espacial",
  },
  {
    id: 2,
    name: "Lenovo IdeaPad 3",
    brand: "Lenovo",
    price: 2499,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80",
    specs: { ram: "8GB", storage: "512GB", processor: "Ryzen 5" },
    rating: 4.5,
    reviews: 189,
    available: true,
    color: "Azul Abismo",
  },
  {
    id: 3,
    name: "HP Pavilion 15",
    brand: "HP",
    price: 2999,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    specs: { ram: "16GB", storage: "512GB", processor: "i5-12th" },
    rating: 4.6,
    reviews: 156,
    available: true,
    color: "Plata Natural",
  },
  {
    id: 4,
    name: "ASUS VivoBook 15",
    brand: "ASUS",
    price: 1999,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
    specs: { ram: "8GB", storage: "256GB", processor: "i3-11th" },
    rating: 4.3,
    reviews: 98,
    available: true,
    color: "Plata Transparente",
  },
  {
    id: 5,
    name: "Dell Inspiron 14",
    brand: "Dell",
    price: 3299,
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80",
    specs: { ram: "16GB", storage: "512GB", processor: "i7-12th" },
    rating: 4.7,
    reviews: 211,
    available: true,
    color: "Carbón",
  },
  {
    id: 6,
    name: "Acer Aspire 5",
    brand: "Acer",
    price: 2199,
    image: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&q=80",
    specs: { ram: "8GB", storage: "512GB", processor: "Ryzen 7" },
    rating: 4.4,
    reviews: 145,
    available: false,
    color: "Negro Puro",
  },
];

const brands = ["Todas", "Apple", "Lenovo", "HP", "ASUS", "Dell", "Acer"];

const accessories = [
  { id: 1, name: "Mouse Inalámbrico Pro", price: 89, icon: Mouse, description: "Ergonómico, 6 botones" },
  { id: 2, name: "Audífonos Bluetooth ANC", price: 149, icon: Headphones, description: "Cancelación de ruido activa" },
  { id: 3, name: "Garantía Extendida +2 años", price: 199, icon: Shield, description: "Cobertura total accidentes" },
];

type SortOption = "price-asc" | "price-desc" | "rating" | "name";

function calculateMonthlyPayment(price: number, months: number) {
  const interestRate = 0.025;
  return Math.round((price * (1 + interestRate * months / 12)) / months);
}

export default function LaptopsPage() {
  const [selectedLaptop, setSelectedLaptop] = useState<typeof laptops[0] | null>(null);
  const [months, setMonths] = useState(12);
  const [selectedAccessories, setSelectedAccessories] = useState<number[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cart, setCart] = useState<typeof laptops>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filter and sort laptops
  const filteredLaptops = useMemo(() => {
    let result = [...laptops];

    // Filter by brand
    if (selectedBrand !== "Todas") {
      result = result.filter(laptop => laptop.brand === selectedBrand);
    }

    // Filter by availability
    if (showOnlyAvailable) {
      result = result.filter(laptop => laptop.available);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(laptop =>
        laptop.name.toLowerCase().includes(query) ||
        laptop.brand.toLowerCase().includes(query) ||
        laptop.specs.processor.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [selectedBrand, sortBy, searchQuery, showOnlyAvailable]);

  const totalPrice = selectedLaptop
    ? selectedLaptop.price + accessories.filter(a => selectedAccessories.includes(a.id)).reduce((sum, a) => sum + a.price, 0)
    : 0;

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handleAddToCart = () => {
    if (selectedLaptop) {
      setCart([...cart, selectedLaptop]);
      onClose();
    }
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const toggleAccessory = (id: number) => {
    setSelectedAccessories(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case "price-asc": return "Menor precio";
      case "price-desc": return "Mayor precio";
      case "rating": return "Mejor valorados";
      case "name": return "Nombre A-Z";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#262877]/5 via-white to-violet-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#262877]/10 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-[#262877]/10 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5 text-[#262877]" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-[#262877]">
                  BaldeCash Store
                </h1>
                <p className="text-xs text-[#262877]/70">Laptops con financiamiento flexible</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 hover:bg-[#262877]/10 rounded-xl transition-colors md:hidden"
              >
                <Search className="w-5 h-5 text-[#262877]" />
              </button>
              <button
                onClick={() => {/* Show favorites modal */}}
                className="p-2.5 hover:bg-[#262877]/10 rounded-xl transition-colors relative group"
              >
                <Heart className={`w-5 h-5 transition-colors ${favorites.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-[#262877]'}`} />
                {favorites.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2.5 hover:bg-[#262877]/10 rounded-xl transition-colors relative group"
              >
                <ShoppingCart className="w-5 h-5 text-[#262877]" />
                {cart.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#262877] text-white text-[10px] font-medium rounded-full flex items-center justify-center animate-pulse">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="mt-3 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar laptops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-[#262877]/20 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#262877]/20 focus:border-[#262877]"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#262877] via-[#3a3b9e] to-[#262877] text-white py-10 md:py-14">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Aprobación en minutos</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">
              Tu laptop desde
              <span className="block text-violet-200">S/89/mes</span>
            </h2>
            <p className="text-violet-100 mb-6 text-sm md:text-base">
              Sin cuenta bancaria. Sin aval. 100% digital.
            </p>

            {/* Desktop Search */}
            <div className="hidden md:block max-w-md mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por marca, modelo o procesador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#262877]/30 shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Benefits Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs">
                <Truck className="w-3.5 h-3.5" />
                <span>Envío gratis</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>Garantía incluida</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
            {/* Sort Dropdown */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="flat"
                  className="bg-white shadow-sm border border-slate-200 shrink-0"
                  startContent={<ArrowUpDown className="w-3.5 h-3.5" />}
                >
                  {getSortLabel(sortBy)}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Sort options"
                selectionMode="single"
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as SortOption)}
                className="bg-white"
                itemClasses={{
                  base: "data-[hover=true]:bg-slate-100",
                }}
              >
                <DropdownItem key="rating">Mejor valorados</DropdownItem>
                <DropdownItem key="price-asc">Menor precio</DropdownItem>
                <DropdownItem key="price-desc">Mayor precio</DropdownItem>
                <DropdownItem key="name">Nombre A-Z</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {/* Available Only Toggle */}
            <Button
              size="sm"
              variant={showOnlyAvailable ? "solid" : "flat"}
              color={showOnlyAvailable ? "success" : "default"}
              className={`shrink-0 ${!showOnlyAvailable ? 'bg-white shadow-sm border border-slate-200' : ''}`}
              onPress={() => setShowOnlyAvailable(!showOnlyAvailable)}
            >
              {showOnlyAvailable ? "✓ Disponibles" : "Solo disponibles"}
            </Button>

            <div className="h-5 w-px bg-slate-200 shrink-0" />

            {/* Brand Filters */}
            {brands.map((brand) => (
              <Chip
                key={brand}
                variant={selectedBrand === brand ? "solid" : "bordered"}
                className={`cursor-pointer shrink-0 transition-all ${
                  selectedBrand === brand
                    ? 'bg-[#262877] text-white border-[#262877]'
                    : 'border-[#262877]/30 text-[#262877] hover:bg-[#262877]/10'
                }`}
                onClick={() => setSelectedBrand(brand)}
              >
                {brand}
              </Chip>
            ))}
          </div>
        </div>

        {/* Active Filters & Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            <span className="font-semibold">{filteredLaptops.length}</span> productos encontrados
            {selectedBrand !== "Todas" && (
              <span className="ml-2 inline-flex items-center gap-1 bg-[#262877]/10 text-[#262877] px-2 py-0.5 rounded-full text-xs">
                {selectedBrand}
                <button onClick={() => setSelectedBrand("Todas")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="ml-2 inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs">
                &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="container mx-auto px-4 pb-24 md:pb-12">
        {filteredLaptops.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No encontramos resultados</h3>
            <p className="text-slate-500 mb-4">Intenta con otros filtros o términos de búsqueda</p>
            <Button
              color="primary"
              variant="flat"
              onPress={() => {
                setSelectedBrand("Todas");
                setSearchQuery("");
                setShowOnlyAvailable(false);
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredLaptops.map((laptop) => (
              <Card
                key={laptop.id}
                className="group border border-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1"
                isPressable
                onPress={() => {
                  setSelectedLaptop(laptop);
                  setSelectedAccessories([]);
                  onOpen();
                }}
              >
                <CardBody className="p-0 overflow-hidden">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50">
                    <Image
                      src={laptop.image}
                      alt={laptop.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {laptop.available ? (
                        <Badge className="bg-emerald-500/90 backdrop-blur-sm text-white border-0 shadow-lg">
                          Disponible
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-800/80 backdrop-blur-sm text-white border-0">
                          Agotado
                        </Badge>
                      )}
                      {laptop.rating >= 4.7 && (
                        <Badge className="bg-amber-500/90 backdrop-blur-sm text-white border-0 shadow-lg">
                          Top Ventas
                        </Badge>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => toggleFavorite(e, laptop.id)}
                      onKeyDown={(e) => e.key === 'Enter' && toggleFavorite(e as unknown as React.MouseEvent, laptop.id)}
                      className={`absolute top-3 right-3 p-2.5 rounded-xl transition-all duration-300 cursor-pointer shadow-lg ${
                        favorites.includes(laptop.id)
                          ? 'bg-rose-500 text-white scale-110'
                          : 'bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110'
                      }`}
                    >
                      <Heart className={`w-4 h-4 transition-all ${favorites.includes(laptop.id) ? 'fill-white' : 'text-slate-600'}`} />
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-[#262877] uppercase tracking-wider">{laptop.brand}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold text-slate-700">{laptop.rating}</span>
                        <span className="text-xs text-slate-400">({laptop.reviews})</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-base mb-2">{laptop.name}</h3>

                    {/* Specs Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                        <Cpu className="w-3 h-3" /> {laptop.specs.processor}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                        {laptop.specs.ram}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                        {laptop.specs.storage}
                      </span>
                    </div>
                  </div>
                </CardBody>

                <CardFooter className="border-t border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50 p-4">
                  <div className="w-full">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Precio contado</p>
                        <span className="text-xl font-bold text-slate-900">S/{laptop.price.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-0.5">Desde</p>
                        <p className="text-lg font-bold text-[#262877]">
                          S/{calculateMonthlyPayment(laptop.price, 12)}<span className="text-sm font-medium">/mes</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Product Modal */}
      <Modal
        size="2xl"
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "border border-slate-200",
        }}
      >
        <ModalContent>
          {selectedLaptop && (
            <>
              <ModalHeader className="flex flex-col gap-1 pb-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#262877] uppercase tracking-wider">{selectedLaptop.brand}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{selectedLaptop.color}</span>
                </div>
                <span className="text-xl font-bold">{selectedLaptop.name}</span>
              </ModalHeader>

              <ModalBody className="pt-4">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                  <Image
                    src={selectedLaptop.image}
                    alt={selectedLaptop.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>

                <div className="space-y-5 mt-2">
                  {/* Specs Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200/50">
                      <div className="w-10 h-10 mx-auto mb-2 bg-[#262877]/10 rounded-xl flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-[#262877]" />
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Procesador</p>
                      <p className="font-semibold text-sm text-slate-900">{selectedLaptop.specs.processor}</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200/50">
                      <div className="w-10 h-10 mx-auto mb-2 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Memoria RAM</p>
                      <p className="font-semibold text-sm text-slate-900">{selectedLaptop.specs.ram}</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200/50">
                      <div className="w-10 h-10 mx-auto mb-2 bg-violet-100 rounded-xl flex items-center justify-center">
                        <HardDrive className="w-5 h-5 text-violet-600" />
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Almacenamiento</p>
                      <p className="font-semibold text-sm text-slate-900">{selectedLaptop.specs.storage}</p>
                    </div>
                  </div>

                  {/* Payment Calculator */}
                  <div className="bg-white border-2 border-[#262877]/20 p-4 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-[#262877] rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-900">Configura tu financiamiento</h4>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Plazo de pago</span>
                          <span className="font-bold text-[#262877]">{months} meses</span>
                        </div>
                        <Slider
                          size="sm"
                          step={6}
                          minValue={6}
                          maxValue={24}
                          value={months}
                          onChange={(val) => setMonths(val as number)}
                          className="max-w-full"
                          classNames={{
                            track: "bg-[#262877]/20",
                            filler: "bg-[#262877]",
                            thumb: "bg-[#262877] border-[#262877]",
                          }}
                          showSteps
                          marks={[
                            { value: 6, label: "6" },
                            { value: 12, label: "12" },
                            { value: 18, label: "18" },
                            { value: 24, label: "24" },
                          ]}
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <div>
                          <p className="text-xs text-slate-500">Tu cuota mensual</p>
                          <p className="text-xs text-slate-400">Tasa 2.5%</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-[#262877]">
                            S/{calculateMonthlyPayment(totalPrice, months)}
                          </span>
                          <span className="text-[#262877] font-medium text-sm">/mes</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accessories Upsell */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Complementa tu compra
                    </h4>
                    <div className="space-y-2">
                      {accessories.map((acc) => (
                        <div
                          key={acc.id}
                          onClick={() => toggleAccessory(acc.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            selectedAccessories.includes(acc.id)
                              ? "border-[#262877] bg-[#262877]/5 shadow-md shadow-[#262877]/10"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                              selectedAccessories.includes(acc.id) ? "bg-[#262877] text-white" : "bg-slate-100 text-slate-600"
                            }`}>
                              <acc.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 text-sm">{acc.name}</p>
                              <p className="text-xs text-slate-500">{acc.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-semibold ${selectedAccessories.includes(acc.id) ? 'text-[#262877]' : 'text-slate-600'}`}>
                              +S/{acc.price}
                            </span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedAccessories.includes(acc.id)
                                ? 'border-[#262877] bg-[#262877]'
                                : 'border-slate-300'
                            }`}>
                              {selectedAccessories.includes(acc.id) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="border-t bg-slate-50/50 flex-col gap-3">
                <div className="w-full flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500">Total a financiar</p>
                    <span className="text-2xl font-bold text-slate-900">S/{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{months} cuotas de</p>
                    <span className="text-xl font-bold text-[#262877]">S/{calculateMonthlyPayment(totalPrice, months)}</span>
                  </div>
                </div>
                <Button
                  color="primary"
                  size="lg"
                  className="w-full font-semibold text-base h-12 bg-[#262877] hover:bg-[#3a3b9e] shadow-lg shadow-[#262877]/30"
                  onPress={handleAddToCart}
                  isDisabled={!selectedLaptop.available}
                >
                  {selectedLaptop.available
                    ? `Solicitar ahora - S/${calculateMonthlyPayment(totalPrice, months)}/mes`
                    : "Producto agotado"
                  }
                </Button>
                <p className="text-xs text-center text-slate-500 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Conexión segura. No compartimos tus datos.
                </p>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Cart Modal */}
      <Modal
        size="md"
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#262877]" />
            <span>Mi Carrito ({cart.length})</span>
          </ModalHeader>
          <ModalBody>
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500">Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#262877] font-medium">{item.brand}</p>
                      <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-sm text-slate-600">S/{item.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
          {cart.length > 0 && (
            <ModalFooter className="flex-col gap-3 border-t">
              <div className="w-full flex justify-between items-center">
                <span className="text-slate-600">Total</span>
                <span className="text-2xl font-bold text-slate-900">S/{cartTotal.toLocaleString()}</span>
              </div>
              <Button
                color="primary"
                size="lg"
                className="w-full font-semibold bg-[#262877] hover:bg-[#3a3b9e]"
              >
                Proceder al pago
              </Button>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>

      {/* Bottom Navigation Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 md:hidden z-50 pb-safe">
        <div className="flex justify-around py-2">
          <button className="flex flex-col items-center py-1.5 px-3 text-[#262877]">
            <Laptop className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Productos</span>
          </button>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`flex flex-col items-center py-1.5 px-3 transition-colors ${isSearchOpen ? 'text-[#262877]' : 'text-slate-400'}`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Buscar</span>
          </button>
          <button className="flex flex-col items-center py-1.5 px-3 text-slate-400 hover:text-slate-600 transition-colors relative">
            <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
            <span className="text-[10px] mt-0.5">Favoritos</span>
            {favorites.length > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center py-1.5 px-3 text-slate-400 hover:text-slate-600 transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Carrito</span>
            {cart.length > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 bg-[#262877] text-white text-[10px] rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}
