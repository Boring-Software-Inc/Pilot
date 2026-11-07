# Tripwire shared spam blocklist

This list supports Tripwire's opt-in review pilot. When a pull request matches an active entry, Tripwire sends it to a maintainer for review.

## Suggest an addition or correction

[Suggest an account](../../issues/new?title=Suggest%20an%20account) with its GitHub username or profile URL, a short description of what happened, and any public evidence. Keep sensitive material private. An automated or unfamiliar account is insufficient evidence on its own.

A maintainer verifies the report and can publish through Tripwire Admin, which looks up the numeric GitHub account ID. Maintainers can also open a direct PR editing `entries/<accountId>.json` with the string fields `accountId`, `login`, `reason` (up to 300 characters for public display), and `expiresAt` (a UTC timestamp such as `2027-01-31T00:00:00Z`).

To appeal an entry, contact a maintainer privately or open an issue without sensitive details. Community entries can be removed by pull request. Maintainers can remove Tripwire admin entries by running the **Publish blocklist** workflow with `operation: remove` and the account ID.

## Publication

After a change merges to `main`, GitHub Actions combines the reviewed entries with additions made by Tripwire platform admins and publishes [snapshot.json](../../blob/published/snapshot.json) on the `published` branch. Admin additions also appear in [staff-entries](../../tree/published/staff-entries) when present. The workflow refreshes the snapshot daily and leaves out expired entries. Tripwire stops using a snapshot if it is seven days old.
