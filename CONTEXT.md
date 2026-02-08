# EGO-CORE: Bio-Hacking Emocional & Seguimiento Terapéutico

## Información del Proyecto
- **Nombre**: Ego-Core
- **Descripción**: Aplicación de bio-hacking emocional y seguimiento terapéutico con IA
- **Versión**: 0.1.0
- **Estado**: MVP Completo

---

## Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| Framework | Next.js (App Router) | 15.x |
| Lenguaje | TypeScript | 5.x |
| Auth & DB | Supabase (PostgreSQL + RLS) | - |
| IA | OpenAI API (GPT-4o) + Vercel AI SDK | - |
| UI | Tailwind CSS + Shadcn/UI + Lucide React | - |
| Gráficos | Recharts | - |
| i18n | next-intl | - |

---

## Arquitectura

### Estructura de Directorios
```
src/
├── app/
│   └── [locale]/          # Rutas internacionalizadas
│       ├── (auth)/        # Grupo de rutas de autenticación
│       ├── (dashboard)/   # Grupo de rutas protegidas
│       └── api/           # API Routes
├── components/
│   ├── ui/                # Componentes Shadcn/UI
│   └── features/          # Componentes por feature
├── lib/
│   ├── supabase/          # Cliente y helpers de Supabase
│   ├── openai/            # Cliente y utilidades de OpenAI
│   ├── utils/             # Utilidades generales
│   └── validators/        # Schemas Zod
├── hooks/                 # Custom hooks
├── types/                 # Tipos TypeScript globales
├── i18n/                  # Configuración de internacionalización
└── messages/              # Archivos de traducción (es.json, en.json)
```

### Decisiones de Arquitectura

1. **Row Level Security (RLS)**: Todas las tablas tienen RLS habilitado. Los usuarios solo acceden a sus propios datos.

2. **Anonimización de PII**: Middleware que detecta y reemplaza información personal identificable (nombres, teléfonos, direcciones) antes de enviar a OpenAI.

3. **Sistema de Memoria IA**:
   - **Corto plazo**: Ventana de últimos 15 mensajes
   - **Largo plazo**: Resúmenes (summaries) generados periódicamente

4. **Protocolo de Emergencia (Lockdown Mode)**:
   - Detección de keywords de riesgo suicida/autolesión
   - Bloqueo completo de UI
   - Botón prominente de llamada al profesional: `1167409207`
   - Logging de evento en `emergency_logs`

5. **Análisis de Mecanismos de Defensa**: La IA categoriza entradas según: proyección, negación, racionalización, desplazamiento, sublimación, etc.

---

## Esquema de Base de Datos

Ver archivo: `/supabase/schema.sql`

### Tablas Principales
- `profiles` - Perfiles de usuario
- `mood_entries` - Registros de estado de ánimo
- `stress_logs` - Logs de estrés con análisis de defensas
- `summaries` - Resúmenes de memoria a largo plazo
- `emergency_logs` - Registro de activaciones de Lockdown Mode

---

## Estado de Features

| Feature | Estado | Notas |
|---------|--------|-------|
| Setup Proyecto | ✅ Completado | Next.js 15 + dependencias instaladas |
| CONTEXT.md | ✅ Completado | Documentación inicial |
| Schema SQL | ✅ Completado | 6 tablas + funciones + RLS |
| i18n Base | ✅ Completado | ES + EN con next-intl |
| Tema Zen-Precision | ✅ Completado | CSS variables + utilidades |
| Landing Page | ✅ Completado | Página inicial con features |
| Clientes Supabase | ✅ Completado | Browser + Server + Middleware |
| Auth (Supabase) | ✅ Completado | SignIn, SignUp, SignOut, protección de rutas |
| Componentes UI | ✅ Completado | Button, Input, Card (Shadcn-style) |
| Dashboard Base | ✅ Completado | Layout con navegación, quick actions |
| Mood Tracker | ✅ Completado | Formulario con sliders + selector de emociones |
| Chat con IA | ✅ Completado | GPT-4o con streaming + anonimización |
| Lockdown Mode | ✅ Completado | Detección de riesgo + botón de emergencia |
| Analytics | ✅ Completado | Gráficos de tendencias + stats semanales |
| Stress Logs | ✅ Completado | Análisis de mecanismos de defensa |
| Settings | ✅ Completado | Perfil, idioma, privacidad |
| Dashboard | ✅ Mejorado | Datos reales de mood y stats |

---

## Guía de Estilos

### Estética: "Zen-Precision"
- **Filosofía**: Minimalismo + Bio-hacking
- **Paleta de colores**:
  - Background: Oscuros profundos (`slate-950`, `zinc-900`)
  - Acentos: Cian/Teal para datos (`cyan-500`, `teal-400`)
  - Estados emocionales: Gradientes sutiles
  - Alertas: Rojo para emergencias (`red-500`)
- **Tipografía**: Sans-serif limpia, pesos variables
- **Espaciado**: Generoso, respirado
- **Animaciones**: Sutiles, no intrusivas

### Convenciones de Código
- Componentes: PascalCase
- Funciones/hooks: camelCase
- Archivos: kebab-case
- Types/Interfaces: PascalCase con prefijo `T` o `I` opcional

---

## Variables de Entorno Requeridas

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
EMERGENCY_CONTACT_PHONE=1167409207
```

---

## Próximos Pasos

1. [ ] Configurar credenciales de Supabase
2. [ ] Configurar credenciales de OpenAI
3. [ ] Implementar autenticación con Supabase Auth
4. [ ] Crear componentes UI base (Shadcn/UI)
5. [ ] Implementar Mood Tracker

---

## Changelog

### 2026-02-08
- Creación inicial del proyecto
- Setup Next.js 15 con TypeScript y Tailwind
- Instalación de dependencias core
- Creación de CONTEXT.md
- Definición de schema.sql
- Configuración base de i18n
