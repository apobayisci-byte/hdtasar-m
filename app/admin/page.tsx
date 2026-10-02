"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Settings = {
  id: number;

  site_name: string;
  site_subtitle: string;

  hero_badge: string;
  hero_title: string;
  hero_highlight: string;
  hero_description: string;

  about_title: string;
  about_text: string;

  instagram_username: string;
  instagram_url: string;

  whatsapp_number: string;
  phone: string;
  email: string;
  address: string;

  footer_text: string;
  footer_subtext: string;
};

type Project = {
  id: number;

  title: string;
  category: string | null;
  description: string | null;

  image_url: string | null;

  is_active: boolean;
  is_featured: boolean;

  sort_order: number;
};

type ContentItem = {
  id: number;

  title?: string;
  description?: string | null;

  question?: string;
  answer?: string;

  name?: string;
  color_value?: string;

  is_active: boolean;
  sort_order: number;
};

type ContentType =
  | "categories"
  | "services"
  | "process_steps"
  | "faqs"
  | "neon_colors";

type Tab =
  | "general"
  | "hero"
  | "projects"
  | "categories"
  | "services"
  | "process"
  | "faq"
  | "neon"
  | "contact"
  | "footer";

/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const emptySettings: Settings = {
  id: 0,

  site_name: "",
  site_subtitle: "",

  hero_badge: "",
  hero_title: "",
  hero_highlight: "",
  hero_description: "",

  about_title: "",
  about_text: "",

  instagram_username: "",
  instagram_url: "",

  whatsapp_number: "",
  phone: "",
  email: "",
  address: "",

  footer_text: "",
  footer_subtext: "",
};

/* =========================================================
   MAIN ADMIN PAGE
========================================================= */

export default function AdminPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<Tab>("general");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [settings, setSettings] =
    useState<Settings>(emptySettings);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [categories, setCategories] =
    useState<ContentItem[]>([]);

  const [services, setServices] =
    useState<ContentItem[]>([]);

  const [processSteps, setProcessSteps] =
    useState<ContentItem[]>([]);

  const [faqs, setFaqs] =
    useState<ContentItem[]>([]);

  const [neonColors, setNeonColors] =
    useState<ContentItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<"success" | "error">("success");

  /* =========================================================
     MESSAGES
  ========================================================= */

  const showMessage = (
    text: string,
    type: "success" | "error" = "success"
  ) => {
    setMessage(text);
    setMessageType(type);

    window.setTimeout(() => {
      setMessage("");
    }, 2800);
  };

  /* =========================================================
     AUTH TOKEN
  ========================================================= */

  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  };

  /* =========================================================
     LOAD SETTINGS
  ========================================================= */

  const loadSettings = async () => {
    const token = await getToken();

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const response = await fetch(
      "/api/admin/settings",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      await supabase.auth.signOut();

      router.replace("/admin/login");

      return;
    }

    const result = await response.json();

    if (!response.ok) {
      showMessage(
        result.error ||
          "Ayarlar yüklenemedi.",
        "error"
      );

      return;
    }

    if (result.settings) {
      setSettings({
        ...emptySettings,
        ...result.settings,
      });
    }
  };

  /* =========================================================
     LOAD PROJECTS
  ========================================================= */

  const loadProjects = async () => {
    const token = await getToken();

    if (!token) return;

    const response = await fetch(
      "/api/admin/projects",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      showMessage(
        result.error ||
          "Çalışmalar yüklenemedi.",
        "error"
      );

      return;
    }

    setProjects(
      result.projects ?? []
    );
  };

  /* =========================================================
     LOAD CONTENT
  ========================================================= */

  const loadContent = async (
    type: ContentType,
    setter: (items: ContentItem[]) => void
  ) => {
    const token = await getToken();

    if (!token) return;

    const response = await fetch(
      `/api/admin/content?type=${type}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      showMessage(
        result.error ||
          "İçerikler yüklenemedi.",
        "error"
      );

      return;
    }

    setter(
      result.items ?? []
    );
  };

  /* =========================================================
     LOAD ALL
  ========================================================= */

  const loadAll = async () => {
    setLoading(true);

    await loadSettings();

    await Promise.all([
      loadProjects(),

      loadContent(
        "categories",
        setCategories
      ),

      loadContent(
        "services",
        setServices
      ),

      loadContent(
        "process_steps",
        setProcessSteps
      ),

      loadContent(
        "faqs",
        setFaqs
      ),

      loadContent(
        "neon_colors",
        setNeonColors
      ),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  /* =========================================================
     SETTINGS
  ========================================================= */

  const updateField = (
    field: keyof Settings,
    value: string
  ) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const saveSettings = async () => {
    setSaving(true);

    const token = await getToken();

    if (!token) {
      router.replace("/admin/login");

      return;
    }

    const response = await fetch(
      "/api/admin/settings",
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify(settings),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      showMessage(
        result.error ||
          "Kaydetme başarısız.",
        "error"
      );

      setSaving(false);

      return;
    }

    setSettings(
      result.settings
    );

    showMessage(
      "Değişiklikler kaydedildi."
    );

    setSaving(false);
  };

  /* =========================================================
     TAB
  ========================================================= */

  const changeTab = (
    tab: Tab
  ) => {
    setActiveTab(tab);

    setMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = async () => {
    await supabase.auth.signOut();

    router.replace(
      "/admin/login"
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="admin-loading">
        <div className="admin-loading-logo">
          HD
        </div>

        <span>
          Yönetim paneli
          yükleniyor...
        </span>
      </main>
    );
  }

  const settingsTab =
    activeTab === "general" ||
    activeTab === "hero" ||
    activeTab === "contact" ||
    activeTab === "footer";

  return (
    <main className="admin-shell">
      {/* =====================================================
          SIDEBAR / MOBILE NAV
      ====================================================== */}

      <aside
        className={`admin-sidebar ${
          mobileMenuOpen
            ? "mobile-open"
            : ""
        }`}
      >
        <div>
          <div className="admin-mobile-header">
            <div className="admin-sidebar-logo">
              <div className="admin-logo-box">
                HD
              </div>

              <div>
                <strong>
                  HD TASARIM
                </strong>

                <span>
                  YÖNETİM PANELİ
                </span>
              </div>
            </div>

            <button
              type="button"
              className={`admin-mobile-menu-button ${
                mobileMenuOpen
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setMobileMenuOpen(
                  !mobileMenuOpen
                )
              }
              aria-label="Admin menüsünü aç"
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          <nav className="admin-navigation">
            <NavButton
              number="01"
              title="Genel Ayarlar"
              active={
                activeTab ===
                "general"
              }
              onClick={() =>
                changeTab(
                  "general"
                )
              }
            />

            <NavButton
              number="02"
              title="Ana Sayfa"
              active={
                activeTab ===
                "hero"
              }
              onClick={() =>
                changeTab(
                  "hero"
                )
              }
            />

            <NavButton
              number="03"
              title="Çalışmalar"
              active={
                activeTab ===
                "projects"
              }
              onClick={() =>
                changeTab(
                  "projects"
                )
              }
            />

            <NavButton
              number="04"
              title="Kategoriler"
              active={
                activeTab ===
                "categories"
              }
              onClick={() =>
                changeTab(
                  "categories"
                )
              }
            />

            <NavButton
              number="05"
              title="Hizmetler"
              active={
                activeTab ===
                "services"
              }
              onClick={() =>
                changeTab(
                  "services"
                )
              }
            />

            <NavButton
              number="06"
              title="Çalışma Süreci"
              active={
                activeTab ===
                "process"
              }
              onClick={() =>
                changeTab(
                  "process"
                )
              }
            />

            <NavButton
              number="07"
              title="SSS"
              active={
                activeTab ===
                "faq"
              }
              onClick={() =>
                changeTab(
                  "faq"
                )
              }
            />

            <NavButton
              number="08"
              title="Neon Renkleri"
              active={
                activeTab ===
                "neon"
              }
              onClick={() =>
                changeTab(
                  "neon"
                )
              }
            />

            <NavButton
              number="09"
              title="İletişim"
              active={
                activeTab ===
                "contact"
              }
              onClick={() =>
                changeTab(
                  "contact"
                )
              }
            />

            <NavButton
              number="10"
              title="Footer"
              active={
                activeTab ===
                "footer"
              }
              onClick={() =>
                changeTab(
                  "footer"
                )
              }
            />
          </nav>
        </div>

        <div className="admin-sidebar-bottom">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
          >
            Siteyi Görüntüle ↗
          </a>

          <button
            type="button"
            onClick={logout}
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span>
              HD TASARIM ATÖLYESİ
            </span>

            <h1>
              Yönetim Paneli
            </h1>
          </div>

          {settingsTab && (
            <button
              type="button"
              onClick={
                saveSettings
              }
              disabled={saving}
              className="admin-save-button"
            >
              {saving
                ? "Kaydediliyor..."
                : "Değişiklikleri Kaydet"}
            </button>
          )}
        </header>

        {message && (
          <div
            className={`admin-message ${messageType}`}
          >
            {message}
          </div>
        )}

        <div className="admin-content">
          {activeTab ===
            "general" && (
            <GeneralSettings
              settings={settings}
              updateField={
                updateField
              }
            />
          )}

          {activeTab ===
            "hero" && (
            <HeroSettings
              settings={settings}
              updateField={
                updateField
              }
            />
          )}

          {activeTab ===
            "projects" && (
            <ProjectsManager
              projects={
                projects
              }
              reloadProjects={
                loadProjects
              }
              getToken={
                getToken
              }
              showMessage={
                showMessage
              }
            />
          )}

          {activeTab ===
            "categories" && (
            <ContentManager
              title="Kategoriler"
              eyebrow="ÜRÜN KATEGORİLERİ"
              description="Sitedeki ürün kategorilerini buradan yönetebilirsin."
              type="categories"
              items={
                categories
              }
              reload={() =>
                loadContent(
                  "categories",
                  setCategories
                )
              }
              getToken={
                getToken
              }
              showMessage={
                showMessage
              }
            />
          )}

          {activeTab ===
            "services" && (
            <ContentManager
              title="Hizmetler"
              eyebrow="HİZMETLER"
              description="Sitede gösterilecek hizmetleri buradan yönetebilirsin."
              type="services"
              items={
                services
              }
              reload={() =>
                loadContent(
                  "services",
                  setServices
                )
              }
              getToken={
                getToken
              }
              showMessage={
                showMessage
              }
            />
          )}

          {activeTab ===
            "process" && (
            <ContentManager
              title="Çalışma Süreci"
              eyebrow="NASIL ÇALIŞIYORUZ?"
              description="Sipariş ve üretim sürecindeki adımları buradan yönetebilirsin."
              type="process_steps"
              items={
                processSteps
              }
              reload={() =>
                loadContent(
                  "process_steps",
                  setProcessSteps
                )
              }
              getToken={
                getToken
              }
              showMessage={
                showMessage
              }
            />
          )}

          {activeTab ===
            "faq" && (
            <ContentManager
              title="Sıkça Sorulan Sorular"
              eyebrow="SSS"
              description="Müşterilerin sık sorduğu soruları buradan düzenleyebilirsin."
              type="faqs"
              items={faqs}
              reload={() =>
                loadContent(
                  "faqs",
                  setFaqs
                )
              }
              getToken={
                getToken
              }
              showMessage={
                showMessage
              }
            />
          )}

          {activeTab ===
            "neon" && (
            <ContentManager
              title="Neon Renkleri"
              eyebrow="NEON ÖNİZLEME"
              description="Müşterinin neon tasarım alanında kullanabileceği renkleri buradan yönetebilirsin."
              type="neon_colors"
              items={
                neonColors
              }
              reload={() =>
                loadContent(
                  "neon_colors",
                  setNeonColors
                )
              }
              getToken={
                getToken
              }
              showMessage={
                showMessage
              }
            />
          )}

          {activeTab ===
            "contact" && (
            <ContactSettings
              settings={settings}
              updateField={
                updateField
              }
            />
          )}

          {activeTab ===
            "footer" && (
            <FooterSettings
              settings={settings}
              updateField={
                updateField
              }
            />
          )}
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   NAV BUTTON
========================================================= */

function NavButton({
  number,
  title,
  active,
  onClick,
}: {
  number: string;
  title: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={
        active
          ? "active"
          : ""
      }
      onClick={onClick}
    >
      <span>
        {number}
      </span>

      {title}
    </button>
  );
}

/* =========================================================
   CONTENT MANAGER
========================================================= */

function ContentManager({
  title,
  eyebrow,
  description,
  type,
  items,
  reload,
  getToken,
  showMessage,
}: {
  title: string;
  eyebrow: string;
  description: string;

  type: ContentType;

  items: ContentItem[];

  reload: () => Promise<void>;

  getToken: () => Promise<string | null>;

  showMessage: (
    text: string,
    type?: "success" | "error"
  ) => void;
}) {
  const isFaq =
    type === "faqs";

  const isColor =
    type === "neon_colors";

  const [firstField, setFirstField] =
    useState("");

  const [
    secondField,
    setSecondField,
  ] = useState("");

  const [
    sortOrder,
    setSortOrder,
  ] = useState("");

  const [adding, setAdding] =
    useState(false);

  /* ADD */

  const addItem = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    const token =
      await getToken();

    if (!token) return;

    setAdding(true);

    const payload: Record<
      string,
      unknown
    > = {
      sort_order:
        Number(
          sortOrder
        ) ||
        items.length + 1,

      is_active: true,
    };

    if (isFaq) {
      payload.question =
        firstField;

      payload.answer =
        secondField;
    } else if (isColor) {
      payload.name =
        firstField;

      payload.color_value =
        secondField ||
        "#ffffff";
    } else {
      payload.title =
        firstField;

      payload.description =
        secondField;
    }

    const response =
      await fetch(
        `/api/admin/content?type=${type}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      showMessage(
        result.error ||
          "Kayıt eklenemedi.",
        "error"
      );

      setAdding(false);

      return;
    }

    setFirstField("");
    setSecondField("");
    setSortOrder("");

    await reload();

    showMessage(
      "Yeni kayıt eklendi."
    );

    setAdding(false);
  };

  /* UPDATE */

  const updateItem = async (
    item: ContentItem,
    updates: Partial<ContentItem>
  ) => {
    const token =
      await getToken();

    if (!token) return;

    const payload = {
      ...item,
      ...updates,
    };

    const response =
      await fetch(
        `/api/admin/content?type=${type}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      showMessage(
        result.error ||
          "Kayıt güncellenemedi.",
        "error"
      );

      return;
    }

    await reload();

    showMessage(
      "Kayıt güncellendi."
    );
  };

  /* DELETE */

  const deleteItem = async (
    item: ContentItem
  ) => {
    const accepted =
      window.confirm(
        "Bu kaydı silmek istediğine emin misin?"
      );

    if (!accepted) return;

    const token =
      await getToken();

    if (!token) return;

    const response =
      await fetch(
        `/api/admin/content?type=${type}&id=${item.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      showMessage(
        result.error ||
          "Kayıt silinemedi.",
        "error"
      );

      return;
    }

    await reload();

    showMessage(
      "Kayıt silindi."
    );
  };

  return (
    <>
      <div className="admin-page-heading">
        <span>
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>
      </div>

      <form
        className="admin-content-create"
        onSubmit={addItem}
      >
        <div className="admin-form-grid">
          <label>
            {isFaq
              ? "Soru"
              : isColor
              ? "Renk Adı"
              : "Başlık"}

            <input
              value={
                firstField
              }
              onChange={(
                event
              ) =>
                setFirstField(
                  event.target
                    .value
                )
              }
              required
            />
          </label>

          <label>
            Sıralama

            <input
              type="number"
              min="0"
              value={
                sortOrder
              }
              onChange={(
                event
              ) =>
                setSortOrder(
                  event.target
                    .value
                )
              }
            />
          </label>
        </div>

        <label>
          {isFaq
            ? "Cevap"
            : isColor
            ? "Renk Kodu"
            : "Açıklama"}

          {isColor ? (
            <div className="admin-color-input">
              <input
                type="color"
                value={
                  secondField ||
                  "#ffffff"
                }
                onChange={(
                  event
                ) =>
                  setSecondField(
                    event.target
                      .value
                  )
                }
              />

              <input
                value={
                  secondField ||
                  "#ffffff"
                }
                onChange={(
                  event
                ) =>
                  setSecondField(
                    event.target
                      .value
                  )
                }
              />
            </div>
          ) : (
            <textarea
              rows={4}
              value={
                secondField
              }
              onChange={(
                event
              ) =>
                setSecondField(
                  event.target
                    .value
                )
              }
              required={
                isFaq
              }
            />
          )}
        </label>

        <button
          className="admin-add-content-button"
          type="submit"
          disabled={adding}
        >
          {adding
            ? "Ekleniyor..."
            : "Yeni Kayıt Ekle"}
        </button>
      </form>

      <div className="admin-content-list">
        {items.map(
          (item) => (
            <ContentEditCard
              key={item.id}
              item={item}
              type={type}
              onUpdate={
                updateItem
              }
              onDelete={
                deleteItem
              }
            />
          )
        )}
      </div>
    </>
  );
}

/* =========================================================
   CONTENT EDIT CARD
========================================================= */

function ContentEditCard({
  item,
  type,
  onUpdate,
  onDelete,
}: {
  item: ContentItem;

  type: ContentType;

  onUpdate: (
    item: ContentItem,
    updates: Partial<ContentItem>
  ) => Promise<void>;

  onDelete: (
    item: ContentItem
  ) => Promise<void>;
}) {
  const isFaq =
    type === "faqs";

  const isColor =
    type ===
    "neon_colors";

  const [first, setFirst] =
    useState(
      isFaq
        ? item.question ??
            ""
        : isColor
        ? item.name ?? ""
        : item.title ?? ""
    );

  const [second, setSecond] =
    useState(
      isFaq
        ? item.answer ??
            ""
        : isColor
        ? item.color_value ??
            "#ffffff"
        : item.description ??
            ""
    );

  const [
    sortOrder,
    setSortOrder,
  ] = useState(
    String(
      item.sort_order
    )
  );

  const save = async () => {
    const updates: Partial<ContentItem> = {
      sort_order:
        Number(
          sortOrder
        ) || 0,
    };

    if (isFaq) {
      updates.question =
        first;

      updates.answer =
        second;
    } else if (isColor) {
      updates.name =
        first;

      updates.color_value =
        second;
    } else {
      updates.title =
        first;

      updates.description =
        second;
    }

    await onUpdate(
      item,
      updates
    );
  };

  return (
    <article className="admin-content-item">
      <div className="admin-content-item-fields">
        <label>
          {isFaq
            ? "Soru"
            : isColor
            ? "Renk Adı"
            : "Başlık"}

          <input
            value={first}
            onChange={(
              event
            ) =>
              setFirst(
                event.target
                  .value
              )
            }
          />
        </label>

        <label>
          Sıra

          <input
            type="number"
            value={
              sortOrder
            }
            onChange={(
              event
            ) =>
              setSortOrder(
                event.target
                  .value
              )
            }
          />
        </label>
      </div>

      <label className="admin-content-long-field">
        {isFaq
          ? "Cevap"
          : isColor
          ? "Renk"
          : "Açıklama"}

        {isColor ? (
          <div className="admin-color-input">
            <input
              type="color"
              value={
                second
              }
              onChange={(
                event
              ) =>
                setSecond(
                  event.target
                    .value
                )
              }
            />

            <input
              value={
                second
              }
              onChange={(
                event
              ) =>
                setSecond(
                  event.target
                    .value
                )
              }
            />
          </div>
        ) : (
          <textarea
            rows={3}
            value={second}
            onChange={(
              event
            ) =>
              setSecond(
                event.target
                  .value
              )
            }
          />
        )}
      </label>

      <div className="admin-content-item-bottom">
        <label className="admin-switch-row">
          <input
            type="checkbox"
            checked={
              item.is_active
            }
            onChange={(
              event
            ) =>
              onUpdate(
                item,
                {
                  is_active:
                    event
                      .target
                      .checked,
                }
              )
            }
          />

          <span>
            Sitede göster
          </span>
        </label>

        <div>
          <button
            type="button"
            className="admin-project-save"
            onClick={save}
          >
            Kaydet
          </button>

          <button
            type="button"
            className="admin-project-delete"
            onClick={() =>
              onDelete(
                item
              )
            }
          >
            Sil
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PROJECT MANAGER
========================================================= */

function ProjectsManager({
  projects,
  reloadProjects,
  getToken,
  showMessage,
}: {
  projects: Project[];

  reloadProjects: () => Promise<void>;

  getToken: () => Promise<string | null>;

  showMessage: (
    text: string,
    type?: "success" | "error"
  ) => void;
}) {
  const [title, setTitle] =
    useState("");

  const [
    category,
    setCategory,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    sortOrder,
    setSortOrder,
  ] = useState("");

  const [
    imageFile,
    setImageFile,
  ] = useState<File | null>(
    null
  );

  const [
    preview,
    setPreview,
  ] = useState("");

  const [
    uploading,
    setUploading,
  ] = useState(false);

  /* IMAGE */

  const handleImage = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0] ??
      null;

    setImageFile(file);

    if (preview) {
      URL.revokeObjectURL(
        preview
      );
    }

    if (file) {
      setPreview(
        URL.createObjectURL(
          file
        )
      );
    } else {
      setPreview("");
    }
  };

  /* ADD */

  const addProject = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      showMessage(
        "Çalışma başlığını gir.",
        "error"
      );

      return;
    }

    setUploading(true);

    const token =
      await getToken();

    if (!token) {
      setUploading(false);

      return;
    }

    const formData =
      new FormData();

    formData.append(
      "title",
      title
    );

    formData.append(
      "category",
      category
    );

    formData.append(
      "description",
      description
    );

    formData.append(
      "sort_order",
      sortOrder ||
        String(
          projects.length +
            1
        )
    );

    if (imageFile) {
      formData.append(
        "image",
        imageFile
      );
    }

    const response =
      await fetch(
        "/api/admin/projects",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      showMessage(
        result.error ||
          "Çalışma eklenemedi.",
        "error"
      );

      setUploading(false);

      return;
    }

    setTitle("");
    setCategory("");
    setDescription("");
    setSortOrder("");
    setImageFile(null);

    if (preview) {
      URL.revokeObjectURL(
        preview
      );
    }

    setPreview("");

    await reloadProjects();

    showMessage(
      "Çalışma başarıyla eklendi."
    );

    setUploading(false);
  };

  /* UPDATE */

  const updateProject = async (
    project: Project,
    updates: Partial<Project>
  ) => {
    const token =
      await getToken();

    if (!token) return;

    const updated = {
      ...project,
      ...updates,
    };

    const response =
      await fetch(
        "/api/admin/projects",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            updated
          ),
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      showMessage(
        result.error ||
          "Çalışma güncellenemedi.",
        "error"
      );

      return;
    }

    await reloadProjects();

    showMessage(
      "Çalışma güncellendi."
    );
  };

  /* DELETE */

  const deleteProject = async (
    project: Project
  ) => {
    const accepted =
      window.confirm(
        `"${project.title}" çalışması silinsin mi?`
      );

    if (!accepted) {
      return;
    }

    const token =
      await getToken();

    if (!token) return;

    const response =
      await fetch(
        `/api/admin/projects?id=${project.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      showMessage(
        result.error ||
          "Çalışma silinemedi.",
        "error"
      );

      return;
    }

    await reloadProjects();

    showMessage(
      "Çalışma silindi."
    );
  };

  return (
    <>
      <div className="admin-page-heading">
        <span>
          ÇALIŞMALAR
        </span>

        <h2>
          Galeriyi yönet.
        </h2>

        <p>
          Fotoğraf yükle,
          başlık ve kategori
          belirle, çalışmaların
          sırasını değiştir.
        </p>
      </div>

      <form
        className="admin-project-create"
        onSubmit={
          addProject
        }
      >
        <div className="admin-project-create-head">
          <span>
            YENİ ÇALIŞMA
          </span>

          <h3>
            Yeni proje ekle
          </h3>
        </div>

        <div className="admin-project-form-grid">
          <div className="admin-project-image-upload">
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={
                  handleImage
                }
              />

              {preview ? (
                <img
                  src={preview}
                  alt="Önizleme"
                />
              ) : (
                <div className="admin-upload-placeholder">
                  <strong>
                    ＋
                  </strong>

                  <span>
                    Fotoğraf seç
                  </span>

                  <small>
                    JPG, PNG
                    veya WEBP
                  </small>
                </div>
              )}
            </label>
          </div>

          <div className="admin-project-fields">
            <div className="admin-form-grid">
              <label>
                Başlık

                <input
                  value={
                    title
                  }
                  onChange={(
                    event
                  ) =>
                    setTitle(
                      event
                        .target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Kategori

                <input
                  value={
                    category
                  }
                  onChange={(
                    event
                  ) =>
                    setCategory(
                      event
                        .target
                        .value
                    )
                  }
                />
              </label>
            </div>

            <label>
              Açıklama

              <textarea
                rows={4}
                value={
                  description
                }
                onChange={(
                  event
                ) =>
                  setDescription(
                    event
                      .target
                      .value
                  )
                }
              />
            </label>

            <label>
              Sıralama

              <input
                type="number"
                value={
                  sortOrder
                }
                onChange={(
                  event
                ) =>
                  setSortOrder(
                    event
                      .target
                      .value
                  )
                }
              />
            </label>

            <button
              type="submit"
              className="admin-add-project-button"
              disabled={
                uploading
              }
            >
              {uploading
                ? "Yükleniyor..."
                : "Çalışmayı Ekle"}
            </button>
          </div>
        </div>
      </form>

      <div className="admin-projects-heading">
        <span>
          MEVCUT ÇALIŞMALAR
        </span>

        <h3>
          {projects.length} çalışma
        </h3>
      </div>

      {projects.length === 0 ? (
        <div className="admin-empty-projects">
          <strong>
            Henüz çalışma yok.
          </strong>

          <span>
            Yukarıdaki formdan
            ilk çalışmayı
            ekleyebilirsin.
          </span>
        </div>
      ) : (
        <div className="admin-project-list">
          {projects.map(
            (project) => (
              <ProjectAdminCard
                key={
                  project.id
                }
                project={
                  project
                }
                onUpdate={
                  updateProject
                }
                onDelete={
                  deleteProject
                }
              />
            )
          )}
        </div>
      )}
    </>
  );
}

/* =========================================================
   PROJECT CARD
========================================================= */

function ProjectAdminCard({
  project,
  onUpdate,
  onDelete,
}: {
  project: Project;

  onUpdate: (
    project: Project,
    updates: Partial<Project>
  ) => Promise<void>;

  onDelete: (
    project: Project
  ) => Promise<void>;
}) {
  const [title, setTitle] =
    useState(
      project.title
    );

  const [
    category,
    setCategory,
  ] = useState(
    project.category ??
      ""
  );

  const [
    description,
    setDescription,
  ] = useState(
    project.description ??
      ""
  );

  const [
    sortOrder,
    setSortOrder,
  ] = useState(
    String(
      project.sort_order
    )
  );

  return (
    <article className="admin-project-item">
      <div className="admin-project-thumb">
        {project.image_url ? (
          <img
            src={
              project.image_url
            }
            alt={
              project.title
            }
          />
        ) : (
          <div>
            HD
          </div>
        )}
      </div>

      <div className="admin-project-item-content">
        <div className="admin-project-edit-grid">
          <label>
            Başlık

            <input
              value={title}
              onChange={(
                event
              ) =>
                setTitle(
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            Kategori

            <input
              value={
                category
              }
              onChange={(
                event
              ) =>
                setCategory(
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            Sıra

            <input
              type="number"
              value={
                sortOrder
              }
              onChange={(
                event
              ) =>
                setSortOrder(
                  event.target
                    .value
                )
              }
            />
          </label>
        </div>

        <label className="admin-project-description">
          Açıklama

          <textarea
            rows={2}
            value={
              description
            }
            onChange={(
              event
            ) =>
              setDescription(
                event.target
                  .value
              )
            }
          />
        </label>

        <div className="admin-project-options">
          <label className="admin-switch-row">
            <input
              type="checkbox"
              checked={
                project.is_active
              }
              onChange={(
                event
              ) =>
                onUpdate(
                  project,
                  {
                    is_active:
                      event
                        .target
                        .checked,
                  }
                )
              }
            />

            <span>
              Sitede göster
            </span>
          </label>

          <label className="admin-switch-row">
            <input
              type="checkbox"
              checked={
                project.is_featured
              }
              onChange={(
                event
              ) =>
                onUpdate(
                  project,
                  {
                    is_featured:
                      event
                        .target
                        .checked,
                  }
                )
              }
            />

            <span>
              Öne çıkar
            </span>
          </label>
        </div>

        <div className="admin-project-actions">
          <button
            type="button"
            className="admin-project-save"
            onClick={() =>
              onUpdate(
                project,
                {
                  title,
                  category,
                  description,

                  sort_order:
                    Number(
                      sortOrder
                    ) || 0,
                }
              )
            }
          >
            Kaydet
          </button>

          <button
            type="button"
            className="admin-project-delete"
            onClick={() =>
              onDelete(
                project
              )
            }
          >
            Sil
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   GENERAL SETTINGS
========================================================= */

function GeneralSettings({
  settings,
  updateField,
}: {
  settings: Settings;

  updateField: (
    field: keyof Settings,
    value: string
  ) => void;
}) {
  return (
    <>
      <div className="admin-page-heading">
        <span>
          GENEL AYARLAR
        </span>

        <h2>
          Site bilgilerini düzenle.
        </h2>

        <p>
          Marka adı ve
          hakkımızda bölümündeki
          temel bilgileri
          düzenleyebilirsin.
        </p>
      </div>

      <div className="admin-form-card">
        <div className="admin-form-grid">
          <label>
            Site Adı

            <input
              value={
                settings.site_name
              }
              onChange={(
                event
              ) =>
                updateField(
                  "site_name",
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            Alt Başlık

            <input
              value={
                settings.site_subtitle
              }
              onChange={(
                event
              ) =>
                updateField(
                  "site_subtitle",
                  event.target
                    .value
                )
              }
            />
          </label>
        </div>

        <label>
          Hakkımızda Başlığı

          <input
            value={
              settings.about_title
            }
            onChange={(
              event
            ) =>
              updateField(
                "about_title",
                event.target
                  .value
              )
            }
          />
        </label>

        <label>
          Hakkımızda Açıklaması

          <textarea
            rows={6}
            value={
              settings.about_text
            }
            onChange={(
              event
            ) =>
              updateField(
                "about_text",
                event.target
                  .value
              )
            }
          />
        </label>
      </div>
    </>
  );
}

/* =========================================================
   HERO SETTINGS
========================================================= */

function HeroSettings({
  settings,
  updateField,
}: {
  settings: Settings;

  updateField: (
    field: keyof Settings,
    value: string
  ) => void;
}) {
  return (
    <>
      <div className="admin-page-heading">
        <span>
          ANA SAYFA
        </span>

        <h2>
          Giriş alanını düzenle.
        </h2>

        <p>
          Kullanıcının siteye
          girdiğinde gördüğü
          ana başlık ve
          açıklamaları
          değiştirebilirsin.
        </p>
      </div>

      <div className="admin-form-card">
        <label>
          Küçük Üst Yazı

          <input
            value={
              settings.hero_badge
            }
            onChange={(
              event
            ) =>
              updateField(
                "hero_badge",
                event.target
                  .value
              )
            }
          />
        </label>

        <div className="admin-form-grid">
          <label>
            Ana Başlık

            <input
              value={
                settings.hero_title
              }
              onChange={(
                event
              ) =>
                updateField(
                  "hero_title",
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            Renkli Başlık

            <input
              value={
                settings.hero_highlight
              }
              onChange={(
                event
              ) =>
                updateField(
                  "hero_highlight",
                  event.target
                    .value
                )
              }
            />
          </label>
        </div>

        <label>
          Açıklama

          <textarea
            rows={6}
            value={
              settings.hero_description
            }
            onChange={(
              event
            ) =>
              updateField(
                "hero_description",
                event.target
                  .value
              )
            }
          />
        </label>
      </div>
    </>
  );
}

/* =========================================================
   CONTACT
========================================================= */

function ContactSettings({
  settings,
  updateField,
}: {
  settings: Settings;

  updateField: (
    field: keyof Settings,
    value: string
  ) => void;
}) {
  return (
    <>
      <div className="admin-page-heading">
        <span>
          İLETİŞİM
        </span>

        <h2>
          İletişim bilgilerini yönet.
        </h2>

        <p>
          Instagram, WhatsApp,
          telefon, e-posta ve
          adres bilgilerini
          buradan değiştirebilirsin.
        </p>
      </div>

      <div className="admin-form-card">
        <div className="admin-form-grid">
          <label>
            Instagram Kullanıcı Adı

            <input
              value={
                settings.instagram_username ||
                ""
              }
              onChange={(
                event
              ) =>
                updateField(
                  "instagram_username",
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            Instagram Linki

            <input
              value={
                settings.instagram_url ||
                ""
              }
              onChange={(
                event
              ) =>
                updateField(
                  "instagram_url",
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            WhatsApp Numarası

            <input
              placeholder="905321234567"
              value={
                settings.whatsapp_number ||
                ""
              }
              onChange={(
                event
              ) =>
                updateField(
                  "whatsapp_number",
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            Telefon

            <input
              value={
                settings.phone ||
                ""
              }
              onChange={(
                event
              ) =>
                updateField(
                  "phone",
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            E-posta

            <input
              value={
                settings.email ||
                ""
              }
              onChange={(
                event
              ) =>
                updateField(
                  "email",
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            Adres

            <input
              value={
                settings.address ||
                ""
              }
              onChange={(
                event
              ) =>
                updateField(
                  "address",
                  event.target
                    .value
                )
              }
            />
          </label>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function FooterSettings({
  settings,
  updateField,
}: {
  settings: Settings;

  updateField: (
    field: keyof Settings,
    value: string
  ) => void;
}) {
  return (
    <>
      <div className="admin-page-heading">
        <span>
          FOOTER
        </span>

        <h2>
          Alt bölüm bilgileri.
        </h2>

        <p>
          Sitenin en altında
          görüntülenecek bilgileri
          buradan değiştirebilirsin.
        </p>
      </div>

      <div className="admin-form-card">
        <div className="admin-form-grid">
          <label>
            Footer Başlığı

            <input
              value={
                settings.footer_text ||
                ""
              }
              onChange={(
                event
              ) =>
                updateField(
                  "footer_text",
                  event.target
                    .value
                )
              }
            />
          </label>

          <label>
            Footer Alt Yazısı

            <input
              value={
                settings.footer_subtext ||
                ""
              }
              onChange={(
                event
              ) =>
                updateField(
                  "footer_subtext",
                  event.target
                    .value
                )
              }
            />
          </label>
        </div>
      </div>
    </>
  );
}