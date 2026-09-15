-- Email de la cuenta (para notificaciones de moderación) y arreglo de un
-- fallo introducido al desacoplar professional_profiles de las cuentas:
-- la relación implícita con "profiles" que usaba la búsqueda para mostrar
-- el nombre ya no existe como FK, así que professional_profiles.full_name
-- pasa a ser la fuente de verdad siempre (se sincroniza desde el código).
alter table professional_profiles add column account_email text;

update professional_profiles pp
set full_name = coalesce(pp.full_name, p.full_name)
from profiles p
where p.id = pp.id and pp.claimed = true;

update professional_profiles pp
set account_email = u.email
from auth.users u
where u.id = pp.id and pp.claimed = true and pp.account_email is null;

-- El admin necesita poder borrar en cascada el horario/huecos de
-- cualquier profesional al eliminar su perfil (antes solo el propio
-- profesional podía tocar sus filas).
create policy "admin manages any weekly availability"
  on weekly_availability for all
  using (auth.jwt() ->> 'email' = 'hola.codigoverso@gmail.com')
  with check (auth.jwt() ->> 'email' = 'hola.codigoverso@gmail.com');

create policy "admin manages any blocked slots"
  on blocked_slots for all
  using (auth.jwt() ->> 'email' = 'hola.codigoverso@gmail.com')
  with check (auth.jwt() ->> 'email' = 'hola.codigoverso@gmail.com');
