import { authFetch } from "@/lib/auth/client";
import type { MobileDevice } from "./device-settings-types";

export async function loadDevices(): Promise<MobileDevice[]> {
	const res = await authFetch("/api/devices");
	const data = (await res.json()) as { devices?: MobileDevice[]; error?: string };
	if (!res.ok) throw new Error(data.error ?? "Failed to load devices");
	return data.devices ?? [];
}

export async function signOutDevice(id: string): Promise<void> {
	const res = await authFetch(`/api/devices/${encodeURIComponent(id)}`, { method: "DELETE" });
	if (!res.ok) {
		const data = (await res.json().catch(() => ({}))) as { error?: string };
		throw new Error(data.error ?? "Failed to sign the device out");
	}
}
