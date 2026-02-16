'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, X, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

const VALID_EMOTIONS = [
  'alegria', 'tristeza', 'ira', 'miedo', 'sorpresa',
  'desagrado', 'calma', 'ansiedad', 'esperanza', 'frustracion',
] as const;

const EMOTION_MAP: Record<string, string> = {
  alegria: 'joy',
  tristeza: 'sadness',
  ira: 'anger',
  miedo: 'fear',
  sorpresa: 'surprise',
  desagrado: 'disgust',
  calma: 'calm',
  ansiedad: 'anxiety',
  esperanza: 'hope',
  frustracion: 'frustration',
};

const REQUIRED_COLUMNS = ['fecha', 'animo'];
const ALL_COLUMNS = ['fecha', 'animo', 'energia', 'ansiedad', 'sueno', 'emocion', 'notas'];

interface ParsedRow {
  fecha: string;
  animo: number;
  energia?: number;
  ansiedad?: number;
  sueno?: number;
  emocion?: string;
  notas?: string;
}

interface RowError {
  row: number;
  message: string;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
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

function validateRow(headers: string[], values: string[], rowIndex: number): { data: ParsedRow | null; errors: RowError[] } {
  const errors: RowError[] = [];
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => {
    obj[h] = values[i] || '';
  });

  // Required: fecha
  if (!obj.fecha) {
    errors.push({ row: rowIndex, message: `Fila ${rowIndex}: falta "fecha"` });
  } else if (!/^\d{4}-\d{2}-\d{2}/.test(obj.fecha)) {
    errors.push({ row: rowIndex, message: `Fila ${rowIndex}: "fecha" debe ser YYYY-MM-DD` });
  }

  // Required: animo (1-10)
  const animo = parseInt(obj.animo);
  if (!obj.animo || isNaN(animo)) {
    errors.push({ row: rowIndex, message: `Fila ${rowIndex}: falta "animo" (1-10)` });
  } else if (animo < 1 || animo > 10) {
    errors.push({ row: rowIndex, message: `Fila ${rowIndex}: "animo" debe ser 1-10` });
  }

  // Optional numeric fields (1-10)
  const numericFields = ['energia', 'ansiedad', 'sueno'] as const;
  for (const field of numericFields) {
    if (obj[field]) {
      const val = parseInt(obj[field]);
      if (isNaN(val) || val < 1 || val > 10) {
        errors.push({ row: rowIndex, message: `Fila ${rowIndex}: "${field}" debe ser 1-10` });
      }
    }
  }

  // Optional: emocion
  if (obj.emocion && !VALID_EMOTIONS.includes(obj.emocion.toLowerCase() as typeof VALID_EMOTIONS[number])) {
    errors.push({ row: rowIndex, message: `Fila ${rowIndex}: "emocion" inválida. Valores: ${VALID_EMOTIONS.join(', ')}` });
  }

  if (errors.length > 0) return { data: null, errors };

  return {
    data: {
      fecha: obj.fecha,
      animo,
      energia: obj.energia ? parseInt(obj.energia) : undefined,
      ansiedad: obj.ansiedad ? parseInt(obj.ansiedad) : undefined,
      sueno: obj.sueno ? parseInt(obj.sueno) : undefined,
      emocion: obj.emocion ? EMOTION_MAP[obj.emocion.toLowerCase()] || obj.emocion : undefined,
      notas: obj.notas || undefined,
    },
    errors: [],
  };
}

function generateTemplateCSV() {
  const header = ALL_COLUMNS.join(',');
  const example1 = '2026-02-10,7,6,3,8,calma,Buen día';
  const example2 = '2026-02-11,4,3,7,5,ansiedad,Día difícil';
  return `${header}\n${example1}\n${example2}`;
}

export function CsvUploadWidget() {
  const t = useTranslations('csvUpload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<RowError[]>([]);
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

      // Check required columns exist
      const missingCols = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
      if (missingCols.length > 0) {
        setErrors([{ row: 0, message: `Columnas requeridas faltantes: ${missingCols.join(', ')}` }]);
        setParsedData([]);
        return;
      }

      const allErrors: RowError[] = [];
      const allData: ParsedRow[] = [];

      rows.forEach((row, i) => {
        if (row.every((cell) => cell === '')) return; // skip empty rows
        const { data, errors: rowErrors } = validateRow(headers, row, i + 2);
        if (data) allData.push(data);
        allErrors.push(...rowErrors);
      });

      setParsedData(allData);
      setErrors(allErrors);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) handleFile(file);
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
        setErrors([]);
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
    setErrors([]);
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
                <td className="px-3 py-1.5">YYYY-MM-DD</td>
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
                <td className="px-3 py-1.5 text-[10px]">alegria, tristeza, ira, miedo, sorpresa, desagrado, calma, ansiedad, esperanza, frustracion</td>
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
              accept=".csv"
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

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-red-400">
              <AlertCircle className="w-4 h-4" />
              {t('validationErrors')}
            </div>
            {errors.slice(0, 10).map((err, i) => (
              <p key={i} className="text-xs text-red-300/80 pl-6">{err.message}</p>
            ))}
            {errors.length > 10 && (
              <p className="text-xs text-red-300/60 pl-6">...y {errors.length - 10} errores más</p>
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
