-- Crea automáticamente la fila en profiles cuando alguien se registra,
-- independientemente de si Supabase exige confirmar el email antes de
-- abrir sesión (security definer: se ejecuta aunque aún no haya sesión).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'city'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
