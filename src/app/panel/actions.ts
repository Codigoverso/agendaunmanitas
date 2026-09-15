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
