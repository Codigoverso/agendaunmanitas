"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function activateProfessional(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const city = String(formData.get("city"));
  const region = String(formData.get("region"));
  const bio = String(formData.get("bio") || "");
  const tradeIds = formData.getAll("trade_ids").map(Number);

  const { error: profileError } = await supabase
    .from("professional_profiles")
    .insert({ id: user.id, city, region, bio });

  if (profileError) {
    redirect(`/profesional?error=${encodeURIComponent(profileError.message)}`);
  }

  if (tradeIds.length > 0) {
    const { error: tradesError } = await supabase
      .from("professional_trades")
      .insert(tradeIds.map((trade_id) => ({ professional_id: user.id, trade_id })));

    if (tradesError) {
      redirect(`/profesional?error=${encodeURIComponent(tradesError.message)}`);
    }
  }

  revalidatePath("/profesional");
}

export async function addAvailability(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const date = String(formData.get("date"));
  const timeframe = String(formData.get("timeframe"));

  const { error } = await supabase
    .from("availability_slots")
    .insert({ professional_id: user.id, date, timeframe });

  if (error && error.code !== "23505") {
    // 23505 = ya existía esa franja; lo tratamos como éxito silencioso.
    redirect(`/profesional?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/profesional");
}

export async function removeAvailability(id: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  await supabase.from("availability_slots").delete().eq("id", id).eq("professional_id", user.id);

  revalidatePath("/profesional");
}
