---
name: Seal
startYear: 2026
link: https://github.com/darylcecile/seal
tokens: [library]
---

Seal is a small CLI that replaces ad-hoc `.env` files with secrets stored in OS-native credential stores (macOS Keychain, libsecret on Linux, Windows Credential Manager) or external password managers like 1Password and Bitwarden. Secrets are injected at runtime as environment variables for the command you run, and are never persisted in plaintext on disk.

Seal is intentionally narrow — it exists to make one developer's local machine a safer place to keep the secrets that would otherwise sit in a `.env` file next to their checkout. It isn't a replacement for production secret delivery, team sharing, or CI/CD secret stores; reach for purpose-built tools when those are what you need. Seal is the answer to *"I keep needing local secrets on my laptop and I'm tired of `.env` files in `~/Downloads`."*
