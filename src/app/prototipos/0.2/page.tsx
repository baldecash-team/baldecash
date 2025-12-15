"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Card, CardBody, Button, Chip, useDisclosure } from "@nextui-org/react";
import { HeroSection } from "./components/landing/hero/HeroSection";

/**
 * BaldeCash Hero Section 2.0 - Preview & Comparison Page
 *
 * Permite comparar y visualizar las diferentes versiones de cada componente
 */

export default function HeroSectionPreview() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [profileVersion, setProfileVersion] = useState<1 | 2 | 3>(1);
  const [institutionalVersion, setInstitutionalVersion] = useState<1 | 2 | 3>(1);
  const [socialProofVersion, setSocialProofVersion] = useState<1 | 2 | 3>(1);
  const [ctaVersion, setCtaVersion] = useState<1 | 2 | 3>(1);

  // Sample institution data
  const sampleInstitution = {
    name: "UPN",
    logo: "/logos/upn.png",
    hasSpecialConditions: true,
    customMessage: "Bienvenido estudiante UPN - Tienes condiciones especiales",
  };

  // Sample social proof data
  const sampleSocialProof = {
    studentCount: 5247,
    institutions: [
      { name: "UPN", logo: "/logos/upn.png", featured: true },
      { name: "UPC", logo: "/logos/upc.png", featured: true },
      { name: "USIL", logo: "/logos/usil.png", featured: true },
      { name: "UCAL", logo: "/logos/ucal.png", featured: true },
      { name: "UAP", logo: "/logos/uap.png", featured: false },
      { name: "UCSUR", logo: "/logos/ucsur.png", featured: false },
      { name: "UTP", logo: "/logos/utp.png", featured: false },
      { name: "CIBERTEC", logo: "/logos/cibertec.png", featured: false },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Floating Config Button */}
      <button
        onClick={onOpen}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-r from-[#4654CD] to-[#03DBD0] text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
        aria-label="Configurar versiones"
      >
        <svg
          className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Version Control Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="full"
        backdrop="blur"
        scrollBehavior="inside"
        hideCloseButton={true}
        isDismissable={false}
        classNames={{
          backdrop: "bg-[#000000]/80 backdrop-blur-md",
          base: "bg-[#1a1a1a] border-0 m-0 rounded-none h-full max-h-full",
          header: "border-b border-[#333333]",
          body: "bg-[#1a1a1a]",
          wrapper: "items-center justify-center",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2
                      className="text-2xl font-bold text-white"
                      style={{ fontFamily: "'Baloo 2', cursive" }}
                    >
                      BaldeCash Hero Section 2.0
                    </h2>
                    <p className="text-sm text-gray-300 font-normal" style={{ fontFamily: "'Asap', sans-serif" }}>
                      Selecciona las versiones de cada componente
                    </p>
                  </div>
                  <Chip
                    className="bg-gradient-to-r from-[#4654CD] to-[#03DBD0] text-white font-semibold"
                    size="lg"
                  >
                    Versión 0.2
                  </Chip>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                {/* Version Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profile Identification */}
            <Card className="bg-[#262626] border border-[#333333]">
              <CardBody className="p-3">
                <p className="text-xs font-semibold text-gray-300 mb-2">
                  Profile Identification
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className={
                      profileVersion === 1
                        ? "bg-[#4654CD] text-white"
                        : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
                    }
                    onPress={() => setProfileVersion(1)}
                  >
                    V1
                  </Button>
                  <Button
                    size="sm"
                    className={
                      profileVersion === 2
                        ? "bg-[#4654CD] text-white"
                        : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
                    }
                    onPress={() => setProfileVersion(2)}
                  >
                    V2
                  </Button>
                  <Button
                    size="sm"
                    className={
                      profileVersion === 3
                        ? "bg-[#4654CD] text-white"
                        : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
                    }
                    onPress={() => setProfileVersion(3)}
                  >
                    V3
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Institutional Banner */}
            <Card className="bg-[#262626] border border-[#333333]">
              <CardBody className="p-3">
                <p className="text-xs font-semibold text-gray-300 mb-2">
                  Institutional Banner
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className={
                      institutionalVersion === 1
                        ? "bg-[#4654CD] text-white"
                        : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
                    }
                    onPress={() => setInstitutionalVersion(1)}
                  >
                    V1
                  </Button>
                  <Button
                    size="sm"
                    className={
                      institutionalVersion === 2
                        ? "bg-[#4654CD] text-white"
                        : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
                    }
                    onPress={() => setInstitutionalVersion(2)}
                  >
                    V2
                  </Button>
                  <Button
                    size="sm"
                    className={
                      institutionalVersion === 3
                        ? "bg-[#4654CD] text-white"
                        : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
                    }
                    onPress={() => setInstitutionalVersion(3)}
                  >
                    V3
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Social Proof */}
            <Card className="bg-[#262626] border border-[#333333]">
              <CardBody className="p-3">
                <p className="text-xs font-semibold text-gray-300 mb-2">Social Proof</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className={
                      socialProofVersion === 1
                        ? "bg-[#4654CD] text-white"
                        : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
                    }
                    onPress={() => setSocialProofVersion(1)}
                  >
                    V1
                  </Button>
                  <Button
                    size="sm"
                    className={
                      socialProofVersion === 2
                        ? "bg-[#4654CD] text-white"
                        : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
                    }
                    onPress={() => setSocialProofVersion(2)}
                  >
                    V2
                  </Button>
                  <Button
                    size="sm"
                    className={
                      socialProofVersion === 3
                        ? "bg-[#4654CD] text-white"
                        : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
                    }
                    onPress={() => setSocialProofVersion(3)}
                  >
                    V3
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* CTA */}
            <Card className="bg-[#262626] border border-[#333333]">
              <CardBody className="p-3">
                <p className="text-xs font-semibold text-gray-300 mb-2">Hero CTA</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className={
                      ctaVersion === 1
                        ? "bg-[#4654CD] text-white"
                        : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
                    }
                    onPress={() => setCtaVersion(1)}
                  >
                    V1
                  </Button>
                  <Button
                    size="sm"
                    className={
                      ctaVersion === 2
                        ? "bg-[#4654CD] text-white"
                        : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
                    }
                    onPress={() => setCtaVersion(2)}
                  >
                    V2
                  </Button>
                  <Button
                    size="sm"
                    className={
                      ctaVersion === 3
                        ? "bg-[#4654CD] text-white"
                        : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
                    }
                    onPress={() => setCtaVersion(3)}
                  >
                    V3
                  </Button>
                </div>
              </CardBody>
            </Card>
                </div>

                {/* Version Details in Modal */}
                <div className="mt-6 pt-6 border-t border-[#333333]">
                  <h3
                    className="text-lg font-bold text-white mb-4"
                    style={{ fontFamily: "'Baloo 2', cursive" }}
                  >
                    Características de cada versión
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Profile Identification Details */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-200 text-sm">Profile Identification</h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="inline-block bg-[#4654CD] text-white px-2 py-0.5 rounded text-xs font-medium mb-1">V1</span>
                          <p className="text-gray-400">Modal centrado, máxima tasa de respuesta</p>
                        </div>
                        <div>
                          <span className="inline-block bg-[#4654CD] text-white px-2 py-0.5 rounded text-xs font-medium mb-1">V2</span>
                          <p className="text-gray-400">Cards integradas, mantiene flujo visual</p>
                        </div>
                        <div>
                          <span className="inline-block bg-[#4654CD] text-white px-2 py-0.5 rounded text-xs font-medium mb-1">V3</span>
                          <p className="text-gray-400">Banner sticky superior, dismissible</p>
                        </div>
                      </div>
                    </div>

                    {/* Institutional Banner Details */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-200 text-sm">Institutional Banner</h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="inline-block bg-[#4654CD] text-white px-2 py-0.5 rounded text-xs font-medium mb-1">V1</span>
                          <p className="text-gray-400">Banner horizontal, máxima visibilidad</p>
                        </div>
                        <div>
                          <span className="inline-block bg-[#4654CD] text-white px-2 py-0.5 rounded text-xs font-medium mb-1">V2</span>
                          <p className="text-gray-400">Chip flotante, sutil pero presente</p>
                        </div>
                        <div>
                          <span className="inline-block bg-[#4654CD] text-white px-2 py-0.5 rounded text-xs font-medium mb-1">V3</span>
                          <p className="text-gray-400">Sección dedicada en hero</p>
                        </div>
                      </div>
                    </div>

                    {/* Social Proof Details */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-200 text-sm">Social Proof</h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="inline-block bg-[#4654CD] text-white px-2 py-0.5 rounded text-xs font-medium mb-1">V1</span>
                          <p className="text-gray-400">Logos en movimiento continuo</p>
                        </div>
                        <div>
                          <span className="inline-block bg-[#4654CD] text-white px-2 py-0.5 rounded text-xs font-medium mb-1">V2</span>
                          <p className="text-gray-400">Todos los logos visibles</p>
                        </div>
                        <div>
                          <span className="inline-block bg-[#4654CD] text-white px-2 py-0.5 rounded text-xs font-medium mb-1">V3</span>
                          <p className="text-gray-400">Contador + logos destacados</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA Details */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-200 text-sm">Hero CTA</h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="inline-block bg-[#4654CD] text-white px-2 py-0.5 rounded text-xs font-medium mb-1">V1</span>
                          <p className="text-gray-400">Acción directa: ver laptops</p>
                        </div>
                        <div>
                          <span className="inline-block bg-[#4654CD] text-white px-2 py-0.5 rounded text-xs font-medium mb-1">V2</span>
                          <p className="text-gray-400">Enfoque en precio: desde S/49/mes</p>
                        </div>
                        <div>
                          <span className="inline-block bg-[#4654CD] text-white px-2 py-0.5 rounded text-xs font-medium mb-1">V3</span>
                          <p className="text-gray-400">Capacidad de crédito</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Preview Section */}
      <div className="w-full">
        <div className="w-full">
          <div className="bg-white">
              <HeroSection
                profileIdentificationVersion={profileVersion}
                institutionalBannerVersion={institutionalVersion}
                socialProofVersion={socialProofVersion}
                ctaVersion={ctaVersion}
                institution={sampleInstitution}
                socialProof={sampleSocialProof}
                onProfileResponse={(isStudent) => {
                  console.log("User is student:", isStudent);
                }}
              />
          </div>
        </div>
      </div>

    </div>
  );
}
