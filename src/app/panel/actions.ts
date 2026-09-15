"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/panel/perfil?error=${encodeURIComponent("Selecciona una imagen")}`);
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    redirect(`/panel/perfil?error=${encodeURIComponent(uploadError.message)}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);

  revalidatePath("/panel", "layout");
  redirect(`/panel/perfil?message=${encodeURIComponent("Foto de perfil actualizada.")}`);
}

export async function setWeeklyAvailability(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const rows: { professional_id: string; day_of_week: number; start_time: string; end_time: string }[] = [];
  for (let day = 1; day <= 7; day++) {
    if (!formData.get(`work_${day}`)) continue;
    const start = String(formData.get(`start_${day}`) || "");
    const end = String(formData.get(`end_${day}`) || "");
    if (start && end && start < end) {
      rows.push({ professional_id: user.id, day_of_week: day, start_time: start, end_time: end });
    }
  }

  await supabase.from("weekly_availability").delete().eq("professional_id", user.id);
  if (rows.length > 0) {
    await supabase.from("weekly_availability").insert(rows);
  }

  revalidatePath("/panel/horario");
  revalidatePath("/panel/calendario");
  redirect(`/panel/horario?message=${encodeURIComponent("Horario guardado.")}`);
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const full_name = String(formData.get("full_name") || "");
  const city = String(formData.get("city") || "");
  const province = String(formData.get("province") || "");
  const region = String(formData.get("region") || "");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, city, province, region })
    .eq("id", user.id);

  if (error) {
    redirect(`/panel/perfil?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/panel", "layout");
  redirect(`/panel/perfil?message=${encodeURIComponent("Datos personales actualizados.")}`);
}

export async function updateProfessionalInfo(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const bio = String(formData.get("bio") || "");
  const coverage_city = String(formData.get("city") || "") || null;
  const coverage_province = String(formData.get("province") || "") || null;
  const coverage_region = String(formData.get("region") || "") || null;
  const contact_email = String(formData.get("contact_email") || "") || null;
  const contact_phone = String(formData.get("contact_phone") || "") || null;
  const contact_address = String(formData.get("contact_address") || "") || null;

  const { error } = await supabase
    .from("professional_profiles")
    .update({
      bio,
      coverage_city,
      coverage_province,
      coverage_region,
      contact_email,
      contact_phone,
      contact_address,
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/panel/perfil?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/panel/perfil");
  revalidatePath("/buscar");
  redirect(`/panel/perfil?message=${encodeURIComponent("Datos de profesional actualizados.")}`);
}

export async function updateTrades(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const tradeIds = formData.getAll("trade_ids").map(Number);

  await supabase.from("professional_trades").delete().eq("professional_id", user.id);
  if (tradeIds.length > 0) {
    const { error } = await supabase
      .from("professional_trades")
      .insert(tradeIds.map((trade_id) => ({ professional_id: user.id, trade_id })));

    if (error) {
      redirect(`/panel/perfil?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath("/panel/perfil");
  revalidatePath("/buscar");
  redirect(`/panel/perfil?message=${encodeURIComponent("Oficios actualizados.")}`);
}

export async function toggleBlockedSlot(date: string, time: string, isBlocked: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  if (isBlocked) {
    await supabase
      .from("blocked_slots")
      .delete()
      .eq("professional_id", user.id)
      .eq("date", date)
      .eq("start_time", time);
  } else {
    await supabase.from("blocked_slots").insert({ professional_id: user.id, date, start_time: time });
  }

  revalidatePath("/panel/calendario");
}
