-- Cambio de modelo de disponibilidad: en vez de marcar huecos libres uno a
-- uno, el profesional define un horario semanal recurrente (qué días y
-- franjas trabaja) y todo está disponible por defecto; solo marca una fecha
-- concreta cuando la tiene ocupada (excepción puntual).
drop table availability_slots;

create table weekly_availability (
  professional_id uuid not null references professional_profiles (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 1 and 7), -- 1 = lunes ... 7 = domingo
  timeframe timeframe not null,
  primary key (professional_id, day_of_week, timeframe)
);

create table blocked_slots (
  id bigint generated always as identity primary key,
  professional_id uuid not null references professional_profiles (id) on delete cascade,
  date date not null,
  timeframe timeframe not null,
  created_at timestamptz not null default now(),
  unique (professional_id, date, timeframe)
);

alter table weekly_availability enable row level security;
alter table blocked_slots enable row level security;

create policy "weekly availability is publicly readable"
  on weekly_availability for select using (true);
create policy "professionals manage their own weekly availability"
  on weekly_availability for all
  using (auth.uid() = professional_id)
  with check (auth.uid() = professional_id);

create policy "blocked slots are publicly readable"
  on blocked_slots for select using (true);
create policy "professionals manage their own blocked slots"
  on blocked_slots for all
  using (auth.uid() = professional_id)
  with check (auth.uid() = professional_id);
