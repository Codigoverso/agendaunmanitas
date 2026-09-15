"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function activateProfessional(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  // Radio de actuación: cada nivel vacío significa "sin acotar" a partir de ahí.
  const coverage_city = String(formData.get("city") || "") || null;
  const coverage_province = String(formData.get("province") || "") || null;
  const coverage_region = String(formData.get("region") || "") || null;
  const bio = String(formData.get("bio") || "");
  const tradeIds = formData.getAll("trade_ids").map(Number);

  const { error: profileError } = await supabase
    .from("professional_profiles")
    .insert({ id: user.id, coverage_city, coverage_province, coverage_region, bio });

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

  redirect("/panel");
}
