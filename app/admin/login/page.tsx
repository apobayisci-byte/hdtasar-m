"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (session) {
        router.replace("/admin");
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      setMessage(
        "E-posta veya şifre hatalı."
      );

      setLoading(false);

      return;
    }

    router.replace("/admin");
    router.refresh();
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <div className="admin-logo-box">
            HD
          </div>

          <div>
            <strong>HD TASARIM</strong>
            <span>YÖNETİM PANELİ</span>
          </div>
        </div>

        <div className="admin-login-heading">
          <span>YÖNETİCİ GİRİŞİ</span>

          <h1>
            Yönetim Paneli
          </h1>

          <p>
            Site içeriklerini yönetmek için
            hesabınızla giriş yapın.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <label>
            E-posta

            <input
              type="email"
              placeholder="admin@hdtasarim.com"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              required
              autoComplete="email"
            />
          </label>

          <label>
            Şifre

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              required
              autoComplete="current-password"
            />
          </label>

          {message && (
            <div className="admin-error-message">
              {message}
            </div>
          )}

          <button
            className="admin-login-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Giriş yapılıyor..."
              : "Giriş Yap"}
          </button>
        </form>

        <div className="admin-login-footer">
          HD Tasarım Atölyesi
        </div>
      </div>
    </main>
  );
}