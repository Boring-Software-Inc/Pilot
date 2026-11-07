# Tripwire shared spam blocklist

This repository publishes the snapshot used by Tripwire's opt-in review pilot. A match sends a pull request to a maintainer for review.

Open a pull request to change the snapshot. Use the GitHub account's numeric ID, record the login for reference, provide a short reason suitable for display, and set an expiry date. Reviewers should verify the account and check the evidence before merging. Keep sensitive evidence in a restricted channel and omit it from this repository.

To report a mistaken entry or request removal, contact a repository maintainer through GitHub's private reporting channel if available, or open an issue without including sensitive material. Maintainers can remove an entry with a reviewed change. Record the revision and update `publishedAt` whenever publishing a snapshot, including a refresh with no entry changes. Tripwire stops using snapshots after seven days.

The pilot starts with an empty list. Do not add accounts merely because they look unusual or are automated.
