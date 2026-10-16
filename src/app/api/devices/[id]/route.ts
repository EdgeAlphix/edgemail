import { NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { requireSessionUser } from "@/lib/api/auth";
import { hasValidSessionMutationOrigin } from "@/lib/auth/origin";
import { revokeDeviceKey } from "@/lib/auth/device-keys";

/** Signs a device out: its key stops working and its push registration goes. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const env = getEnv();
	const { user, error } = await requireSessionUser(env, request);
	if (error) return error;
	if (!hasValidSessionMutationOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
	const { id } = await params;
	if (!(await revokeDeviceKey(env, user.id, id))) return NextResponse.json({ error: "Device not found" }, { status: 404 });
	return NextResponse.json({ ok: true });
}
