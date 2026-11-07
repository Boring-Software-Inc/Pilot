import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const now = Date.now();
const iso = (value) =>
	typeof value === "string" &&
	/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(value) &&
	Number.isFinite(Date.parse(value));

function validateEntry(entry) {
	assert.deepEqual(Object.keys(entry).sort(), ["accountId", "expiresAt", "login", "reason"]);
	assert.ok(typeof entry.accountId === "string" && /^[1-9][0-9]*$/.test(entry.accountId), "Invalid account ID");
	assert.ok(typeof entry.login === "string" && /^[a-z\d](?:[a-z\d-]{0,98}[a-z\d])?$/i.test(entry.login), "Invalid GitHub login");
	assert.ok(typeof entry.reason === "string" && entry.reason === entry.reason.trim() && entry.reason.length > 0 && entry.reason.length <= 300, "Invalid public reason");
	assert.ok(iso(entry.expiresAt), "Invalid expiry");
	return entry;
}

function readEntries(directory) {
	const entries = new Map();
	if (!existsSync(directory)) return entries;
	for (const file of readdirSync(directory, { withFileTypes: true })) {
		assert.ok(file.isFile(), `Expected a regular file in ${directory}`);
		if (file.name === ".gitkeep") continue;
		assert.match(file.name, /^[1-9][0-9]*\.json$/, "Name each entry <accountId>.json");
		const entry = validateEntry(JSON.parse(readFileSync(join(directory, file.name), "utf8")));
		assert.equal(file.name, `${entry.accountId}.json`);
		entries.set(entry.accountId, entry);
	}
	assert.ok(entries.size <= 10_000, "Too many entries");
	return entries;
}

const community = readEntries("entries");
const output = process.argv[2];
if (output) {
	const staffDirectory = join(output, "staff-entries");
	const staff = readEntries(staffDirectory);
	const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
	const inputs = event.inputs;
	if (inputs?.operation === "add") {
		const entry = validateEntry({
			accountId: inputs.accountId,
			login: inputs.login,
			reason: inputs.reason,
			expiresAt: inputs.expiresAt,
		});
		assert.ok(Date.parse(entry.expiresAt) > now, "Expiry must be in the future");
		assert.ok(![community, staff].some((entries) => Date.parse(entries.get(entry.accountId)?.expiresAt) > now), "Account already has an active entry");
		staff.set(entry.accountId, entry);
		writeFileSync(join(staffDirectory, `${entry.accountId}.json`), JSON.stringify(entry, null, 2) + "\n");
	} else if (inputs?.operation === "remove") {
		assert.ok(staff.delete(inputs.accountId), "No staff entry for that account ID");
		rmSync(join(staffDirectory, `${inputs.accountId}.json`));
	} else {
		assert.ok(!inputs?.operation || inputs.operation === "refresh", "Unknown operation");
	}
	const entries = new Map();
	for (const entry of [...staff.values(), ...community.values()]) {
		if (Date.parse(entry.expiresAt) > now) entries.set(entry.accountId, entry);
	}
	assert.ok(entries.size <= 10_000, "Too many active entries");
	const snapshotPath = join(output, "snapshot.json");
	const previous = JSON.parse(readFileSync(snapshotPath, "utf8"));
	const snapshot = {
		version: 1,
		revision: previous.revision + 1,
		publishedAt: new Date(now).toISOString(),
		entries: [...entries.values()].sort((a, b) => a.accountId.localeCompare(b.accountId, "en")),
	};
	writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + "\n");
}
