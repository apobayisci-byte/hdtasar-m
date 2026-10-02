import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

function getAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase public env değişkenleri eksik.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function checkAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.replace("Bearer ", "");

  const supabase = getAuthClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await checkAdmin(request);

    if (!user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      settings: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await checkAdmin(request);

    if (!user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      id,
      site_name,
      site_subtitle,
      hero_badge,
      hero_title,
      hero_highlight,
      hero_description,
      about_title,
      about_text,
      instagram_username,
      instagram_url,
      whatsapp_number,
      phone,
      email,
      address,
      footer_text,
      footer_subtext,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Ayar kaydı bulunamadı." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .update({
        site_name,
        site_subtitle,
        hero_badge,
        hero_title,
        hero_highlight,
        hero_description,
        about_title,
        about_text,
        instagram_username,
        instagram_url,
        whatsapp_number,
        phone,
        email,
        address,
        footer_text,
        footer_subtext,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}