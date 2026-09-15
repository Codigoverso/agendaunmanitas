-- Comunidad autónoma, junto a la ciudad/provincia ya existente.
alter table profiles add column region text;
alter table professional_profiles add column region text;

-- El trigger de alta ahora también guarda la comunidad autónoma.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, city, region)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'region'
  );
  return new;
end;
$$;
