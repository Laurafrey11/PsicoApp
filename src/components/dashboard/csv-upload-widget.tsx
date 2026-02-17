'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, X, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

const EMOTION_MAP: Record<string, string> = {
  // Spanish
  alegria: 'joy', alegría: 'joy', felicidad: 'joy', feliz: 'joy', contento: 'joy', contenta: 'joy',
  tristeza: 'sadness', triste: 'sadness',
  ira: 'anger', enojo: 'anger', bronca: 'anger', rabia: 'anger', enojado: 'anger', enojada: 'anger',
  miedo: 'fear', temor: 'fear',
  sorpresa: 'surprise', sorprendido: 'surprise', sorprendida: 'surprise',
  desagrado: 'disgust', asco: 'disgust',
  calma: 'calm', calmo: 'calm', tranquilo: 'calm', tranquila: 'calm', tranquilidad: 'calm',
  ansiedad: 'anxiety', ansioso: 'anxiety', ansiosa: 'anxiety', nervioso: 'anxiety', nerviosa: 'anxiety',
  esperanza: 'hope',
  frustracion: 'frustration', frustración: 'frustration', frustrado: 'frustration', frustrada: 'frustration',
  // English
  joy: 'joy', happy: 'joy', happiness: 'joy',
  sadness: 'sadness', sad: 'sadness',
  anger: 'anger', angry: 'anger',
  fear: 'fear', afraid: 'fear', scared: 'fear',
  surprise: 'surprise', surprised: 'surprise',
  disgust: 'disgust', disgusted: 'disgust',
  calm: 'calm', peaceful: 'calm',
  anxiety: 'anxiety', anxious: 'anxiety', nervous: 'anxiety',
  hope: 'hope', hopeful: 'hope',
  frustration: 'frustration', frustrated: 'frustration',
};

// Flexible column name mapping
const COLUMN_MAP: Record<string, string> = {
  fecha: 'fecha', date: 'fecha', dia: 'fecha', día: 'fecha',
  animo: 'animo', ánimo: 'animo', mood: 'animo', estado: 'animo', 'mood_score': 'animo', 'estado de animo': 'animo', 'estado de ánimo': 'animo',
  energia: 'energia', energía: 'energia', energy: 'energia', 'energy_level': 'energia',
  ansiedad: 'ansiedad', anxiety: 'ansiedad', 'anxiety_level': 'ansiedad',
  sueno: 'sueno', sueño: 'sueno', sleep: 'sueno', 'sleep_quality': 'sueno',
  emocion: 'emocion', emoción: 'emocion', emotion: 'emocion', 'primary_emotion': 'emocion',
  notas: 'notas', notes: 'notas', nota: 'notas', comentario: 'notas', comentarios: 'notas', observaciones: 'notas',
};

interface ParsedRow {
  fecha: string;
  animo: number;
  energia?: number;
  ansiedad?: number;
  sueno?: number;
  emocion?: string;
  notas?: string;
}

interface RowWarning {
  row: number;
  message: string;
}

/**
 * Tries to parse various date formats into YYYY-MM-DD.
 */
function parseDate(raw: string): string | null {
  if (!raw || raw.trim() === '') return null;
  const s = raw.trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  // MM/DD/YYYY (fallback)
  const mdyMatch = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  // Try native Date parsing as fallback (handles "Feb 10, 2026", etc.)
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];

  return null;
}

/**
 * Tries to extract a number from text. Handles decimals, commas, text around numbers.
 * Clamps to 1-10 range.
 */
function parseNumber(raw: string): number | null {
  if (!raw || raw.trim() === '') return null;
  // Extract first number from string
  const match = raw.replace(',', '.').match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  let num = Math.round(parseFloat(match[0]));
  // Clamp to 1-10
  num = Math.max(1, Math.min(10, num));
  return num;
}

/**
 * Fuzzy match emotion from text.
 */
function parseEmotion(raw: string): string | null {
  if (!raw || raw.trim() === '') return null;
  const normalized = raw.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove accents for matching

  // Direct match
  if (EMOTION_MAP[normalized]) return EMOTION_MAP[normalized];

  // Try with accents
  const withAccents = raw.trim().toLowerCase();
  if (EMOTION_MAP[withAccents]) return EMOTION_MAP[withAccents];

  // Partial match
  for (const [key, value] of Object.entries(EMOTION_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return null;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  // Detect separator (comma, semicolon, tab)
  const firstLine = lines[0];
  let separator = ',';
  if (firstLine.includes('\t') && !firstLine.includes(',')) separator = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) separator = ';';

  const headers = firstLine.split(separator).map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
  const rows = lines.slice(1).map((line) => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });

  return { headers, rows };
}

function processRow(headers: string[], values: string[], rowIndex: number): { data: ParsedRow | null; warnings: RowWarning[] } {
  const warnings: RowWarning[] = [];

  // Map columns flexibly
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => {
    const mapped = COLUMN_MAP[h.replace(/['"]/g, '').trim()];
    if (mapped) {
      obj[mapped] = (values[i] || '').replace(/^["']|["']$/g, '');
    }
  });

  // Parse date (required)
  const fecha = parseDate(obj.fecha || '');
  if (!fecha) {
    warnings.push({ row: rowIndex, message: `Fila ${rowIndex}: fecha no reconocida ("${obj.fecha || ''}"), fila omitida` });
    return { data: null, warnings };
  }

  // Parse animo (required)
  const animo = parseNumber(obj.animo || '');
  if (animo === null) {
    warnings.push({ row: rowIndex, message: `Fila ${rowIndex}: ánimo no reconocido ("${obj.animo || ''}"), fila omitida` });
    return { data: null, warnings };
  }

  // Parse optional fields (tolerant)
  const energia = parseNumber(obj.energia || '');
  const ansiedad = parseNumber(obj.ansiedad || '');
  const sueno = parseNumber(obj.sueno || '');

  // Parse emotion (fuzzy)
  let emocion: string | undefined;
  if (obj.emocion) {
    const mapped = parseEmotion(obj.emocion);
    if (mapped) {
      emocion = mapped;
    } else {
      warnings.push({ row: rowIndex, message: `Fila ${rowIndex}: emoción "${obj.emocion}" no reconocida, se omite` });
    }
  }

  return {
    data: {
      fecha,
      animo,
      energia: energia ?? undefined,
      ansiedad: ansiedad ?? undefined,
      sueno: sueno ?? undefined,
      emocion,
      notas: obj.notas || undefined,
    },
    warnings,
  };
}

function generateTemplateCSV() {
  const header = 'fecha,animo,energia,ansiedad,sueno,emocion,notas';
  const example1 = '2026-02-10,7,6,3,8,calma,Buen día';
  const example2 = '2026-02-11,4,3,7,5,ansiedad,Día difícil';
  return `${header}\n${example1}\n${example2}`;
}

export function CsvUploadWidget() {
  const t = useTranslations('csvUpload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [warnings, setWarnings] = useState<RowWarning[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setResult(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);

      if (headers.length === 0) {
        setWarnings([{ row: 0, message: 'Archivo vacío o sin encabezados' }]);
        setParsedData([]);
        return;
      }

      // Map headers and check we have at least fecha + animo
      const mappedHeaders = headers.map((h) => COLUMN_MAP[h.trim()] || h);
      const hasFecha = mappedHeaders.includes('fecha');
      const hasAnimo = mappedHeaders.includes('animo');

      if (!hasFecha || !hasAnimo) {
        const missing = [];
        if (!hasFecha) missing.push('fecha/date');
        if (!hasAnimo) missing.push('animo/mood');
        setWarnings([{ row: 0, message: `Columnas requeridas faltantes: ${missing.join(', ')}. Columnas encontradas: ${headers.join(', ')}` }]);
        setParsedData([]);
        return;
      }

      const allWarnings: RowWarning[] = [];
      const allData: ParsedRow[] = [];

      rows.forEach((row, i) => {
        if (row.every((cell) => cell === '')) return; // skip empty rows
        const { data, warnings: rowWarnings } = processRow(headers, row, i + 2);
        if (data) allData.push(data);
        allWarnings.push(...rowWarnings);
      });

      setParsedData(allData);
      setWarnings(allWarnings);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleImport = useCallback(async () => {
    if (parsedData.length === 0) return;
    setImporting(true);
    setResult(null);

    try {
      const res = await fetch('/api/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: parsedData }),
      });
      const data = await res.json();
      setResult(data);
      if (data.imported > 0) {
        setParsedData([]);
        setFileName(null);
        setWarnings([]);
      }
    } catch {
      setResult({ imported: 0, errors: ['Error de conexión'] });
    } finally {
      setImporting(false);
    }
  }, [parsedData]);

  const handleDownloadTemplate = useCallback(() => {
    const csv = generateTemplateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla-mood.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleClear = useCallback(() => {
    setParsedData([]);
    setWarnings([]);
    setFileName(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-500" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-400">{t('description')}</p>

        {/* Column format table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-zinc-400 border border-zinc-800 rounded-lg">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-3 py-2 text-left text-zinc-300">{t('column')}</th>
                <th className="px-3 py-2 text-left text-zinc-300">{t('type')}</th>
                <th className="px-3 py-2 text-left text-zinc-300">{t('required')}</th>
                <th className="px-3 py-2 text-left text-zinc-300">{t('values')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50">
                <td className="px-3 py-1.5 font-mono text-cyan-400">fecha</td>
                <td className="px-3 py-1.5">texto</td>
                <td className="px-3 py-1.5 text-emerald-400">sí</td>
                <td className="px-3 py-1.5">YYYY-MM-DD, DD/MM/YYYY, etc.</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="px-3 py-1.5 font-mono text-cyan-400">animo</td>
                <td className="px-3 py-1.5">número</td>
                <td className="px-3 py-1.5 text-emerald-400">sí</td>
                <td className="px-3 py-1.5">1 a 10</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="px-3 py-1.5 font-mono text-cyan-400">energia</td>
                <td className="px-3 py-1.5">número</td>
                <td className="px-3 py-1.5 text-zinc-500">no</td>
                <td className="px-3 py-1.5">1 a 10</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="px-3 py-1.5 font-mono text-cyan-400">ansiedad</td>
                <td className="px-3 py-1.5">número</td>
                <td className="px-3 py-1.5 text-zinc-500">no</td>
                <td className="px-3 py-1.5">1 a 10</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="px-3 py-1.5 font-mono text-cyan-400">sueno</td>
                <td className="px-3 py-1.5">número</td>
                <td className="px-3 py-1.5 text-zinc-500">no</td>
                <td className="px-3 py-1.5">1 a 10</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="px-3 py-1.5 font-mono text-cyan-400">emocion</td>
                <td className="px-3 py-1.5">texto</td>
                <td className="px-3 py-1.5 text-zinc-500">no</td>
                <td className="px-3 py-1.5 text-[10px]">alegria, tristeza, ira, miedo, calma, ansiedad, etc.</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 font-mono text-cyan-400">notas</td>
                <td className="px-3 py-1.5">texto</td>
                <td className="px-3 py-1.5 text-zinc-500">no</td>
                <td className="px-3 py-1.5">texto libre</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Download template */}
        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 text-sm text-cyan-500 hover:text-cyan-400 transition-colors"
        >
          <Download className="w-4 h-4" />
          {t('downloadTemplate')}
        </button>

        {/* Dropzone */}
        {!fileName && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500/50 transition-colors"
          >
            <Upload className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">{t('dropzone')}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        )}

        {/* File name + clear */}
        {fileName && (
          <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <FileText className="w-4 h-4 text-cyan-500" />
              {fileName}
            </div>
            <button onClick={handleClear} className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Warnings (not blocking) */}
        {warnings.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
              <AlertCircle className="w-4 h-4" />
              Advertencias ({warnings.length})
            </div>
            {warnings.slice(0, 10).map((w, i) => (
              <p key={i} className="text-xs text-amber-300/80 pl-6">{w.message}</p>
            ))}
            {warnings.length > 10 && (
              <p className="text-xs text-amber-300/60 pl-6">...y {warnings.length - 10} más</p>
            )}
          </div>
        )}

        {/* Preview */}
        {parsedData.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-300">
              {t('preview')}: {parsedData.length} {parsedData.length === 1 ? 'registro' : 'registros'}
            </p>
            <div className="overflow-x-auto max-h-48 overflow-y-auto">
              <table className="w-full text-xs text-zinc-400 border border-zinc-800 rounded-lg">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 sticky top-0">
                    <th className="px-2 py-1.5 text-left">fecha</th>
                    <th className="px-2 py-1.5 text-left">animo</th>
                    <th className="px-2 py-1.5 text-left">energia</th>
                    <th className="px-2 py-1.5 text-left">ansiedad</th>
                    <th className="px-2 py-1.5 text-left">sueno</th>
                    <th className="px-2 py-1.5 text-left">emocion</th>
                    <th className="px-2 py-1.5 text-left">notas</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-b border-zinc-800/50">
                      <td className="px-2 py-1">{row.fecha}</td>
                      <td className="px-2 py-1">{row.animo}</td>
                      <td className="px-2 py-1">{row.energia ?? '-'}</td>
                      <td className="px-2 py-1">{row.ansiedad ?? '-'}</td>
                      <td className="px-2 py-1">{row.sueno ?? '-'}</td>
                      <td className="px-2 py-1">{row.emocion ?? '-'}</td>
                      <td className="px-2 py-1 max-w-[200px] truncate">{row.notas ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedData.length > 20 && (
              <p className="text-xs text-zinc-500">Mostrando 20 de {parsedData.length} registros</p>
            )}

            <Button
              onClick={handleImport}
              isLoading={importing}
              className="w-full"
            >
              {importing ? t('importing') : `${t('import')} (${parsedData.length})`}
            </Button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`rounded-lg p-3 ${result.imported > 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            <div className="flex items-center gap-2 text-sm font-medium">
              {result.imported > 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">{t('success', { count: result.imported })}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">{t('error')}</span>
                </>
              )}
            </div>
            {result.errors?.length > 0 && (
              <div className="mt-2 space-y-1">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-300/80 pl-6">{err}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
