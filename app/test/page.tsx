"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TestRunner from "@/components/TestRunner";
import type { Profile } from "@/components/TestRunner";

export default function TestPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("scopeark:profile");
    if (!raw) {
      router.replace("/");
      return;
    }
    setProfile(JSON.parse(raw) as Profile);
  }, [router]);

  if (!profile) {
    return (
      <main className="page narrow">
        <p>Chargement…</p>
      </main>
    );
  }

  return (
    <main className="page narrow">
      <TestRunner
        profile={profile}
        storagePrefix="scopeark"
        onFinish={(report) => {
          sessionStorage.setItem("scopeark:report", JSON.stringify(report));
          router.push("/rapport");
        }}
      />
    </main>
  );
}
