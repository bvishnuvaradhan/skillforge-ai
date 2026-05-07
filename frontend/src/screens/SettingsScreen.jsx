"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/useAuth";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { SectionHeader } from "../components/ui/SectionHeader";

export function SettingsScreen() {
  const router = useRouter();
  const { auth, saveProfile, logout } = useAuth();
  const user = auth.user;
  const [form, setForm] = useState({
    fullName: "",
    targetRole: "",
    avatarUrl: "",
    leetcode: "",
    codechef: "",
    github: "",
    goals: "",
    theme: "system",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      fullName: user.profile.fullName || "",
      targetRole: user.profile.targetRole || "",
      avatarUrl: user.profile.avatarUrl || "",
      leetcode: user.profile.codingProfiles?.leetcode || "",
      codechef: user.profile.codingProfiles?.codechef || "",
      github: user.profile.codingProfiles?.github || "",
      goals: (user.profile.goals || []).join("\n"),
      theme: user.profile.theme || "system",
    });
  }, [user]);

  useEffect(() => {
    if (auth.ready && !user) {
      router.replace("/login");
    }
  }, [auth.ready, router, user]);

  if (!auth.ready || !user) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await saveProfile({
      fullName: form.fullName,
      targetRole: form.targetRole,
      avatarUrl: form.avatarUrl,
      codingProfiles: {
        leetcode: form.leetcode,
        codechef: form.codechef,
        github: form.github,
      },
      goals: form.goals
        .split("\n")
        .map((goal) => goal.trim())
        .filter(Boolean),
      theme: form.theme,
    });
  }

  return (
    <Card className="page-card settings-page" glow>
      <SectionHeader
        eyebrow="Profile"
        title="Settings"
        description="Update your profile, integrations, avatar, and theme preference."
        actions={
          <>
            <ThemeToggle />
            <Button variant="secondary" type="button" onClick={logout}>
              Logout
            </Button>
          </>
        }
      />
      <form className="settings-form" onSubmit={handleSubmit}>
        <Field label="Avatar" hint="Optional local preview only for now.">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = () => {
                setForm((current) => ({ ...current, avatarUrl: String(reader.result || "") }));
              };
              reader.readAsDataURL(file);
            }}
          />
        </Field>
        {form.avatarUrl ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <img
              src={form.avatarUrl}
              alt="Avatar preview"
              style={{ width: 56, height: 56, borderRadius: "999px", objectFit: "cover" }}
            />
            <Button type="button" variant="secondary" onClick={() => setForm((current) => ({ ...current, avatarUrl: "" }))}>
              Remove avatar
            </Button>
          </div>
        ) : null}
        <Field label="Full name">
          <input
            type="text"
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
          />
        </Field>
        <Field label="Target role">
          <input
            type="text"
            value={form.targetRole}
            onChange={(event) => setForm((current) => ({ ...current, targetRole: event.target.value }))}
          />
        </Field>
        <Field label="LeetCode username">
          <input
            type="text"
            value={form.leetcode}
            onChange={(event) => setForm((current) => ({ ...current, leetcode: event.target.value }))}
          />
        </Field>
        <Field label="CodeChef username">
          <input
            type="text"
            value={form.codechef}
            onChange={(event) => setForm((current) => ({ ...current, codechef: event.target.value }))}
          />
        </Field>
        <Field label="GitHub username">
          <input
            type="text"
            value={form.github}
            onChange={(event) => setForm((current) => ({ ...current, github: event.target.value }))}
          />
        </Field>
        <Field label="Goals">
          <textarea
            rows="5"
            value={form.goals}
            onChange={(event) => setForm((current) => ({ ...current, goals: event.target.value }))}
          />
        </Field>
        <Field label="Theme preference">
          <select
            value={form.theme}
            onChange={(event) => setForm((current) => ({ ...current, theme: event.target.value }))}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Field>
        <div className="row-actions">
          <Button type="submit">Save profile</Button>
        </div>
      </form>
    </Card>
  );
}

export default SettingsScreen;