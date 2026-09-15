-- "trades" es una tabla de referencia (lista de oficios): debe ser legible
-- por cualquiera, igual que professional_trades/weekly_availability/etc.
-- Si el RLS ya estaba activado sin ninguna política, esto es lo que faltaba.
alter table trades enable row level security;

create policy "trades are publicly readable"
  on trades for select using (true);
