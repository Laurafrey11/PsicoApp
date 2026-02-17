'use client';

import { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { CsvUploadWidget } from '@/components/dashboard/csv-upload-widget';
import { cn } from '@/lib/utils';

export function CsvUploadSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full flex items-center justify-between p-5 transition-colors',
            open ? 'bg-cyan-500/5 border-b border-zinc-800' : 'bg-zinc-900/30 hover:bg-zinc-900/50'
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
              open ? 'bg-cyan-500/20' : 'bg-zinc-800'
            )}>
              <FileText className={cn('w-5 h-5', open ? 'text-cyan-500' : 'text-zinc-500')} />
            </div>
            <div className="text-left">
              <p className={cn('font-medium', open ? 'text-cyan-300' : 'text-zinc-300')}>
                Importar desde CSV
              </p>
              <p className="text-xs text-zinc-500">Cargá registros de ánimo y estrés desde un archivo</p>
            </div>
          </div>
          <ChevronDown className={cn(
            'w-5 h-5 text-zinc-500 transition-transform',
            open && 'rotate-180'
          )} />
        </button>

        {open && (
          <div className="p-5 bg-zinc-950/30 animate-fade-in">
            <CsvUploadWidget />
          </div>
        )}
      </div>
    </div>
  );
}
