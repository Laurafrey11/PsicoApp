-- =============================================================================
-- EGO-CORE: Schema de Base de Datos
-- =============================================================================
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLA: profiles
-- Información extendida del usuario (complementa auth.users)
-- =============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
    locale TEXT DEFAULT 'es',
    emergency_contact_phone TEXT DEFAULT '1167409207',
    therapist_name TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- TABLA: mood_entries
-- Registros diarios de estado de ánimo
-- =============================================================================
CREATE TABLE public.mood_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Métricas principales (escala 1-10)
    mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    anxiety_level INTEGER CHECK (anxiety_level BETWEEN 1 AND 10),
    sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),

    -- Contexto
    primary_emotion TEXT, -- 'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust'
    secondary_emotions TEXT[], -- Array de emociones secundarias
    triggers TEXT[], -- Factores desencadenantes
    activities TEXT[], -- Actividades realizadas

    -- Notas (anonimizadas antes de enviar a IA)
    notes TEXT,
    notes_anonymized TEXT, -- Versión sin PII

    -- Análisis IA
    ai_analysis JSONB, -- Análisis generado por GPT-4o
    defense_mechanisms TEXT[], -- Mecanismos de defensa detectados

    -- Metadata
    recorded_at TIMESTAMPTZ DEFAULT NOW(), -- Momento del registro
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mood_entries
CREATE INDEX idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX idx_mood_entries_recorded_at ON public.mood_entries(recorded_at DESC);
CREATE INDEX idx_mood_entries_user_date ON public.mood_entries(user_id, recorded_at DESC);

-- RLS para mood_entries
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own mood entries"
    ON public.mood_entries FOR ALL
    USING (auth.uid() = user_id);

-- =============================================================================
-- TABLA: stress_logs
-- Logs detallados de episodios de estrés
-- =============================================================================
CREATE TABLE public.stress_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Intensidad y duración
    intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 10),
    duration_minutes INTEGER,

    -- Contexto
    situation TEXT NOT NULL,
    situation_anonymized TEXT,
    physical_symptoms TEXT[],
    thoughts TEXT,
    thoughts_anonymized TEXT,

    -- Análisis IA
    defense_mechanism TEXT, -- Mecanismo de defensa principal
    defense_mechanism_explanation TEXT,
    coping_suggestions TEXT[],
    ai_insights JSONB,

    -- Resolución
    resolution_strategy TEXT,
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),

    -- Metadata
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para stress_logs
CREATE INDEX idx_stress_logs_user_id ON public.stress_logs(user_id);
CREATE INDEX idx_stress_logs_occurred_at ON public.stress_logs(occurred_at DESC);
CREATE INDEX idx_stress_logs_defense ON public.stress_logs(defense_mechanism);

-- RLS para stress_logs
ALTER TABLE public.stress_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own stress logs"
    ON public.stress_logs FOR ALL
    USING (auth.uid() = user_id);

-- =============================================================================
-- TABLA: chat_messages
-- Historial de conversaciones con la IA
-- =============================================================================
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Contenido
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    content_anonymized TEXT, -- Solo para mensajes del usuario

    -- Metadata IA
    tokens_used INTEGER,
    model_used TEXT DEFAULT 'gpt-4o',

    -- Flags
    flagged_risk BOOLEAN DEFAULT FALSE,
    risk_keywords TEXT[],

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para chat_messages
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_user_recent ON public.chat_messages(user_id, created_at DESC);

-- RLS para chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own chat messages"
    ON public.chat_messages FOR ALL
    USING (auth.uid() = user_id);

-- =============================================================================
-- TABLA: summaries
-- Resúmenes para memoria de largo plazo de la IA
-- =============================================================================
CREATE TABLE public.summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Tipo de resumen
    summary_type TEXT NOT NULL CHECK (summary_type IN ('daily', 'weekly', 'monthly', 'therapeutic')),

    -- Contenido
    content TEXT NOT NULL,
    key_insights TEXT[],
    recurring_patterns TEXT[],
    defense_mechanisms_frequency JSONB, -- {"negacion": 3, "proyeccion": 2}
    mood_trends JSONB, -- {"average": 6.5, "trend": "improving"}

    -- Período cubierto
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,

    -- Metadata
    messages_summarized INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para summaries
CREATE INDEX idx_summaries_user_id ON public.summaries(user_id);
CREATE INDEX idx_summaries_type ON public.summaries(summary_type);
CREATE INDEX idx_summaries_period ON public.summaries(period_start DESC);

-- RLS para summaries
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own summaries"
    ON public.summaries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert summaries"
    ON public.summaries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- TABLA: emergency_logs
-- Registro de activaciones de Lockdown Mode
-- =============================================================================
CREATE TABLE public.emergency_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Detalles del evento
    trigger_message TEXT, -- Mensaje que activó el lockdown (anonimizado)
    detected_keywords TEXT[],
    risk_level TEXT CHECK (risk_level IN ('moderate', 'high', 'critical')),

    -- Acciones tomadas
    lockdown_activated BOOLEAN DEFAULT TRUE,
    call_button_shown BOOLEAN DEFAULT TRUE,
    call_initiated BOOLEAN DEFAULT FALSE,

    -- Resolución
    resolved_at TIMESTAMPTZ,
    resolution_method TEXT, -- 'user_dismissed', 'call_completed', 'timeout', 'professional_intervention'

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    session_id TEXT -- Para tracking de sesión
);

-- Índices para emergency_logs
CREATE INDEX idx_emergency_logs_user_id ON public.emergency_logs(user_id);
CREATE INDEX idx_emergency_logs_created_at ON public.emergency_logs(created_at DESC);
CREATE INDEX idx_emergency_logs_risk ON public.emergency_logs(risk_level);

-- RLS para emergency_logs
ALTER TABLE public.emergency_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own emergency logs"
    ON public.emergency_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert emergency logs"
    ON public.emergency_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mood_entries_updated_at
    BEFORE UPDATE ON public.mood_entries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stress_logs_updated_at
    BEFORE UPDATE ON public.stress_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- FUNCIÓN: Obtener últimos N mensajes para contexto (memoria corto plazo)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_recent_messages(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 15
)
RETURNS TABLE (
    role TEXT,
    content TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cm.role,
        cm.content,
        cm.created_at
    FROM public.chat_messages cm
    WHERE cm.user_id = p_user_id
    ORDER BY cm.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNCIÓN: Obtener resumen más reciente por tipo
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_latest_summary(
    p_user_id UUID,
    p_type TEXT DEFAULT 'weekly'
)
RETURNS TABLE (
    content TEXT,
    key_insights TEXT[],
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.content,
        s.key_insights,
        s.period_start,
        s.period_end
    FROM public.summaries s
    WHERE s.user_id = p_user_id
      AND s.summary_type = p_type
    ORDER BY s.period_end DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
