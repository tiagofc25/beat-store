-- ================================================
-- Schema pour Beat Store - Supabase
-- ================================================

-- Table des beats
CREATE TABLE IF NOT EXISTS beats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    mood TEXT NOT NULL,
    bpm INTEGER NOT NULL,
    cover_art_url TEXT,
    preview_audio_url TEXT NOT NULL,
    full_audio_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Table des demandes de beats
CREATE TABLE IF NOT EXISTS beat_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    beat_ids TEXT[] NOT NULL,
    beat_titles TEXT[] NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'partial')),
    admin_notes TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Row Level Security (RLS)
-- ================================================

-- Activer RLS sur les tables
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE beat_requests ENABLE ROW LEVEL SECURITY;

-- Politique pour beats : lecture publique
CREATE POLICY "Public can view active beats" ON beats
    FOR SELECT USING (is_active = true);

-- Politique pour beats : admin peut tout faire (utilisateurs authentifiés)
CREATE POLICY "Authenticated users can manage beats" ON beats
    FOR ALL USING (auth.role() = 'authenticated');

-- Politique pour beat_requests : création publique
CREATE POLICY "Anyone can create requests" ON beat_requests
    FOR INSERT WITH CHECK (true);

-- Politique pour beat_requests : admin peut lire et modifier
CREATE POLICY "Authenticated users can manage requests" ON beat_requests
    FOR ALL USING (auth.role() = 'authenticated');

-- ================================================
-- Index pour performances
-- ================================================
CREATE INDEX IF NOT EXISTS idx_beats_is_active ON beats(is_active);
CREATE INDEX IF NOT EXISTS idx_beats_created_date ON beats(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_beat_requests_status ON beat_requests(status);
CREATE INDEX IF NOT EXISTS idx_beat_requests_created_date ON beat_requests(created_date DESC);
