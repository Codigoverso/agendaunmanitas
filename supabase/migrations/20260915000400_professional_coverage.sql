-- El profesional ya no repite su ubicación (viene de profiles, dada en el
-- registro). Estas columnas pasan a significar su radio de actuación:
-- dejarlas en blanco de un nivel hacia abajo significa "sin acotar" en ese
-- nivel (ej. region='Cataluña' y province/city en blanco = toda Cataluña).
alter table professional_profiles alter column city drop not null;
alter table professional_profiles rename column city to coverage_city;
alter table professional_profiles rename column province to coverage_province;
alter table professional_profiles rename column region to coverage_region;
