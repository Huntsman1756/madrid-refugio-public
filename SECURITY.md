# Security Notes

## Secret management

- Real secrets must never be committed to the repository.
- Public configuration templates belong in `.env.example` only.
- Local runtime files such as `.env`, `.env.local` and `.env.vps` must stay outside version control.

## Runtime secrets currently used by the project

- `AEMET_API_KEY`: optional, used for live weather data from AEMET.
- `GITHUB_TOKEN` or `GH_TOKEN`: optional, used for authenticated GitHub release asset downloads.

## Operational guidance

- If any real token has been stored in a local `.env` file, rotate it before sharing or publishing the project.
- Prefer per-environment secret stores provided by the hosting platform.
- Do not place temporary deployment tokens in tracked documentation or scripts.

## Public repo hygiene

- Keep deployment architecture documentation aligned with the real production setup.
- Treat `Railway` as optional unless it is actively used in production.
- Avoid publishing internal-only endpoints, access tokens or environment exports in markdown examples.
