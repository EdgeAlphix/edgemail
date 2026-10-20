export type FeatureEntitlements = {
    plan: "team";
    canCustomizeBranding: boolean;
    canManageAccounts: boolean;
    canShareMailboxes: boolean;
    accountSeatLimit: number | null;
    canForwardEmail: boolean;
};

export const EDGEMAIL_FEATURES: Readonly<FeatureEntitlements> = Object.freeze({
    plan: "team",
    canCustomizeBranding: true,
    canManageAccounts: true,
    canShareMailboxes: true,
    accountSeatLimit: null,
    canForwardEmail: true,
});

export async function getFeatureEntitlements(_env: CloudflareEnv): Promise<Readonly<FeatureEntitlements>> {
    return EDGEMAIL_FEATURES;
}
