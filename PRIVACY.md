# Privacy

AI Research Quest is a static, client-side Demo.

## Data flow

- The application has no account system, analytics, telemetry or application server.
- After the browser loads static HTML, CSS, JavaScript and the public demo data, application code does not send user input to the network.
- Current state and exam free text remain in page memory. The application does not write them to localStorage, sessionStorage or IndexedDB.
- Refreshing or closing the page clears the in-memory session.
- A download occurs only after the user clicks an export button. The browser creates a local `Blob` and saves it to the user's device; the application does not upload the file.

A static hosting provider may still receive ordinary request metadata when serving page assets, according to that provider's policy. AI Research Quest does not add user-input payloads, telemetry identifiers or analytics events to those requests.

## Safe input

Use only public, simulated, adapted or already deidentified content. Do not enter:

- email addresses, names or other personal identifiers;
- passwords, API keys, access tokens or credentials;
- private absolute paths, server details or internal URLs;
- private code, unpublished results, datasets or model checkpoints.

Export checks reject common email, credential, token, private-path and excessive-length patterns. Pattern checks reduce accidental disclosure but cannot prove that arbitrary text is safe. The user remains responsible for reviewing every downloaded file before sharing it.

## Demo data

Bundled scenarios are illustrative only. Their provenance and privacy fields explicitly state that they contain no real research results. `privacy.sanitization.review_status: approved` means an independent audit checked a specific candidate snapshot; it is not a general guarantee for later edits or user-entered text.

## Questions

For a security-sensitive privacy issue, follow [SECURITY.md](SECURITY.md) instead of posting the details in a public issue.
