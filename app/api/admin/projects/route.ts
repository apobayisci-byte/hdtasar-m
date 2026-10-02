import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "project-images";

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

function getStoragePathFromUrl(url: string | null) {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${BUCKET}/`;

  const index = url.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(url.slice(index + marker.length));
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
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      projects: data ?? [],
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

    const formData = await request.formData();

    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    const sortOrderRaw = String(formData.get("sort_order") ?? "0");
    const sortOrder = Number(sortOrderRaw) || 0;

    const file = formData.get("image");

    if (!title) {
      return NextResponse.json(
        { error: "Çalışma başlığı zorunlu." },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;

    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Sadece görsel dosyaları yüklenebilir." },
          { status: 400 }
        );
      }

      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "Görsel en fazla 10 MB olabilir." },
          { status: 400 }
        );
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeExtension = extension.replace(/[^a-z0-9]/g, "");

      const fileName =
        `${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;

      const bytes = await file.arrayBuffer();

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(fileName, bytes, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: uploadError.message },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

      imageUrl = publicUrl;
    }

    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert({
        title,
        category: category || null,
        description: description || null,
        image_url: imageUrl,
        is_active: true,
        is_featured: false,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) {
      if (imageUrl) {
        const storagePath = getStoragePathFromUrl(imageUrl);

        if (storagePath) {
          await supabaseAdmin.storage
            .from(BUCKET)
            .remove([storagePath]);
        }
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project: data,
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
      title,
      category,
      description,
      sort_order,
      is_active,
      is_featured,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Çalışma ID bulunamadı." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("projects")
      .update({
        title,
        category: category || null,
        description: description || null,
        sort_order: Number(sort_order) || 0,
        is_active: Boolean(is_active),
        is_featured: Boolean(is_featured),
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
      project: data,
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

    const searchParams = request.nextUrl.searchParams;

    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { error: "Çalışma ID bulunamadı." },
        { status: 400 }
      );
    }

    const { data: currentProject, error: findError } =
      await supabaseAdmin
        .from("projects")
        .select("id, image_url")
        .eq("id", id)
        .single();

    if (findError) {
      return NextResponse.json(
        { error: findError.message },
        { status: 500 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from("projects")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    const storagePath = getStoragePathFromUrl(
      currentProject.image_url
    );

    if (storagePath) {
      await supabaseAdmin.storage
        .from(BUCKET)
        .remove([storagePath]);
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