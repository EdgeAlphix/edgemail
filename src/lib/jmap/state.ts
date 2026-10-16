import type { JmapContext } from "./types";
import { currentChangeScope } from "./changes";

/**
 * States are change-log positions (see changes.ts), shared by every type:
 * any message, folder or mailbox write moves them, and `*\/changes` can
 * continue from them.
 */
export async function getEmailState(ctx: JmapContext): Promise<string> {
	return (await currentChangeScope(ctx)).state;
}

export async function getMailboxState(ctx: JmapContext, emailState?: string): Promise<string> {
	return emailState ?? getEmailState(ctx);
}
