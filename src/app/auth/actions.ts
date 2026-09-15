"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResendClient, EMAIL_FROM } from "@/lib/resend";
import { welcomeEmailHtml } from "@/lib/emails/welcome";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const fullName = String(formData.get("full_name"));
  const city = String(formData.get("city"));
  const region = String(formData.get("region"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, city, region } },
  });

  if (error) {
    redirect(`/registro?error=${encodeURIComponent(error.message)}`);
  }

  const resend = getResendClient();
  if (resend) {
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: "Bienvenido a AgendaUnManitas",
        html: welcomeEmailHtml(fullName),
      });
    } catch (err) {
      // El email de bienvenida es un extra, no debe bloquear el registro.
      console.error("No se pudo enviar el email de bienvenida:", err);
    }
  }

  redirect("/panel");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/entrar?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/panel");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}
