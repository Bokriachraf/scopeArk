"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getClient, realtimeConfigured } from "./realtime";

export type Role = "prof" | "eleve";
export type RoomStatus = "connecting" | "connected" | "error";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Handler = (payload: any) => void;

export interface RoomApi {
  status: RoomStatus;
  /** Nombre de connexions par rôle (présence). */
  peers: { prof: number; eleve: number };
  send: (event: string, payload?: unknown) => void;
  subscribe: (event: string, handler: Handler) => () => void;
}

/**
 * Événements échangés dans une salle :
 * draw / undo / clear / lock          : tableau
 * sync-request / sync-state           : un nouvel arrivant récupère le tableau
 * status-request / progress / report  : suivi du test pour le prof
 */
const EVENTS = [
  "draw",
  "undo",
  "clear",
  "lock",
  "sync-request",
  "sync-state",
  "status-request",
  "progress",
  "report",
];

export function useRoomChannel(code: string, role: Role): RoomApi {
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [peers, setPeers] = useState({ prof: 0, eleve: 0 });
  const channelRef = useRef<RealtimeChannel | null>(null);
  const handlers = useRef(new Map<string, Set<Handler>>());

  useEffect(() => {
    if (!realtimeConfigured()) {
      setStatus("error");
      return;
    }
    setStatus("connecting");
    const sb = getClient();
    const channel = sb.channel(`scopeark-${code}`, {
      config: {
        broadcast: { self: false },
        presence: { key: `${role}-${Math.random().toString(36).slice(2, 8)}` },
      },
    });

    EVENTS.forEach((event) => {
      channel.on("broadcast", { event }, ({ payload }) => {
        handlers.current.get(event)?.forEach((h) => h(payload));
      });
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState() as Record<string, { role?: string }[]>;
      let prof = 0;
      let eleve = 0;
      Object.values(state).forEach((metas) =>
        metas.forEach((m) => (m.role === "prof" ? prof++ : eleve++))
      );
      setPeers({ prof, eleve });
    });

    channel.subscribe((s) => {
      if (s === "SUBSCRIBED") {
        channelRef.current = channel;
        setStatus("connected");
        void channel.track({ role });
      } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") {
        setStatus("error");
      }
    });

    return () => {
      channelRef.current = null;
      void sb.removeChannel(channel);
    };
  }, [code, role]);

  const send = useCallback((event: string, payload: unknown = {}) => {
    void channelRef.current?.send({ type: "broadcast", event, payload });
  }, []);

  const subscribe = useCallback((event: string, handler: Handler) => {
    const set = handlers.current.get(event) ?? new Set<Handler>();
    set.add(handler);
    handlers.current.set(event, set);
    return () => {
      set.delete(handler);
    };
  }, []);

  return { status, peers, send, subscribe };
}
