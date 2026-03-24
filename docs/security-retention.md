# Security And Retention

## Baseline rules

- Use signed upload and download URLs.
- Validate MIME type, extension, and size on the server.
- Run processing in isolated workers with strict runtime limits.
- Log privileged account and billing events.
- Treat file deletion as product behavior, not best-effort cleanup.

## Retention

- Default artifact retention: 2 hours after processing.
- Support immediate manual deletion from the download flow.
- Signed-document retention can diverge later if legal requirements demand it.

## Key follow-up items

- Add malware scanning hook at upload time.
- Encrypt stored provider tokens and other sensitive secrets.
- Add replay protection and one-time download token semantics if required.
