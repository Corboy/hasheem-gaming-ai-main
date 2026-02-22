import { useEffect, useState } from "react";
import {
  ADMIN_ACTIVITY_EVENT,
  getAdminActivities,
  type AdminActivity,
} from "@/lib/admin-activity";

export function useAdminActivities(): AdminActivity[] {
  const [activities, setActivities] = useState<AdminActivity[]>(() => getAdminActivities());

  useEffect(() => {
    const refresh = () => setActivities(getAdminActivities());
    window.addEventListener(ADMIN_ACTIVITY_EVENT, refresh);
    return () => window.removeEventListener(ADMIN_ACTIVITY_EVENT, refresh);
  }, []);

  return activities;
}
