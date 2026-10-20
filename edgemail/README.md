# EdgeMail

EdgeMail is the EdgeAlphix fork of [Mailflare](https://github.com/hieunc229/mailflare), modified on October 20, 2026. It retains the upstream AGPL-3.0-or-later license and copyright notices. The application sidebar links to this fork's corresponding source.

All existing Team capabilities are available without activation: custom branding, unlimited accounts, shared mailboxes, booking hosts, and forwarding. Normal authentication, administrator roles, mailbox membership, and send permissions still apply. EdgeMail does not represent a purchased upstream Team subscription.

The activation API, Paymug client, purchase pages, license indicators, and seat enforcement are removed. Historical license tables and migrations remain inert for schema and backup compatibility; EdgeMail never reads them to grant access.

The upstream footer's hostname/version referral was replaced with a static source link. No independent analytics SDK or automatic author telemetry endpoint was found in the application source. Next.js build telemetry and Wrangler usage metrics are disabled. Cloudflare observability remains available to the account owner for operational diagnostics. Explicitly configured email providers, DNS, Turnstile, push, avatar fetching, webhooks, AI providers, and GitHub update checks remain functional.

## Update

Run **Actions → EdgeMail upstream update → Run workflow**. The workflow merges upstream into a temporary branch, preserving EdgeMail commits, then tests and builds before pushing. Conflicts or failed checks stop the update without changing the deployed branch. A connected Cloudflare Git build can deploy the resulting push.

Locally:

```sh
git fetch upstream main
git merge upstream/main
npm ci
npm run db:bundle
node --test --test-concurrency=2 tests/*.test.mjs
npm run build
git push origin main
```

Do not use the upstream tree-replacement updater: it discards fork changes. After an update, use the existing administrator database migration action if needed. If upstream adds feature checks or telemetry, review those additions before deployment.

The internal Worker name remains `mailflare`, as required by upstream self-bindings and routing. The displayed product name defaults to EdgeMail and can be changed in Admin → Branding. English remains the default language.
