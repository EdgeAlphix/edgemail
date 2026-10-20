import { authenticateApiKey } from "@/lib/api/auth";
import type { ApiAuthResult } from "@/lib/api/key-auth-types";
import type { AdminApiKeyScope } from "@/lib/api/scopes-types";
import { getFeatureEntitlements } from "@/lib/features/service";

export async function authenticateAdminApiKey(env: CloudflareEnv, request: Request, scope: AdminApiKeyScope): Promise<ApiAuthResult | null> {
	const auth = await authenticateApiKey(env, request.headers.get("authorization"));
	return auth?.user.role === "admin" && auth.scopes.includes(scope) ? auth : null;
}

export async function canShareAdminMailboxes(env: CloudflareEnv): Promise<boolean> {
	return (await getFeatureEntitlements(env)).canShareMailboxes;
}

export async function canManageAdminAccounts(env: CloudflareEnv): Promise<boolean> {
	return (await getFeatureEntitlements(env)).canManageAccounts;
}
