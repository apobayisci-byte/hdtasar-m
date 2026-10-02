"use client";

import {
  CSSProperties,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Caveat,
  Dancing_Script,
  Great_Vibes,
  Pacifico,
} from "next/font/google";

import { supabase } from "@/lib/supabase";

/* =========================================================
   FONTS
========================================================= */

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
});

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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

  sort_order: number;
};

type StandardItem = {
  id: number;

  title: string;

  description: string | null;

  sort_order: number;
};

type Faq = {
  id: number;

  question: string;
  answer: string;

  sort_order: number;
};

type NeonColor = {
  id: number;

  name: string;

  color_value: string;

  sort_order: number;
};

type NeonFont =
  | "script"
  | "signature"
  | "round"
  | "hand"
  | "modern";

/* =========================================================
   FALLBACK SETTINGS
========================================================= */

const fallbackSettings: Settings = {
  id: 0,

  site_name: "HD Tasarım Atölyesi",

  site_subtitle:
    "Tasarım & Üretim Atölyesi",

  hero_badge:
    "TASARIM & ÜRETİM ATÖLYESİ",

  hero_title:
    "Neon Tasarım",

  hero_highlight:
    "Sana Özel.",

  hero_description:
    "İşletmelere ve kişiye özel neon tabela, logo ve dekoratif tasarımlar.",

  about_title:
    "Tasarım bizim işimiz.",

  about_text:
    "İşletmeler ve bireysel müşteriler için özgün ve kişiye özel tasarımlar üretiyoruz.",

  instagram_username:
    "hdtasarimatolyesi",

  instagram_url:
    "https://instagram.com/hdtasarimatolyesi",

  whatsapp_number: "",

  phone: "",

  email: "",

  address: "",

  footer_text:
    "HD Tasarım Atölyesi",

  footer_subtext:
    "Tasarım & Üretim",
};

/* =========================================================
   PAGE
========================================================= */

export default function Home() {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    showAllProjects,
    setShowAllProjects,
  ] = useState(false);

  const [
    settings,
    setSettings,
  ] = useState<Settings>(
    fallbackSettings
  );

  const [
    projects,
    setProjects,
  ] = useState<Project[]>([]);

  const [
    categories,
    setCategories,
  ] = useState<StandardItem[]>([]);

  const [
    services,
    setServices,
  ] = useState<StandardItem[]>([]);

  const [
    processSteps,
    setProcessSteps,
  ] = useState<StandardItem[]>([]);

  const [
    faqs,
    setFaqs,
  ] = useState<Faq[]>([]);

  const [
    neonColors,
    setNeonColors,
  ] = useState<NeonColor[]>([]);

  const [
    openFaq,
    setOpenFaq,
  ] = useState<number | null>(null);

  const [
    previewText,
    setPreviewText,
  ] = useState("HD TASARIM");

  const [
    previewColor,
    setPreviewColor,
  ] = useState("#ff62db");

  const [
    previewFont,
    setPreviewFont,
  ] = useState<NeonFont>(
    "script"
  );

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    const loadData =
      async () => {
        const [
          settingsResult,
          projectsResult,
          categoriesResult,
          servicesResult,
          processResult,
          faqResult,
          colorsResult,
        ] = await Promise.all([
          supabase
            .from(
              "site_settings"
            )
            .select("*")
            .order("id", {
              ascending: true,
            })
            .limit(1)
            .maybeSingle(),

          supabase
            .from("projects")
            .select("*")
            .eq(
              "is_active",
              true
            )
            .order(
              "sort_order",
              {
                ascending: true,
              }
            ),

          supabase
            .from(
              "categories"
            )
            .select("*")
            .eq(
              "is_active",
              true
            )
            .order(
              "sort_order",
              {
                ascending: true,
              }
            ),

          supabase
            .from("services")
            .select("*")
            .eq(
              "is_active",
              true
            )
            .order(
              "sort_order",
              {
                ascending: true,
              }
            ),

          supabase
            .from(
              "process_steps"
            )
            .select("*")
            .eq(
              "is_active",
              true
            )
            .order(
              "sort_order",
              {
                ascending: true,
              }
            ),

          supabase
            .from("faqs")
            .select("*")
            .eq(
              "is_active",
              true
            )
            .order(
              "sort_order",
              {
                ascending: true,
              }
            ),

          supabase
            .from(
              "neon_colors"
            )
            .select("*")
            .eq(
              "is_active",
              true
            )
            .order(
              "sort_order",
              {
                ascending: true,
              }
            ),
        ]);

        if (
          settingsResult.data
        ) {
          setSettings({
            ...fallbackSettings,

            ...settingsResult.data,
          });
        }

        if (
          !projectsResult.error
        ) {
          setProjects(
            projectsResult.data ??
              []
          );
        }

        if (
          !categoriesResult.error
        ) {
          setCategories(
            categoriesResult.data ??
              []
          );
        }

        if (
          !servicesResult.error
        ) {
          setServices(
            servicesResult.data ??
              []
          );
        }

        if (
          !processResult.error
        ) {
          setProcessSteps(
            processResult.data ??
              []
          );
        }

        if (
          !faqResult.error
        ) {
          setFaqs(
            faqResult.data ??
              []
          );
        }

        if (
          !colorsResult.error
        ) {
          setNeonColors(
            colorsResult.data ??
              []
          );

          if (
            colorsResult.data
              ?.length
          ) {
            setPreviewColor(
              colorsResult
                .data[0]
                .color_value
            );
          }
        }
      };

    loadData();
  }, []);

  /* =========================================================
     PROJECT LIST
  ========================================================= */

  const visibleProjects =
    useMemo(() => {
      return showAllProjects
        ? projects
        : projects.slice(
            0,
            10
          );
    }, [
      projects,
      showAllProjects,
    ]);

  /* =========================================================
     CONTACT LINKS
  ========================================================= */

  const instagramUrl =
    settings.instagram_url?.trim() ||
    "https://instagram.com/hdtasarimatolyesi";

  const normalWhatsappUrl =
    useMemo(() => {
      const number =
        settings.whatsapp_number?.replace(
          /\D/g,
          ""
        );

      if (!number) {
        return "";
      }

      const message =
        "Merhaba, web siteniz üzerinden fiyat ve bilgi almak istiyorum.";

      return `https://wa.me/${number}?text=${encodeURIComponent(
        message
      )}`;
    }, [
      settings.whatsapp_number,
    ]);

  const selectedFontName =
    useMemo(() => {
      switch (
        previewFont
      ) {
        case "signature":
          return "İmza";

        case "round":
          return "Yuvarlak";

        case "hand":
          return "El Yazısı";

        case "modern":
          return "Modern";

        default:
          return "Neon Script";
      }
    }, [previewFont]);

  const previewWhatsappUrl =
    useMemo(() => {
      const number =
        settings.whatsapp_number?.replace(
          /\D/g,
          ""
        );

      if (!number) {
        return instagramUrl;
      }

      const selectedColor =
        neonColors.find(
          (color) =>
            color.color_value ===
            previewColor
        )?.name ||
        previewColor;

      const message = `Merhaba, web sitenizde neon önizleme oluşturdum.

Yazı: ${
        previewText ||
        "HD TASARIM"
      }

Renk: ${selectedColor}

Yazı Stili: ${selectedFontName}

Bu tasarım için fiyat almak istiyorum.`;

      return `https://wa.me/${number}?text=${encodeURIComponent(
        message
      )}`;
    }, [
      settings.whatsapp_number,
      previewText,
      previewColor,
      selectedFontName,
      neonColors,
      instagramUrl,
    ]);

  const contactUrl =
    normalWhatsappUrl ||
    instagramUrl;

  /* =========================================================
     HELPERS
  ========================================================= */

  const closeMenu =
    () => {
      setMenuOpen(false);
    };

  const getNeonFontClass =
    () => {
      switch (
        previewFont
      ) {
        case "signature":
          return greatVibes.className;

        case "round":
          return pacifico.className;

        case "hand":
          return caveat.className;

        case "modern":
          return "";

        default:
          return dancingScript.className;
      }
    };

  /* =========================================================
     NEON PREVIEW BOX
  ========================================================= */

  const NeonPreviewBox =
    ({
      mobile = false,
    }: {
      mobile?: boolean;
    }) => (
      <div
        className={`preview-stage ${
          mobile
            ? "preview-stage-mobile"
            : "preview-stage-desktop"
        }`}
      >
        <div className="preview-wall">
          <div className="preview-sign-board">
            <div
              className={`preview-neon-text ${getNeonFontClass()}`}
              style={
                {
                  "--neon-color":
                    previewColor,
                } as CSSProperties
              }
            >
              {previewText ||
                "HD TASARIM"}
            </div>
          </div>

          <small>
            Önizleme temsili
            görünümdür.
          </small>
        </div>
      </div>
    );

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <main>
      {/* =====================================================
          GLOBAL BACKGROUND
      ====================================================== */}

      <div className="site-neon-background">
        <div className="neon-blob neon-blob-1" />
        <div className="neon-blob neon-blob-2" />
        <div className="neon-blob neon-blob-3" />
        <div className="neon-blob neon-blob-4" />
        <div className="neon-blob neon-blob-5" />
        <div className="neon-blob neon-blob-6" />
      </div>

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="navbar">
        <div className="container nav-inner">
          <a
            href="#home"
            className="brand"
            onClick={closeMenu}
          >
            <div className="brand-mark">
              <span>
                HD
              </span>
            </div>

            <div className="brand-text">
              <strong>
                {
                  settings.site_name
                }
              </strong>

              <span>
                {
                  settings.site_subtitle
                }
              </span>
            </div>
          </a>

          <nav className="desktop-nav">
            <a href="#home">
              Ana Sayfa
            </a>

            <a href="#projects">
              Çalışmalar
            </a>

            <a href="#preview">
              Neonunu Tasarla
            </a>

            <a href="#services">
              Hizmetler
            </a>

            <a href="#about">
              Hakkımızda
            </a>

            <a href="#faq">
              SSS
            </a>

            <a href="#contact">
              İletişim
            </a>
          </nav>

          <div className="nav-right">
            <a
              href={contactUrl}
              target="_blank"
              rel="noreferrer"
              className="nav-button"
            >
              Teklif Al
            </a>

            <button
              type="button"
              className={`menu-button ${
                menuOpen
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setMenuOpen(
                  !menuOpen
                )
              }
              aria-label="Menüyü aç"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        <div
          className={`mobile-menu ${
            menuOpen
              ? "open"
              : ""
          }`}
        >
          <div className="container mobile-menu-inner">
            <a
              href="#home"
              onClick={
                closeMenu
              }
            >
              Ana Sayfa
            </a>

            <a
              href="#projects"
              onClick={
                closeMenu
              }
            >
              Çalışmalar
            </a>

            <a
              href="#preview"
              onClick={
                closeMenu
              }
            >
              Neonunu Tasarla
            </a>

            <a
              href="#services"
              onClick={
                closeMenu
              }
            >
              Hizmetler
            </a>

            <a
              href="#about"
              onClick={
                closeMenu
              }
            >
              Hakkımızda
            </a>

            <a
              href="#faq"
              onClick={
                closeMenu
              }
            >
              SSS
            </a>

            <a
              href="#contact"
              onClick={
                closeMenu
              }
            >
              İletişim
            </a>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        className="hero"
        id="home"
      >
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="eyebrow">
              <span />

              {
                settings.hero_badge
              }
            </div>

            <h1>
              {
                settings.hero_title
              }

              <br />

              <span>
                {
                  settings.hero_highlight
                }
              </span>
            </h1>

            <p className="hero-description">
              {
                settings.hero_description
              }
            </p>

            <div className="hero-actions">
              <a
                href={
                  contactUrl
                }
                target="_blank"
                rel="noreferrer"
                className="primary-button"
              >
                Teklif Al
              </a>

              <a
                href="#projects"
                className="secondary-button"
              >
                Çalışmalarımız
              </a>
            </div>

            <div className="hero-info">
              <div>
                <strong>
                  Özel
                </strong>

                <span>
                  Tasarım
                </span>
              </div>

              <i />

              <div>
                <strong>
                  Kaliteli
                </strong>

                <span>
                  Üretim
                </span>
              </div>

              <i />

              <div>
                <strong>
                  Doğrudan
                </strong>

                <span>
                  İletişim
                </span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-product">
              <div className="product-top-label">
                <span />

                Özel Üretim
              </div>

              <div className="product-board">
                <div className="product-logo">
                  <strong>
                    HD
                  </strong>

                  <span>
                    TASARIM
                  </span>

                  <small>
                    ATÖLYESİ
                  </small>
                </div>
              </div>

              <div className="product-footer">
                <div>
                  <strong>
                    {
                      settings.site_name
                    }
                  </strong>

                  <span>
                    {
                      settings.site_subtitle
                    }
                  </span>
                </div>

                <div className="custom-badge">
                  <strong>
                    100%
                  </strong>

                  <span>
                    Kişiye Özel
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES
      ====================================================== */}

      {categories.length >
        0 && (
        <section className="section categories-section">
          <div className="container">
            <div className="section-center-small">
              <div className="eyebrow centered">
                <span />

                NELER ÜRETİYORUZ?

                <span />
              </div>

              <h2>
                Tasarımına
                uygun

                <br />

                <span>
                  çözümü bul.
                </span>
              </h2>
            </div>

            <div className="category-grid">
              {categories.map(
                (
                  category,
                  index
                ) => (
                  <article
                    className="category-card"
                    key={
                      category.id
                    }
                  >
                    <span>
                      {String(
                        index +
                          1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <h3>
                      {
                        category.title
                      }
                    </h3>

                    <p>
                      {
                        category.description
                      }
                    </p>
                  </article>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          PROJECTS
      ====================================================== */}

      <section
        className="section projects"
        id="projects"
      >
        <div className="container">
          <div className="section-header">
            <div>
              <div className="eyebrow">
                <span />

                ÇALIŞMALARIMIZ
              </div>

              <h2>
                Son

                <br />

                <span>
                  çalışmalarımız.
                </span>
              </h2>
            </div>

            <p>
              İşletmeler, yaşam
              alanları ve kişisel
              kullanım için
              hazırladığımız özel
              tasarım çalışmalar.
            </p>
          </div>

          {projects.length ===
          0 ? (
            <div className="public-empty">
              Yeni çalışmalar
              yakında burada.
            </div>
          ) : (
            <>
              <div className="projects-grid">
                {visibleProjects.map(
                  (
                    project,
                    index
                  ) => (
                    <article
                      className="project-card"
                      key={
                        project.id
                      }
                    >
                      <div className="project-image">
                        <span className="project-index">
                          {String(
                            index +
                              1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        {project.image_url ? (
                          <img
                            src={
                              project.image_url
                            }
                            alt={
                              project.title
                            }
                            className="project-real-image"
                          />
                        ) : (
                          <div className="project-demo">
                            <strong>
                              HD
                            </strong>
                          </div>
                        )}

                        <div className="project-overlay" />
                      </div>

                      <div className="project-info">
                        <div>
                          <span>
                            {project.category ||
                              "HD Tasarım"}
                          </span>

                          <h3>
                            {
                              project.title
                            }
                          </h3>
                        </div>

                        <div className="project-arrow">
                          ↗
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>

              {projects.length >
                10 && (
                <div className="projects-more">
                  <button
                    type="button"
                    className="show-more-button"
                    onClick={() =>
                      setShowAllProjects(
                        !showAllProjects
                      )
                    }
                  >
                    {showAllProjects
                      ? "Daha Az Göster"
                      : "Daha Fazla Göster"}

                    <span
                      className={
                        showAllProjects
                          ? "rotate"
                          : ""
                      }
                    >
                      ↓
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* =====================================================
          NEON PREVIEW
      ====================================================== */}

      <section
        className="section neon-preview-section"
        id="preview"
      >
        <div className="container preview-layout">
          <div className="preview-content">
            <div className="eyebrow">
              <span />

              NEONUNU ÖNİZLE
            </div>

            <h2>
              Yazını

              <br />

              <span>
                ışıklandır.
              </span>
            </h2>

            <p>
              Yazını gir, yazı
              stilini ve neon
              rengini seç.
              Tasarımının yaklaşık
              görünümünü anında
              önizle.
            </p>

            <label className="preview-input-label">
              Neon üzerinde
              ne yazsın?

              <input
                maxLength={28}
                value={
                  previewText
                }
                onChange={(
                  event
                ) =>
                  setPreviewText(
                    event.target
                      .value
                  )
                }
                placeholder="Örn: HD TASARIM"
              />
            </label>

            {/* MOBİLDE ÖNİZLEME INPUTTAN HEMEN SONRA */}

            <NeonPreviewBox
              mobile
            />

            <div className="preview-option-title">
              Yazı Stili
            </div>

            <div className="preview-fonts">
              <button
                type="button"
                className={
                  previewFont ===
                  "script"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPreviewFont(
                    "script"
                  )
                }
              >
                <span
                  className={
                    dancingScript.className
                  }
                >
                  Neon
                </span>

                Script
              </button>

              <button
                type="button"
                className={
                  previewFont ===
                  "signature"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPreviewFont(
                    "signature"
                  )
                }
              >
                <span
                  className={
                    greatVibes.className
                  }
                >
                  Neon
                </span>

                İmza
              </button>

              <button
                type="button"
                className={
                  previewFont ===
                  "round"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPreviewFont(
                    "round"
                  )
                }
              >
                <span
                  className={
                    pacifico.className
                  }
                >
                  Neon
                </span>

                Yuvarlak
              </button>

              <button
                type="button"
                className={
                  previewFont ===
                  "hand"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPreviewFont(
                    "hand"
                  )
                }
              >
                <span
                  className={
                    caveat.className
                  }
                >
                  Neon
                </span>

                El Yazısı
              </button>

              <button
                type="button"
                className={
                  previewFont ===
                  "modern"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPreviewFont(
                    "modern"
                  )
                }
              >
                <span>
                  NEON
                </span>

                Modern
              </button>
            </div>

            <div className="preview-option-title preview-color-title">
              Neon Rengi
            </div>

            <div className="preview-colors">
              {neonColors.map(
                (color) => (
                  <button
                    type="button"
                    key={
                      color.id
                    }
                    title={
                      color.name
                    }
                    className={
                      previewColor ===
                      color.color_value
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setPreviewColor(
                        color.color_value
                      )
                    }
                  >
                    <span
                      style={{
                        background:
                          color.color_value,
                      }}
                    />

                    {
                      color.name
                    }
                  </button>
                )
              )}
            </div>

            <a
              className="primary-button preview-offer"
              href={
                previewWhatsappUrl
              }
              target="_blank"
              rel="noreferrer"
            >
              Bu Tasarım İçin
              Teklif Al
            </a>
          </div>

          {/* DESKTOP ÖNİZLEME */}

          <NeonPreviewBox />
        </div>
      </section>

      {/* =====================================================
          SERVICES
      ====================================================== */}

      <section
        className="section services"
        id="services"
      >
        <div className="container services-layout">
          <div className="services-heading">
            <div className="eyebrow">
              <span />

              NELER YAPIYORUZ?
            </div>

            <h2>
              Tasarımdan

              <br />

              <span>
                üretime.
              </span>
            </h2>

            <p>
              Fikrinizi dinliyor,
              kullanım alanınıza
              uygun tasarlıyor ve
              üretimini
              gerçekleştiriyoruz.
            </p>
          </div>

          <div className="services-list">
            {services.map(
              (
                service,
                index
              ) => (
                <article
                  className="service-card"
                  key={
                    service.id
                  }
                >
                  <span className="service-number">
                    {String(
                      index +
                        1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <div className="service-content">
                    <h3>
                      {
                        service.title
                      }
                    </h3>

                    <p>
                      {
                        service.description
                      }
                    </p>
                  </div>

                  <span className="service-plus">
                    ＋
                  </span>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          PROCESS
      ====================================================== */}

      <section className="section process">
        <div className="container">
          <div className="center-heading">
            <div className="eyebrow centered">
              <span />

              NASIL ÇALIŞIYORUZ?

              <span />
            </div>

            <h2>
              Tasarımdan

              <br />

              <span>
                teslimata.
              </span>
            </h2>
          </div>

          <div className="process-grid">
            {processSteps.map(
              (
                step,
                index
              ) => (
                <article
                  key={
                    step.id
                  }
                >
                  <span>
                    {String(
                      index +
                        1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <h3>
                    {
                      step.title
                    }
                  </h3>

                  <p>
                    {
                      step.description
                    }
                  </p>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT
      ====================================================== */}

      <section
        className="section about"
        id="about"
      >
        <div className="container about-grid">
          <div className="about-visual">
            <div className="about-board">
              <strong>
                HD
              </strong>

              <span>
                {settings.site_name.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="about-content">
            <div className="eyebrow">
              <span />

              {settings.site_name.toUpperCase()}
            </div>

            <h2>
              {
                settings.about_title
              }
            </h2>

            <p>
              {
                settings.about_text
              }
            </p>

            <a
              href={
                instagramUrl
              }
              target="_blank"
              rel="noreferrer"
              className="instagram-link"
            >
              @
              {settings.instagram_username ||
                "hdtasarimatolyesi"}

              <span>
                ↗
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ====================================================== */}

      {faqs.length > 0 && (
        <section
          className="section faq-section"
          id="faq"
        >
          <div className="container faq-layout">
            <div className="faq-heading">
              <div className="eyebrow">
                <span />

                MERAK EDİLENLER
              </div>

              <h2>
                Sıkça
                sorulan

                <br />

                <span>
                  sorular.
                </span>
              </h2>
            </div>

            <div className="faq-list">
              {faqs.map(
                (faq) => {
                  const isOpen =
                    openFaq ===
                    faq.id;

                  return (
                    <article
                      key={
                        faq.id
                      }
                      className={`faq-item ${
                        isOpen
                          ? "open"
                          : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaq(
                            isOpen
                              ? null
                              : faq.id
                          )
                        }
                      >
                        <span>
                          {
                            faq.question
                          }
                        </span>

                        <i>
                          {isOpen
                            ? "×"
                            : "+"}
                        </i>
                      </button>

                      {isOpen && (
                        <div className="faq-answer-simple">
                          <p>
                            {
                              faq.answer
                            }
                          </p>
                        </div>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          CONTACT
      ====================================================== */}

      <section
        className="section contact"
        id="contact"
      >
        <div className="container">
          <div className="contact-card">
            <div className="contact-content">
              <div className="eyebrow centered">
                <span />

                İLETİŞİME GEÇ

                <span />
              </div>

              <h2>
                Projeni

                <br />

                <span>
                  birlikte
                  hazırlayalım.
                </span>
              </h2>

              <p>
                Tasarımını,
                logonu veya
                istediğin
                çalışmayı gönder.
                Detayları konuşup
                sana özel çözümü
                hazırlayalım.
              </p>

              <div className="contact-actions">
                {normalWhatsappUrl && (
                  <a
                    href={
                      normalWhatsappUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="primary-button"
                  >
                    WhatsApp
                  </a>
                )}

                <a
                  href={
                    instagramUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-button"
                >
                  Instagram
                </a>
              </div>

              <div className="contact-details">
                {settings.phone && (
                  <a
                    href={`tel:${settings.phone.replace(
                      /\s/g,
                      ""
                    )}`}
                  >
                    {
                      settings.phone
                    }
                  </a>
                )}

                {settings.email && (
                  <a
                    href={`mailto:${settings.email}`}
                  >
                    {
                      settings.email
                    }
                  </a>
                )}

                {settings.address && (
                  <span>
                    {
                      settings.address
                    }
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer>
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="brand-mark footer-logo">
              <span>
                HD
              </span>
            </div>

            <div>
              <strong>
                {
                  settings.footer_text
                }
              </strong>

              <span>
                {
                  settings.footer_subtext
                }
              </span>
            </div>
          </div>

          <div className="footer-right">
            <a
              href={
                instagramUrl
              }
              target="_blank"
              rel="noreferrer"
            >
              @
              {settings.instagram_username ||
                "hdtasarimatolyesi"}
            </a>

            {normalWhatsappUrl && (
              <a
                href={
                  normalWhatsappUrl
                }
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            )}

            <span>
              © 2026{" "}
              {
                settings.footer_text
              }
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}