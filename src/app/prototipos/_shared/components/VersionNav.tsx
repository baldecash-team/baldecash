"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Home, Layers } from "lucide-react";
import { getAdjacentVersions, getVersionByNumber, getActiveVersions, getVersionProgress } from "../../_registry";

interface VersionNavProps {
  currentVersion: string;
  showSections?: boolean;
}

export function VersionNav({ currentVersion, showSections = true }: VersionNavProps) {
  const pathname = usePathname();
  const { prev, next } = getAdjacentVersions(currentVersion);
  const current = getVersionByNumber(currentVersion);
  const progress = current ? getVersionProgress(current) : 0;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="container mx-auto px-4">
        {/* Main nav row */}
        <div className="flex items-center justify-between h-14">
          {/* Left: Home + Version */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
              title="Volver al Home"
            >
              <Home className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-medium">v{currentVersion}</span>
              {current?.badge && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  {current.badge}
                </span>
              )}
            </div>
          </div>

          {/* Center: Version selector */}
          <div className="hidden md:flex items-center gap-1">
            <VersionSelector currentVersion={currentVersion} />
          </div>

          {/* Right: Prev/Next navigation */}
          <div className="flex items-center gap-2">
            {prev ? (
              <Link
                href={`/prototipos/${prev.version}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm text-slate-300 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">v{prev.version}</span>
              </Link>
            ) : (
              <div className="w-20" />
            )}

            {next ? (
              <Link
                href={`/prototipos/${next.version}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm text-slate-300 hover:text-white"
              >
                <span className="hidden sm:inline">v{next.version}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="w-20" />
            )}
          </div>
        </div>

        {/* Sections row (optional) */}
        {showSections && current?.sections && current.sections.length > 0 && (
          <div className="flex items-center gap-4 pb-3 overflow-x-auto">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Progreso:</span>
              <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span>{progress}%</span>
            </div>

            <div className="h-4 w-px bg-slate-700" />

            <div className="flex items-center gap-2">
              {current.sections.map((section) => {
                const isActive = pathname.includes(section.path);
                return (
                  <Link
                    key={section.id}
                    href={section.path}
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium transition-colors
                      ${isActive
                        ? 'bg-emerald-500 text-white'
                        : section.status === 'done'
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : section.status === 'in_progress'
                            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                            : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                      }
                    `}
                  >
                    {section.name}
                    {section.status === 'done' && ' ✓'}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function VersionSelector({ currentVersion }: { currentVersion: string }) {
  const versions = getActiveVersions();

  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
      {versions.map((v) => {
        const isActive = v.version === currentVersion;
        return (
          <Link
            key={v.version}
            href={`/prototipos/${v.version}`}
            className={`
              px-3 py-1 rounded-md text-sm font-medium transition-colors
              ${isActive
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }
            `}
          >
            {v.version}
          </Link>
        );
      })}
    </div>
  );
}

export default VersionNav;
