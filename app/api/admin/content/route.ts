import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ContentType =
  | "categories"
  | "services"
  | "process_steps"
  | "faqs"
  | "neon_colors";

const allowedTypes: ContentType[] = [
  "categories",
  "services",
  "process_steps",
  "faqs",
  "neon_colors",
];

function getAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase bağlantı bilgileri eksik.");
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

function getType(request: NextRequest): ContentType | null {
  const type = request.nextUrl.searchParams.get("type") as ContentType | null;

  if (!type || !allowedTypes.includes(type)) {
    return null;
  }

  return type;
}

function sanitizeBody(type: ContentType, body: Record<string, unknown>) {
  const sortOrder = Number(body.sort_order) || 0;
  const isActive =
    typeof body.is_active === "boolean" ? body.is_active : true;

  if (type === "categories") {
    return {
      title: String(body.title ?? "").trim(),
      description: String(body.description ?? "").trim() || null,
      is_active: isActive,
      sort_order: sortOrder,
    };
  }

  if (type === "services") {
    return {
      title: String(body.title ?? "").trim(),
      description: String(body.description ?? "").trim() || null,
      is_active: isActive,
      sort_order: sortOrder,
    };
  }

  if (type === "process_steps") {
    return {
      title: String(body.title ?? "").trim(),
      description: String(body.description ?? "").trim() || null,
      is_active: isActive,
      sort_order: sortOrder,
    };
  }

  if (type === "faqs") {
    return {
      question: String(body.question ?? "").trim(),
      answer: String(body.answer ?? "").trim(),
      is_active: isActive,
      sort_order: sortOrder,
    };
  }

  return {
    name: String(body.name ?? "").trim(),
    color_value: String(body.color_value ?? "#ffffff").trim(),
    is_active: isActive,
    sort_order: sortOrder,
  };
}

function validateContent(type: ContentType, data: Record<string, unknown>) {
  if (
    (type === "categories" ||
      type === "services" ||
      type === "process_steps") &&
    !data.title
  ) {
    return "Başlık zorunlu.";
  }

  if (type === "faqs" && (!data.question || !data.answer)) {
    return "Soru ve cevap zorunlu.";
  }

  if (type === "neon_colors" && (!data.name || !data.color_value)) {
    return "Renk adı ve renk kodu zorunlu.";
  }

  return null;
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

    const type = getType(request);

    if (!type) {
      return NextResponse.json(
        { error: "Geçersiz içerik türü." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from(type)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: data ?? [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await checkAdmin(request);

    if (!user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

    const type = getType(request);

    if (!type) {
      return NextResponse.json(
        { error: "Geçersiz içerik türü." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const cleanData = sanitizeBody(type, body);

    const validationError = validateContent(type, cleanData);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from(type)
      .insert(cleanData as never)
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
      item: data,
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

    const type = getType(request);

    if (!type) {
      return NextResponse.json(
        { error: "Geçersiz içerik türü." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const id = Number(body.id);

    if (!id) {
      return NextResponse.json(
        { error: "Kayıt ID bulunamadı." },
        { status: 400 }
      );
    }

    const cleanData = sanitizeBody(type, body);
    const validationError = validateContent(type, cleanData);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from(type)
      .update(cleanData)
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
      item: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await checkAdmin(request);

    if (!user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

    const type = getType(request);

    if (!type) {
      return NextResponse.json(
        { error: "Geçersiz içerik türü." },
        { status: 400 }
      );
    }

    const id = Number(request.nextUrl.searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { error: "Kayıt ID bulunamadı." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from(type)
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}