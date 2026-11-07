import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

test("publishes reviewed and staff entries, rejects duplicates and honors expiry and removal", (t) => {
	const cwd = mkdtempSync(join(tmpdir(), "tripwire-publish-"));
	t.after(() => rmSync(cwd, { recursive: true, force: true }));
	mkdirSync(join(cwd, "entries"));
	mkdirSync(join(cwd, "published/staff-entries"), { recursive: true });
	const write = (path, data) => writeFileSync(join(cwd, path), JSON.stringify(data));
	write("published/snapshot.json", { version: 1, revision: 1, entries: [] });
	const reviewed = { accountId: "10", login: "test-community", reason: "Fixture", expiresAt: "2099-01-01T00:00:00Z" };
	const staff = { ...reviewed, accountId: "20", login: "test-staff" };
	write("entries/10.json", reviewed);
	write("entries/30.json", { ...reviewed, accountId: "30", expiresAt: "2000-01-01T00:00:00Z" });
	const publish = (inputs) => {
		write("event.json", { inputs });
		execFileSync(process.execPath, [new URL("./snapshot.mjs", import.meta.url).pathname, "published"], {
			cwd,
			env: { ...process.env, GITHUB_EVENT_PATH: join(cwd, "event.json") },
			stdio: "pipe",
		});
		return JSON.parse(readFileSync(join(cwd, "published/snapshot.json"), "utf8"));
	};
	assert.deepEqual(publish().entries, [reviewed]);
	const added = publish({ ...staff, operation: "add" });
	assert.equal(added.revision, 3);
	assert.deepEqual(added.entries, [reviewed, staff]);
	assert.throws(() => publish({ ...staff, operation: "add" }), /Account already has an active entry/);
	assert.deepEqual(publish({ operation: "remove", accountId: staff.accountId }).entries, [reviewed]);
});
