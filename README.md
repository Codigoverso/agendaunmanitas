# AgendaUnManitas

Marketplace para encontrar un profesional (electricista, fontanero, carpintero, albañil,
pintor, cerrajero, instalador de aire acondicionado y más) según su disponibilidad real
(calendario semanal por horas), en vez de pedir presupuesto a ciegas.

## Stack

- **Frontend**: Next.js (App Router) + MUI (Material Design)
- **Backend/datos**: Supabase (Postgres + Auth + Storage)
- **Emails**: Resend (email de bienvenida al registrarse)

## Puesta en marcha

1. Crea un proyecto en [supabase.com](https://supabase.com) (tier gratuito).
2. Crea una cuenta en [resend.com](https://resend.com) (tier gratuito, 100 emails/día)
   y copia tu API key (Dashboard → API Keys).
   - Sin verificar un dominio propio, Resend solo deja enviar al email con el
     que te registraste en Resend — útil para probar, no sirve todavía para
     usuarios reales. Verificar un dominio se hace en Resend → Domains.
3. Copia `.env.local.example` a `.env.local` y rellena:
   - `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Project Settings → API Keys en Supabase, clave "Publishable key")
   - `RESEND_API_KEY` (API Key de Resend)
4. Ejecuta, en orden, todas las migraciones de `supabase/migrations/` en el SQL
   Editor de tu proyecto de Supabase (una detrás de otra, por fecha).
5. Instala dependencias y arranca el servidor de desarrollo:

   ```bash
   npm install
   npm run dev
   ```

## Estructura de datos (v1)

- `profiles` — cualquier usuario autenticado (cliente y/o profesional); ubicación
  como país/comunidad autónoma (`region`)/provincia (`province`)/población (`city`)
- `trades` — lista cerrada de oficios
- `professional_profiles` — datos de profesional (bio) y radio de actuación
  (`coverage_region`/`coverage_province`/`coverage_city`, todos opcionales: dejarlos
  en blanco de un nivel hacia abajo significa "sin acotar" ahí)
- `professional_trades` — oficios de cada profesional
- `weekly_availability` — horario habitual por día de la semana (`start_time`–`end_time`)
- `blocked_slots` — medias horas concretas marcadas como ocupadas (excepción sobre el horario semanal)
- `requests` — solicitud cliente→profesional con estado (pendiente/aceptada/rechazada/completada)
- `reviews` — reseña del cliente tras un trabajo completado

## Alcance v1

Ver el documento de referencia del proyecto para el alcance cerrado (incluido vs.
fuera de alcance) y el roadmap por fases.
