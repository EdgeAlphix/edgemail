import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test, { after } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = mkdtempSync(join(tmpdir(), "edgemail-test-"));
after(() => rmSync(output, { recursive: true, force: true }));

async function bundle(entry, name) {
    const outfile = join(output, name);
    await build({
        entryPoints: [join(root, entry)], outfile, bundle: true,
        platform: "node", format: "esm", target: "node22",
        alias: { "@": join(root, "src") }, logLevel: "silent",
    });
    return import(pathToFileURL(outfile).href);
}
const features = await bundle("src/lib/features/service.ts", "features.mjs");
const access = await bundle("src/lib/mailboxes/access.ts", "access.mjs");
const selector = await bundle("src/components/mailbox-selector-utils.ts", "selector.mjs");

test("inbox search matches names and addresses without case or surrounding whitespace", () => {
    const inbox = { localPart: "contact", hostname: "kernel.ngo", displayName: "Kernel Support" };
    for (const query of ["", "  ", "CONTACT", " kernel.ngo ", "Support", "contact@kernel.ngo"]) {
        assert.equal(selector.matchesMailboxSearch(inbox, query), true, query);
    }
    assert.equal(selector.matchesMailboxSearch(inbox, "sterlingwick.com"), false);
});

test("all Team features and unlimited accounts require no license or external request", async () => {
    const previous = globalThis.fetch;
    globalThis.fetch = () => { throw new Error("Unexpected external request"); };
    try {
        assert.deepEqual(await features.getFeatureEntitlements({}), {
            plan: "team", canCustomizeBranding: true, canManageAccounts: true,
            canShareMailboxes: true, accountSeatLimit: null, canForwardEmail: true,
        });
    } finally {
        globalThis.fetch = previous;
    }
});

function database(...rows) {
    return {
        select() {
            const result = rows.shift();
            return { from() { return this; }, where() { return this; }, limit: async () => result };
        },
    };
}
const owner = { id: "owner", role: "user" };
const other = { id: "other", role: "user" };
const mailbox = { id: "mailbox", userId: owner.id, disabled: false, type: "personal" };

test("Team features preserve mailbox ownership and explicit delegation", async () => {
    assert.equal((await access.getMailboxAccessLevel(database([mailbox]), owner, mailbox.id)).canManage, true);
    assert.equal(await access.getMailboxAccessLevel(database([mailbox]), other, mailbox.id), null);
    const shared = { ...mailbox, type: "shared" };
    assert.equal(await access.getMailboxAccessLevel(database([shared], []), other, mailbox.id), null);
    const delegated = await access.getMailboxAccessLevel(database([shared], [{ permission: "read_only" }]), other, mailbox.id);
    assert.equal(delegated.canRead, true);
    assert.equal(delegated.canSendAs, false);
    assert.equal(delegated.canManage, false);
    assert.equal(await access.getMailboxAccessLevel(database([{ ...shared, disabled: true }]), owner, mailbox.id), null);
});

test("activation routes and hostname referral are removed; source and copyright remain", () => {
    for (const path of ["src/lib/licenses", "src/app/api/licenses", "src/app/(admin)/licenses"]) {
        assert.equal(existsSync(join(root, path)), false, path);
    }
    const footer = readFileSync(join(root, "src/components/sidebar-footer.tsx"), "utf8");
    assert.ok(footer.includes('href="https://github.com/EdgeAlphix/edgemail"'));
    assert.ok(!footer.includes("location.hostname"));
    assert.ok(readFileSync(join(root, "LICENSE"), "utf8").includes("Copyright (C) 2026 Hieu Nguyen"));
    assert.ok(readFileSync(join(root, "wrangler.jsonc"), "utf8").includes('"send_metrics": false'));
});
