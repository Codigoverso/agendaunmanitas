"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const TIMEFRAMES = ["morning", "afternoon"] as const;

export async function setWeeklyAvailability(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const rows: { professional_id: string; day_of_week: number; timeframe: string }[] = [];
  for (let day = 1; day <= 7; day++) {
    for (const timeframe of TIMEFRAMES) {
      if (formData.get(`d${day}_${timeframe}`)) {
        rows.push({ professional_id: user.id, day_of_week: day, timeframe });
      }
    }
  }

  await supabase.from("weekly_availability").delete().eq("professional_id", user.id);
  if (rows.length > 0) {
    await supabase.from("weekly_availability").insert(rows);
  }

  revalidatePath("/panel");
}

export async function toggleBlockedSlot(date: string, timeframe: string, isBlocked: boolean) {
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
      .eq("timeframe", timeframe);
  } else {
    await supabase.from("blocked_slots").insert({ professional_id: user.id, date, timeframe });
  }

  revalidatePath("/panel");
}
