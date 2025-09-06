# CHANGELOG.md

Registro de cambios. Se actualiza en cada edición o creación de archivo hecha por el asistente, incrementando versión según impacto (SemVer: MAJOR.MINOR.PATCH).

## Convenciones
- Versionado: SemVer.
- Incremento por defecto: PATCH en cada cambio puntual de documentación o contenido.
- MINOR: adiciones relevantes (nuevas secciones/páginas completas) sin romper estructura.
- MAJOR: cambios que rompen rutas/slug o estructura global.
- Formato por versión: fecha ISO, lista de cambios con archivo(s) y resumen.

---

## 1.1.0 - 2025-09-06

- Added: new guide to resolve hostname vs `agent.name` mismatch in the Wazuh dashboard via clean re-registration. File: `src/content/docs/guides/agent-name-hostname-mismatch-dashboard.md`.
- Updated: sidebar to include the new guide under Guides. File: `astro.config.mjs`.

## 1.0.0 - 2025-09-06

- Removed: top-level "Reference" section from the sidebar. File: `astro.config.mjs`.
- Removed: directory `src/content/docs/reference/` and its pages (breaking change; routes under `/reference/*` removed).

## 0.3.0 - 2025-09-06

- Added: new "Getting Started" page to help readers understand how to use and navigate the documentation. File: `src/content/docs/overview/getting-started.md`. Includes TL;DR, Context, Steps, Examples, Troubleshooting, and References.
- Updated: homepage hero to link "Getting Started" first. File: `src/content/docs/index.mdx`.
- Updated: sidebar to include a top-level "Getting Started" section. File: `astro.config.mjs`.

## 0.2.0 - 2025-09-06

- Added: new guide to resolve Wazuh API `55000` connection timeouts caused by GCP firewall rules. File: `src/content/docs/guides/wazuh-api-55000-connection-timeout-gcp.md`. Also added to sidebar.

## 0.1.1 - 2025-09-06

- Added: actualización de `AGENTS.md` para requerir edición de `CHANGELOG.md` en cada cambio o archivo nuevo.

## 0.1.0 - 2025-09-06

- Added: creación de `CHANGELOG.md` y definición de la estructura, convenciones y política de incremento.
