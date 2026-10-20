import type { AppDatabase } from "@/db";
import { EDGEMAIL_FEATURES } from "@/lib/features/service";

export async function isTeamMailboxSharingEnabled(_db: AppDatabase): Promise<boolean> {
    return EDGEMAIL_FEATURES.canShareMailboxes;
}
