/** Pure helpers for JMAP change states; see changes.ts. */

const PREFIX = "c1";

export function formatState(seq: number, fingerprint: string): string {
	return `${PREFIX}:${seq}:${fingerprint}`;
}

export function parseState(value: unknown): { seq: number; fingerprint: string } | null {
	if (typeof value !== "string") return null;
	const [prefix, seq, fingerprint, ...rest] = value.split(":");
	if (prefix !== PREFIX || !fingerprint || rest.length) return null;
	const number = Number(seq);
	return Number.isSafeInteger(number) && number >= 0 ? { seq: number, fingerprint } : null;
}

/**
 * Folds ordered change rows into JMAP's created/updated/destroyed sets: an
 * object created and destroyed in the window is not reported at all, one
 * destroyed and created again (moved away and back) is updated.
 */
export function coalesceChanges(rows: Array<{ id: string; change: string }>): { created: string[]; updated: string[]; destroyed: string[] } {
	const created = new Set<string>();
	const updated = new Set<string>();
	const destroyed = new Set<string>();
	for (const { id, change } of rows) {
		if (change === "created") {
			if (destroyed.delete(id)) updated.add(id);
			else created.add(id);
		} else if (change === "updated") {
			if (!created.has(id)) updated.add(id);
		} else if (change === "destroyed") {
			if (created.delete(id)) continue;
			updated.delete(id);
			destroyed.add(id);
		}
	}
	return { created: [...created], updated: [...updated], destroyed: [...destroyed] };
}
