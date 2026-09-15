-- Provincia, entre comunidad autónoma (region) y población (city).
alter table profiles add column province text;
alter table professional_profiles add column province text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, city, province, region)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'province',
    new.raw_user_meta_data ->> 'region'
  );
  return new;
end;
$$;
