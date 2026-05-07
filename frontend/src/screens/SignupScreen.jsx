"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/useAuth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { SectionHeader } from "../components/ui/SectionHeader";

export function SignupScreen() {
  const router = useRouter();
  const { signup, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    targetRole: "",
    goals: "",
  });

  async function handleSubmit(event) {
    event.preventDefault();
    await signup({
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      targetRole: form.targetRole,
      goals: form.goals
        .split("\n")
        .map((goal) => goal.trim())
        .filter(Boolean),
    });
    router.push("/dashboard");
  }

  return (
    <Card className="page-card signup-page" glow>
      <SectionHeader eyebrow="Authentication" title="Signup" description="Create your account and set your learning direction." />
      <form className="auth-form" onSubmit={handleSubmit}>
        <Field label="Full name">
          <input
            type="text"
            value={form.fullName}
            onChange={(event) => {
              clearError();
              setForm((current) => ({ ...current, fullName: event.target.value }));
            }}
            required
          />
        </Field>
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
        <Field label="Target role" hint="Optional: helps tailor the dashboard defaults.">
          <input
            type="text"
            value={form.targetRole}
            onChange={(event) => {
              clearError();
              setForm((current) => ({ ...current, targetRole: event.target.value }));
            }}
            placeholder="Backend Developer"
          />
        </Field>
        <Field label="Goals" hint="One goal per line.">
          <textarea
            rows="4"
            value={form.goals}
            onChange={(event) => {
              clearError();
              setForm((current) => ({ ...current, goals: event.target.value }));
            }}
            placeholder="One goal per line"
          />
        </Field>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="row-actions">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>
          <Link className="sf-button sf-button--secondary" href="/login">
            Already have an account?
          </Link>
        </div>
      </form>
    </Card>
  );
}

export default SignupScreen;