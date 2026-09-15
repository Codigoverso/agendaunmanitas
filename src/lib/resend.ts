import { Resend } from "resend";

// Sin dominio verificado en Resend, solo se puede enviar a la dirección
// del propio dueño de la cuenta de Resend — útil para probar, no para
// usuarios reales hasta verificar un dominio propio.
export const EMAIL_FROM = "AgendaUnManitas <onboarding@resend.dev>";

// Instancia perezosa: si RESEND_API_KEY no está configurada (aún no se ha
// creado la cuenta de Resend), el registro debe seguir funcionando sin
// enviar el email de bienvenida, en vez de romper el build o la petición.
export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}
