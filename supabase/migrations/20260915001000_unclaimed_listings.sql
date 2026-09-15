-- Permite que existan perfiles profesionales "sin reclamar": negocios
-- añadidos como directorio (para arrancar la base de datos) que no están
-- ligados a ninguna cuenta registrada. Antes, professional_profiles.id
-- tenía que ser obligatoriamente el id de un usuario autenticado.
alter table professional_profiles drop constraint professional_profiles_id_fkey;
alter table professional_profiles alter column id set default gen_random_uuid();
alter table professional_profiles add column full_name text;
alter table professional_profiles add column claimed boolean not null default true;

-- Solo la cuenta indicada (el admin de la plataforma) puede gestionar
-- perfiles sin reclamar (o cualquier perfil, para moderación).
create policy "admin manages any professional profile"
  on professional_profiles for all
  using (auth.jwt() ->> 'email' = 'hola.codigoverso@gmail.com')
  with check (auth.jwt() ->> 'email' = 'hola.codigoverso@gmail.com');

create policy "admin manages any professional trades"
  on professional_trades for all
  using (auth.jwt() ->> 'email' = 'hola.codigoverso@gmail.com')
  with check (auth.jwt() ->> 'email' = 'hola.codigoverso@gmail.com');
