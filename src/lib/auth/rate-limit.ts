/** Mobile sign-ins have their own, stricter budget (they skip Turnstile). */
export async function allowDeviceLoginAttempt(env: CloudflareEnv, request: Request): Promise<boolean> {
	const limiter = env.DEVICE_LOGIN_RATE_LIMIT ?? env.LOGIN_RATE_LIMIT;
	if (!limiter) return true;
	const ip = request.headers.get("cf-connecting-ip")?.trim() || "unknown";
	try {
		return (await limiter.limit({ key: `device:${ip}` })).success;
	} catch (error) {
		console.warn("Device login rate limiter unavailable", error);
		return true;
	}
}

export async function allowLoginAttempt(env: CloudflareEnv, request: Request): Promise<boolean> {
	if (!env.LOGIN_RATE_LIMIT) return true;
	const ip = request.headers.get("cf-connecting-ip")?.trim() || "unknown";
	try {
		const outcome = await env.LOGIN_RATE_LIMIT.limit({ key: ip });
		return outcome.success;
	} catch (error) {
		console.warn("Login rate limiter unavailable", error);
		return true;
	}
}
