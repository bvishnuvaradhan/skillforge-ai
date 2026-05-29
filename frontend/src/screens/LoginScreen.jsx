"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/useAuth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
// Defensive refs to keep imports available and silence lint warnings
void Link; void useState; void Button; void Card; void Field; void SectionHeader;
import { Field } from "../components/ui/Field";
import { SectionHeader } from "../components/ui/SectionHeader";

export function LoginScreen() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    await login(form);
    router.push("/dashboard");
  }

  return (
    <Card className="page-card login-page" glow>
      <SectionHeader eyebrow="Authentication" title="Login" description="Sign in to continue to your learning workspace." />
      <form className="auth-form" onSubmit={handleSubmit}>
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(event) => {
              clearError();
              setForm((current) => ({ ...current, email: event.target.value }));
            }}
            required
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            value={form.password}
            onChange={(event) => {
              clearError();
              setForm((current) => ({ ...current, password: event.target.value }));
            }}
            required
          />
        </Field>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="row-actions">
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
          <Link className="sf-button sf-button--secondary" href="/signup">
            Signup instead
          </Link>
        </div>
      </form>
    </Card>
  );
}

export default LoginScreen;