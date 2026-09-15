export function inReviewEmailHtml(fullName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #0f766e; font-size: 20px;">Tu perfil de negocio está en revisión</h1>
      <p style="color: #3f3f46; font-size: 14px; line-height: 1.6;">
        Hola ${fullName || ""},<br /><br />
        Hemos abierto un proceso de revisión sobre tu perfil profesional en AgendaUnManitas.
        Mientras dura la revisión, tu perfil no aparecerá en las búsquedas. Te avisaremos en
        cuanto se resuelva.
      </p>
    </div>
  `;
}

export function listingDeletedEmailHtml(fullName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #b91c1c; font-size: 20px;">Tu perfil de negocio ha sido eliminado</h1>
      <p style="color: #3f3f46; font-size: 14px; line-height: 1.6;">
        Hola ${fullName || ""},<br /><br />
        Hemos eliminado tu perfil profesional de AgendaUnManitas por no cumplir con las normas
        del sitio. Si crees que se trata de un error, responde a este email para que podamos
        revisarlo.
      </p>
    </div>
  `;
}

export function reactivatedEmailHtml(fullName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #0f766e; font-size: 20px;">Tu perfil de negocio vuelve a estar activo</h1>
      <p style="color: #3f3f46; font-size: 14px; line-height: 1.6;">
        Hola ${fullName || ""},<br /><br />
        Hemos revisado tu perfil profesional en AgendaUnManitas y ya vuelve a aparecer en las
        búsquedas con normalidad.
      </p>
    </div>
  `;
}
