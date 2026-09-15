-- AgendaUnManitas — esquema inicial (v1)
-- Roles: cliente y profesional viven en la misma cuenta (auth.users).
-- Un usuario se convierte en profesional al crear su fila en professional_profiles.

create type request_status as enum ('pending', 'accepted', 'rejected', 'completed');
create type timeframe as enum ('morning', 'afternoon');

-- Perfil básico de cualquier usuario autenticado (cliente y/o profesional).
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  avatar_url text,
  city text,
  created_at timestamptz not null default now()
);

-- Lista cerrada de oficios al lanzar.
create table trades (
  id smallint primary key,
  slug text not null unique,
  label text not null
);

insert into trades (id, slug, label) values
  (1, 'electricista', 'Electricista'),
  (2, 'fontanero', 'Fontanero'),
  (3, 'carpintero', 'Carpintero'),
  (4, 'albanil', 'Albañil'),
  (5, 'pintor', 'Pintor'),
  (6, 'cerrajero', 'Cerrajero');

-- Datos de profesional. Un usuario "activa modo profesional" creando esta fila.
create table professional_profiles (
  id uuid primary key references profiles (id) on delete cascade,
  bio text,
  city text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table professional_trades (
  professional_id uuid not null references professional_profiles (id) on delete cascade,
  trade_id smallint not null references trades (id),
  primary key (professional_id, trade_id)
);

-- Franjas libres que el profesional marca en su calendario.
create table availability_slots (
  id bigint generated always as identity primary key,
  professional_id uuid not null references professional_profiles (id) on delete cascade,
  date date not null,
  timeframe timeframe not null,
  created_at timestamptz not null default now(),
  unique (professional_id, date, timeframe)
);

-- Solicitud de un cliente a un profesional para una fecha/franja concreta.
create table requests (
  id bigint generated always as identity primary key,
  client_id uuid not null references profiles (id),
  professional_id uuid not null references professional_profiles (id),
  trade_id smallint not null references trades (id),
  desired_date date not null,
  desired_timeframe timeframe not null,
  description text not null,
  status request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reseña del cliente tras un trabajo completado (una por solicitud).
create table reviews (
  id bigint generated always as identity primary key,
  request_id bigint not null unique references requests (id),
  client_id uuid not null references profiles (id),
  professional_id uuid not null references professional_profiles (id),
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------

alter table profiles enable row level security;
alter table professional_profiles enable row level security;
alter table professional_trades enable row level security;
alter table availability_slots enable row level security;
alter table requests enable row level security;
alter table reviews enable row level security;

-- profiles: lectura pública (nombre visible en reseñas/solicitudes), solo el dueño edita.
create policy "profiles are publicly readable"
  on profiles for select using (true);
create policy "users manage their own profile"
  on profiles for insert with check (auth.uid() = id);
create policy "users update their own profile"
  on profiles for update using (auth.uid() = id);

-- professional_profiles: lectura pública (necesaria para la búsqueda), solo el dueño edita.
create policy "professional profiles are publicly readable"
  on professional_profiles for select using (true);
create policy "users manage their own professional profile"
  on professional_profiles for insert with check (auth.uid() = id);
create policy "users update their own professional profile"
  on professional_profiles for update using (auth.uid() = id);

-- professional_trades: lectura pública, solo el dueño del perfil profesional edita.
create policy "professional trades are publicly readable"
  on professional_trades for select using (true);
create policy "professionals manage their own trades"
  on professional_trades for all
  using (auth.uid() = professional_id)
  with check (auth.uid() = professional_id);

-- availability_slots: lectura pública (para buscar por fecha), solo el dueño edita.
create policy "availability is publicly readable"
  on availability_slots for select using (true);
create policy "professionals manage their own availability"
  on availability_slots for all
  using (auth.uid() = professional_id)
  with check (auth.uid() = professional_id);

-- requests: solo las ve el cliente que la creó o el profesional destinatario.
create policy "participants read their own requests"
  on requests for select
  using (auth.uid() = client_id or auth.uid() = professional_id);
create policy "clients create requests"
  on requests for insert
  with check (auth.uid() = client_id);
create policy "participants update their own requests"
  on requests for update
  using (auth.uid() = client_id or auth.uid() = professional_id);

-- reviews: lectura pública (se muestran en el perfil), solo el cliente de la solicitud la crea.
create policy "reviews are publicly readable"
  on reviews for select using (true);
create policy "clients review their completed requests"
  on reviews for insert
  with check (
    auth.uid() = client_id
    and exists (
      select 1 from requests
      where requests.id = request_id
        and requests.client_id = auth.uid()
        and requests.status = 'completed'
    )
  );
