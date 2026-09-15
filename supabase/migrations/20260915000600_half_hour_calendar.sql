-- El calendario pasa de franjas mañana/tarde a huecos de media hora, con
-- vista semanal tipo Google Calendar. El horario semanal ahora es un rango
-- de horas por día (de X a Y), y las excepciones puntuales se marcan por
-- fecha + hora de inicio de la media hora concreta.
drop table blocked_slots;
drop table weekly_availability;

create table weekly_availability (
  professional_id uuid not null references professional_profiles (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 1 and 7), -- 1 = lunes ... 7 = domingo
  start_time time not null,
  end_time time not null,
  primary key (professional_id, day_of_week),
  check (end_time > start_time)
);

create table blocked_slots (
  id bigint generated always as identity primary key,
  professional_id uuid not null references professional_profiles (id) on delete cascade,
  date date not null,
  start_time time not null, -- inicio de la media hora ocupada, ej. 09:30
  created_at timestamptz not null default now(),
  unique (professional_id, date, start_time)
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

-- requests todavía no se usa desde la app, pero su columna dependía del
-- mismo tipo "timeframe" — la migramos a hora concreta por coherencia.
alter table requests drop column desired_timeframe;
alter table requests add column desired_start_time time not null default '09:00';
alter table requests alter column desired_start_time drop default;

drop type timeframe;

-- Bucket de Storage para fotos de perfil.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
