# Supabase Setup Guide

Ovaj vodič objašnjava kako da podesite Supabase za CS Team Selector aplikaciju.

## Korak 1: Kreiranje Supabase projekta

1. Idite na [https://supabase.com](https://supabase.com)
2. Registrujte se ili se prijavite
3. Kliknite na "New Project"
4. Unesite ime projekta, lozinku za bazu i region
5. Kliknite "Create new project"

## Korak 2: Kreiranje tabela

Nakon što se projekat kreira, idite na **SQL Editor** i pokrenite sledeće SQL komande:

### Tabela za igrače (sa statistikama):
```sql
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL, -- Jedinstveno ime igrača (pravo ime ili ID)
  nicknames TEXT[] DEFAULT '{}', -- Lista nickova koje igrač koristi
  active_nickname TEXT, -- Trenutno aktivni nickname
  total_kills INTEGER DEFAULT 0,
  total_deaths INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  average_kd DECIMAL(10,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (anonymous access)
CREATE POLICY "Enable all operations for all users" ON players
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster K/D sorting
CREATE INDEX idx_players_average_kd ON players(average_kd DESC);

-- Create index for nickname searches
CREATE INDEX idx_players_nicknames ON players USING GIN(nicknames);
```

### Tabela za istoriju timova:
```sql
CREATE TABLE team_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  t_team TEXT[] NOT NULL,
  ct_team TEXT[] NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE team_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (anonymous access)
CREATE POLICY "Enable all operations for all users" ON team_history
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### Tabela za istoriju mečeva (sa K/D statistikama):
```sql
CREATE TABLE match_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  t_team TEXT[] NOT NULL,
  ct_team TEXT[] NOT NULL,
  player_stats JSONB NOT NULL,
  winner TEXT NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE match_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (anonymous access)
CREATE POLICY "Enable all operations for all users" ON match_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster date sorting
CREATE INDEX idx_match_history_played_at ON match_history(played_at DESC);
```

## Korak 3: Dobijanje API ključeva

1. Idite na **Project Settings** (ikona zupčanika u sidebar-u)
2. Kliknite na **API** u levom meniju
3. Kopirajte:
   - **Project URL** (npr. https://xxxxx.supabase.co)
   - **anon public** ključ

## Korak 4: Konfiguracija aplikacije

1. Otvorite fajl `supabase-config.js`
2. Zamenite vrednosti:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

## Korak 5: Testiranje

1. Otvorite `index.html` u browseru
2. Dodajte nekoliko igrača
3. Kliknite "Sync with Cloud" da sinhronizujete sa Supabase-om
4. Otvorite aplikaciju u drugom browser-u - igrači bi trebalo da se učitaju automatski

## Opcione Funkcionalnosti

### Dodatne sigurnosne politike

Ako želite da ograničite pristup samo autentifikovanim korisnicima:

```sql
-- Uklonite postojeće politike
DROP POLICY "Enable all operations for all users" ON players;
DROP POLICY "Enable all operations for all users" ON team_history;

-- Kreirajte nove politike samo za autentifikovane korisnike
CREATE POLICY "Enable all for authenticated users only" ON players
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users only" ON team_history
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

### Real-time praćenje izmena

Omogućite real-time za automatsku sinhronizaciju između klijenata:

```sql
-- Omogućite real-time za players tabelu
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE team_history;
```

## Struktura baze

### `players` tabela
- `id` (UUID): Primarni ključ
- `name` (TEXT): Jedinstveno ime igrača (pravo ime ili identifikator)
- `nicknames` (TEXT[]): Lista nickova koje igrač koristi u igri
- `active_nickname` (TEXT): Trenutno aktivni nickname
- `total_kills` (INTEGER): Ukupan broj ubistava
- `total_deaths` (INTEGER): Ukupan broj smrti
- `games_played` (INTEGER): Broj odigranih partija
- `average_kd` (DECIMAL): Prosečan K/D koeficijent
- `created_at` (TIMESTAMP): Vreme kreiranja

### `team_history` tabela
- `id` (UUID): Primarni ključ
- `t_team` (TEXT[]): Niz igrača u Terrorist timu
- `ct_team` (TEXT[]): Niz igrača u Counter-Terrorist timu
- `generated_at` (TIMESTAMP): Vreme generisanja timova

### `match_history` tabela
- `id` (UUID): Primarni ključ
- `t_team` (TEXT[]): Niz igrača u Terrorist timu
- `ct_team` (TEXT[]): Niz igrača u Counter-Terrorist timu
- `player_stats` (JSONB): Detalji K/D statistika za svakog igrača
- `winner` (TEXT): Pobednički tim ('T' ili 'CT')
- `played_at` (TIMESTAMP): Vreme odigravanja meča

## Troubleshooting

### Problem: "Failed to initialize Supabase"
- Proverite da li ste ispravno uneli URL i API ključ
- Proverite konzolu browsera za detalje greške

### Problem: "Insert/Update/Delete failed"
- Proverite da li ste omogućili Row Level Security politike
- Proverite da li su tabele kreirane ispravno

### Problem: Igrači se ne učitavaju
- Otvorite Developer Tools (F12) i pogledajte Console
- Proverite Network tab da vidite da li API pozivi prolaze

## Dodatni Resursi

- [Supabase Dokumentacija](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
