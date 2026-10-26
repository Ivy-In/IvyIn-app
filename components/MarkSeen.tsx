"use client";

import { useEffect } from "react";
import { markActivitySeen } from "@/app/portal/activity/actions";

// Opening the activity page clears the unread bubbles.
export function MarkSeen() {
  useEffect(() => {
    markActivitySeen().catch(() => {});
  }, []);
  return null;
}
