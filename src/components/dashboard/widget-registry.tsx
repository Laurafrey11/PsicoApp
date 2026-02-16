'use client';

import { Heart, MessageCircle, TrendingUp, Brain, Meh, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { WellnessIndicators } from './wellness-indicators';

export interface WidgetDefinition {
  id: string;
  titleKey: string;
  component: React.ComponentType;
}

function QuickActionsWidget() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Link href="/mood">
        <Card className="group cursor-pointer transition-all hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
              <Heart className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h3 className="font-medium text-zinc-100">Registrar estado</h3>
              <p className="text-sm text-zinc-500">¿Cómo te sentís hoy?</p>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/chat">
        <Card className="group cursor-pointer transition-all hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
              <MessageCircle className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h3 className="font-medium text-zinc-100">Asistente</h3>
              <p className="text-sm text-zinc-500">Escribí cómo te sentís...</p>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/analytics">
        <Card className="group cursor-pointer transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium text-zinc-100">Análisis</h3>
              <p className="text-sm text-zinc-500">Tendencias</p>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/stress">
        <Card className="group cursor-pointer transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <Brain className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="font-medium text-zinc-100">Estrés</h3>
              <p className="text-sm text-zinc-500">Registrar episodio</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

function WellnessWidget() {
  return <WellnessIndicators />;
}

function TodayMoodWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de hoy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Meh className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500 mb-4">Aún no hay datos. ¡Comienza registrando tu estado de ánimo!</p>
          <Link href="/mood" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition-colors">
            Registrar ahora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function WeeklyOverviewWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500 mb-4">Aún no hay datos. ¡Comienza registrando tu estado de ánimo!</p>
          <Link href="/mood" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition-colors">
            Comenzar a registrar
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function CalendlyWidget() {
  return (
    <Card className="border-cyan-500/20">
      <CardContent className="py-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-cyan-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-zinc-100">Agendar turno</h3>
            <p className="text-sm text-zinc-500">Coordiná una sesión con la profesional</p>
          </div>
          <a
            href="https://calendly.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
          >
            Agendar
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  { id: 'quickActions', titleKey: 'dashboard.quickActions', component: QuickActionsWidget },
  { id: 'wellness', titleKey: 'dashboard.wellness', component: WellnessWidget },
  { id: 'todayMood', titleKey: 'dashboard.todayMood', component: TodayMoodWidget },
  { id: 'weeklyOverview', titleKey: 'dashboard.weeklyOverview', component: WeeklyOverviewWidget },
  { id: 'calendly', titleKey: 'dashboard.calendly', component: CalendlyWidget },
];

export const DEFAULT_LAYOUT: string[] = [
  'quickActions',
  'wellness',
  'todayMood',
  'weeklyOverview',
  'calendly',
];
