"use client";

import Link from "next/link";
import { Card, CardBody } from "@nextui-org/react";
import { CheckCircle2, Clock, AlertCircle, Layers, Monitor, ShoppingCart, FileText, Search, HelpCircle, AlertTriangle, Trophy } from "lucide-react";
import { SectionStatus } from "../../_registry";

const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  hero: Monitor,
  catalogo: ShoppingCart,
  detalle: Search,
  comparador: Layers,
  quiz: HelpCircle,
  estados: AlertTriangle,
  wizard: FileText,
  resultados: Trophy,
};

const statusStyles = {
  pending: { icon: AlertCircle, color: "text-neutral-400", bg: "bg-neutral-200", label: "Pendiente" },
  in_progress: { icon: Clock, color: "text-[#03DBD0]", bg: "bg-[#03DBD0]/20", label: "En desarrollo" },
  done: { icon: CheckCircle2, color: "text-[#4654CD]", bg: "bg-[#4654CD]/20", label: "Completado" },
};

interface SectionsGridProps {
  sections: SectionStatus[];
}

export function SectionsGrid({ sections }: SectionsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {sections.map((section) => {
        const IconComponent = sectionIcons[section.id] || Layers;
        const status = statusStyles[section.status];
        const StatusIcon = status.icon;
        const isClickable = section.status !== 'pending';

        const cardContent = (
          <Card
            className={`bg-white border transition-all duration-300 w-full h-full ${
              isClickable
                ? 'border-neutral-200 hover:border-[#4654CD] hover:scale-[1.02] cursor-pointer shadow-sm'
                : 'border-neutral-100 opacity-60'
            }`}
            isPressable={isClickable}
          >
            <CardBody className="p-4 flex flex-col">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg ${status.bg} flex items-center justify-center mb-3`}>
                <IconComponent className={`w-5 h-5 ${status.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-sm font-semibold text-neutral-900 mb-0.5">{section.name}</h3>
              <p className="text-neutral-400 text-xs mb-2">#{section.promptNumber}</p>

              {/* Status */}
              <div className="mt-auto flex items-center gap-1">
                <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                <span className={`text-xs ${status.color}`}>{status.label}</span>
              </div>
            </CardBody>
          </Card>
        );

        return isClickable ? (
          <Link key={section.id} href={section.path} className="block w-full h-full">
            {cardContent}
          </Link>
        ) : (
          <div key={section.id} className="w-full h-full">{cardContent}</div>
        );
      })}
    </div>
  );
}
