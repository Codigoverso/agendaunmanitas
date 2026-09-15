# AgendaUnManitas

Marketplace para encontrar electricista, fontanero, carpintero, albañil, pintor o
cerrajero según su disponibilidad real (calendario de día + franja), en vez de pedir
presupuesto a ciegas.

## Stack

- **Frontend**: Next.js (App Router) + Tailwind CSS
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
4. Ejecuta el esquema inicial: abre el SQL Editor de tu proyecto de Supabase y
   pega el contenido de `supabase/migrations/20260915000000_init_schema.sql`
   y de `supabase/migrations/20260915000100_profile_on_signup.sql`.
5. Instala dependencias y arranca el servidor de desarrollo:

   ```bash
   npm install
   npm run dev
   ```

## Estructura de datos (v1)

- `profiles` — cualquier usuario autenticado (cliente y/o profesional)
- `trades` — lista cerrada de oficios (electricista, fontanero, carpintero, albañil, pintor, cerrajero)
- `professional_profiles` — datos de profesional (ciudad, bio)
- `professional_trades` — oficios de cada profesional
- `availability_slots` — franjas libres (día + mañana/tarde)
- `requests` — solicitud cliente→profesional con estado (pendiente/aceptada/rechazada/completada)
- `reviews` — reseña del cliente tras un trabajo completado

## Alcance v1

Ver el documento de referencia del proyecto para el alcance cerrado (incluido vs.
fuera de alcance) y el roadmap por fases.
