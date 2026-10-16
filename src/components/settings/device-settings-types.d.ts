export type MobileDevice = {
	id: string;
	name: string;
	createdAt: string;
	lastUsedAt: string | null;
	pushEnabled: boolean;
};
