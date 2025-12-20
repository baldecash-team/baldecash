'use client';

import React, { useEffect, useState } from 'react';
import { Button, Tooltip, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { Coins, TrendingUp, Clock, FileCode } from 'lucide-react';

interface TokenUsageEntry {
  promptNumber: string;
  section: string;
  timestamp: string;
  estimatedTokens: {
    input: number;
    output: number;
    total: number;
  };
  filesGenerated: number;
  componentsCreated: string[];
}

interface TokenUsageData {
  iterations: TokenUsageEntry[];
  totalTokensUsed: number;
}

interface TokenCounterProps {
  sectionId: string;
  version: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TokenCounter: React.FC<TokenCounterProps> = ({ sectionId, version }) => {
  const [tokenData, setTokenData] = useState<TokenUsageData | null>(null);
  const [sectionData, setSectionData] = useState<TokenUsageEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const response = await fetch(`/prototipos/${version}/token-usage.json`);
        if (response.ok) {
          const data: TokenUsageData = await response.json();
          setTokenData(data);

          // Find the latest entry for this section
          const promptNumber = sectionId.replace('PROMPT_', '');
          const sectionEntries = data.iterations.filter(
            (entry) => entry.promptNumber === promptNumber
          );
          if (sectionEntries.length > 0) {
            setSectionData(sectionEntries[sectionEntries.length - 1]);
          }
        }
      } catch {
        // Token usage file might not exist yet
        console.log('Token usage data not available yet');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenData();
  }, [sectionId, version]);

  const totalTokens = tokenData?.totalTokensUsed || 0;
  const sectionTokens = sectionData?.estimatedTokens.total || 0;

  return (
    <Popover placement="left">
      <PopoverTrigger>
        <Button
          isIconOnly
          variant="flat"
          className="bg-amber-500 text-white hover:bg-amber-600 cursor-pointer shadow-lg"
          aria-label="Token usage"
        >
          <Coins className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-2 border-b pb-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <span className="font-semibold">Token Usage</span>
          </div>

          {isLoading ? (
            <div className="text-sm text-neutral-500 py-2">Cargando...</div>
          ) : !tokenData ? (
            <div className="text-sm text-neutral-500 py-2">
              Sin datos de tokens aún.
              <br />
              <span className="text-xs">Ejecuta /iterar para generar datos.</span>
            </div>
          ) : (
            <>
              {/* Total tokens */}
              <div className="bg-amber-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Total acumulado</span>
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  {formatNumber(totalTokens)}
                </p>
                <p className="text-xs text-neutral-500">tokens</p>
              </div>

              {/* Section tokens */}
              {sectionData && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileCode className="w-4 h-4 text-[#4654CD]" />
                    Esta sección ({sectionId})
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-neutral-50 rounded p-2">
                      <p className="text-xs text-neutral-500">Input</p>
                      <p className="font-semibold text-sm">
                        {formatNumber(sectionData.estimatedTokens.input)}
                      </p>
                    </div>
                    <div className="bg-neutral-50 rounded p-2">
                      <p className="text-xs text-neutral-500">Output</p>
                      <p className="font-semibold text-sm">
                        {formatNumber(sectionData.estimatedTokens.output)}
                      </p>
                    </div>
                    <div className="bg-[#4654CD]/10 rounded p-2">
                      <p className="text-xs text-neutral-500">Total</p>
                      <p className="font-semibold text-sm text-[#4654CD]">
                        {formatNumber(sectionData.estimatedTokens.total)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-neutral-500 mt-2">
                    <Clock className="w-3 h-3" />
                    <span>Última iteración: {formatDate(sectionData.timestamp)}</span>
                  </div>

                  <div className="text-xs text-neutral-500">
                    {sectionData.filesGenerated} archivos generados
                  </div>
                </div>
              )}

              {/* Iterations count */}
              <div className="text-xs text-neutral-400 border-t pt-2 mt-2">
                {tokenData.iterations.length} iteraciones registradas
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TokenCounter;
