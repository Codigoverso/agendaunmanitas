export function welcomeEmailHtml(fullName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #0f766e; font-size: 20px;">¡Bienvenido/a, ${fullName}!</h1>
      <p style="color: #3f3f46; font-size: 14px; line-height: 1.6;">
        Ya tienes una cuenta en AgendaUnManitas. Puedes buscar un profesional
        según su disponibilidad real, o activar el modo profesional para
        empezar a recibir solicitudes.
      </p>
      <p style="color: #71717a; font-size: 12px; margin-top: 32px;">
        Si no has creado esta cuenta, puedes ignorar este correo.
      </p>
    </div>
  `;
}
