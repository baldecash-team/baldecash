"use client";

import { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Link,
} from "@nextui-org/react";
import type { MenuItem, CTAButton } from "./types";

/**
 * Navigation Component
 *
 * Navbar principal con menú responsivo
 * - Logo BaldeCash a la izquierda
 * - Menú items centrados/derecha
 * - "Zona Estudiantes" como CTA destacado
 * - Hamburger menu en móvil
 *
 * Estado: ✅ DEFINIDO - 1 versión final
 */

const menuItems: MenuItem[] = [
  { label: "Conócenos", href: "/conocenos" },
  { label: "Productos", href: "/productos" },
  { label: "Ofertas", href: "/ofertas" },
  { label: "FAQ", href: "/faq" },
];

const loginCTA: CTAButton = {
  label: "Zona Estudiantes",
  href: "/zona-estudiantes",
  isButton: true,
};

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="xl"
      className="bg-white shadow-sm"
      style={{ fontFamily: "'Asap', sans-serif" }}
    >
      {/* Mobile menu toggle */}
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          className="sm:hidden text-[#4654CD]"
        />
        <NavbarBrand>
          <Link href="/" className="flex items-center">
            <div className="bg-[#4247d2] px-4 py-2 rounded-lg">
              <span
                className="text-white font-bold text-lg"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                BaldeCash
              </span>
            </div>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop menu */}
      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.href}>
            <Link
              color="foreground"
              href={item.href}
              className="text-[#737373] hover:text-[#4654CD] transition-colors font-medium"
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* CTA Button */}
      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            as={Link}
            href={loginCTA.href}
            className="bg-[#4654CD] text-white font-semibold hover:bg-[#3544A8] transition-colors"
            size="md"
          >
            {loginCTA.label}
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Mobile menu */}
      <NavbarMenu className="pt-6">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.href}-${index}`}>
            <Link
              color="foreground"
              className="w-full text-[#737373] hover:text-[#4654CD] py-2 text-lg"
              href={item.href}
              size="lg"
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem className="mt-4">
          <Button
            as={Link}
            href={loginCTA.href}
            className="w-full bg-[#4654CD] text-white font-semibold"
            size="lg"
          >
            {loginCTA.label}
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
};
