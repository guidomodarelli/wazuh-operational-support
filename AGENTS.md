# Guía para decidir entre crear o editar documentos en la documentación de Astro

> Proyecto: **Astro** (documentación interna para responder preguntas de comunidades/users). Este archivo define **cómo decidir** si crear un nuevo documento o **editar** uno existente, y provee un **prompt reutilizable** para que un asistente ("Codex") automatice el análisis.

---

## 1) Objetivo

Estandarizar el flujo de **triage de consultas** (preguntas, dudas, feature requests, bugs) para mantener una base de conocimiento clara, actualizada y sin duplicados. El asistente debe:

* Detectar si la consulta ya está cubierta por la documentación actual.
* Decidir entre **editar**/ampliar un doc existente o **crear** uno nuevo.
* Proponer cambios concretos (rutas, títulos, diffs o borradores).

## 2) Contexto del repositorio

* Framework: **Astro**.
* Estructura típica esperada:

  * `src/content/docs/**` → contenido Markdown/MDX.
  * `src/pages/**` → rutas y páginas.
  * `public/**` → assets.
  * `astro.config.*` y `src/layouts/**` → layouts para docs.
* Convención de archivos: `kebab-case.md` (sin espacios ni mayúsculas). Un doc por tema.
* Idioma principal: **English**.

## 3) Metadatos (Frontmatter sugerido)

Usar al inicio de cada doc:

```yaml
---
title: "Título claro"
description: "Resumen en una frase orientado a búsqueda (SEO interno)"
tags: ["faq", "how-to", "bug", "feature-request"]
status: "published" # o "draft"
last_reviewed: "YYYY-MM-DD"
owner: "@tu-usuario"
---
```

## 4) Estilo de contenido

* Empieza con **TL;DR** (máx. 4 líneas).
* Luego sigue el orden: **Contexto → Pasos → Ejemplos → Troubleshooting → Referencias**.
* Tono directo, orientado a la acción. Evitar ambigüedades.
* Usar encabezados `##`/`###` para mejorar indexación y navegación.
* Incluir ejemplos reproducibles y fragmentos de código cuando aplique.

## 5) Criterios de decisión (¿editar o crear?)

**Editar un doc existente** cuando:

1. La consulta es una **variación** o **complemento** del mismo tema ya cubierto.
2. Faltan **pasos**, **matices**, **capturas** o **edge cases**.
3. El usuario se confunde repetidamente en la **misma página** → agregar FAQ o nota aclaratoria.

**Crear un doc nuevo** cuando:

1. La consulta introduce un **tema distinto** (nuevo flujo, propósito o funcionalidad).
2. Cambia el **público objetivo** o el **contexto** (ej. "cloud" vs. "self-hosted").
3. Es un **procedimiento completo** que merece un doc propio.
4. Existe riesgo de sobrecargar un doc existente con casos no relacionados.

**Reglas prácticas**:

* Si el nuevo contenido ocupa >30% del doc existente o rompe su foco → **nuevo archivo**.
* Si son 1–2 párrafos adicionales, un ejemplo o una nota → **editar**.
* Si es sólo una **pregunta puntual** sobre un doc → agregar sección **FAQ**.

## 6) Taxonomía y rutas

* Carpeta por área: `src/content/docs/{area}/tema.md`.
* Evitar duplicar slugs; preferir **redirigir** o **consolidar**.
* Añadir `tags` descriptivos para mejorar la búsqueda.

## 7) Flujo de trabajo recomendado

1. **Analizar** la consulta: intención, contexto, entorno, error, versión.
2. **Buscar** coincidencias en títulos, headings y descripciones (y en el cuerpo si es posible).
3. Si **match ≥ alto** (mismo tema): **editar contenido existente**.
4. Si **match medio** (parcial): evaluar si corresponde subsección/FAQ o doc nuevo.
5. Si **match bajo** o nulo: proponer **nuevo doc** con ruta, frontmatter y esquema.

## 8) Notas específicas de Astro

* Preferir `.md` para simplicidad; usar `.mdx` solo si se requiere JSX.
* Mantener imports/remark/rehype mínimos.
* Probar la ruta local con `npm run dev` y validar enlaces antes de hacer merge.
