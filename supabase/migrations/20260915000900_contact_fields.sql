-- Vías de contacto opcionales, por si el profesional quiere que le
-- contacten directamente mientras no existe un flujo de solicitud/mensajería.
alter table professional_profiles add column contact_email text;
alter table professional_profiles add column contact_phone text;
alter table professional_profiles add column contact_address text;
