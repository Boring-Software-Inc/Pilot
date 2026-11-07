# Tripwire shared spam blocklist

This list supports Tripwire's opt-in review pilot. When a pull request matches an active entry, Tripwire sends it to a maintainer for review.

## Suggest an addition or correction

Open a pull request adding or editing `entries/<accountId>.json`. Each file contains the string fields `accountId` (the numeric GitHub account ID), `login`, `reason` (up to 300 characters for public display), and `expiresAt` (a UTC timestamp such as `2027-01-31T00:00:00Z`). Use the ID, since GitHub usernames can change.

Include evidence in the pull request so a maintainer can verify the account and the report. Keep sensitive material private. An automated or unfamiliar account is insufficient evidence on its own.

To appeal an entry, contact a maintainer privately or open an issue without sensitive details. Community entries can be removed by pull request. Maintainers can remove Tripwire admin entries by running the **Publish blocklist** workflow with `operation: remove` and the account ID.

## Publication

After a change merges to `main`, GitHub Actions combines the reviewed entries with additions made by Tripwire platform admins and publishes [snapshot.json](../../blob/published/snapshot.json) on the `published` branch. Admin additions also appear in [staff-entries](../../tree/published/staff-entries) when present. The workflow refreshes the snapshot daily and leaves out expired entries. Tripwire stops using a snapshot if it is seven days old.
