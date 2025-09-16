# VS Code / Dev Memory Optimization Guide

Este documento resume acciones concretas para reducir el consumo de memoria observado (procesos múltiples de VS Code: renderer, extension host, tsserver, file watchers, lenguaje Vue/React, eslint, etc.).

## 1. Entender los procesos que ves
| Tipo proceso | Señal típica | Motivo principal |
|--------------|-------------|------------------|
| Renderer (ventana) | >500 MB | Árbol de dependencias + editor UI + webviews |
| Extension Host | 200–600 MB | Carga de todas las extensiones habilitadas |
| TS Server principal | 300–800 MB | Indexa proyectos TS/TSX/Vue (varios) |
| TS Syntax Server (si separado) | 50–150 MB | Soporte de autocompletado rápido |
| Watcher / file watcher | 20–100 MB | Observa cambios en árbol de archivos |
| Volar / Vue language service | 150–400 MB | Análisis SFC + tipos |
| ESLint server | 80–250 MB | AST + reglas + tipos |

Abrir un monorepo con 3 frontends + backend causa multiplicación de grafos de tipos y AST.

## 2. Cambios ya aplicados
- `pnpm-workspace.yaml` para permitir hoisting.
- Ajustes iniciales en `.vscode/settings.json` para excluir `dist`, `node_modules`, etc.
- Batch en importador de alumnos para evitar picos en runtime.

## 3. Ajustes adicionales recomendados (VS Code)
Añade o adapta en `.vscode/settings.json` según necesidad:
```jsonc
{
  // Evita crear SyntaxServer separado (combina en uno solo)
  "typescript.tsserver.useSeparateSyntaxServer": false,
  // Desactiva diagnósticos de proyectos grandes en segundo plano
  "typescript.tsserver.experimental.enableProjectDiagnostics": false,
  // Baja la agresividad de completado
  "editor.quickSuggestions": { "other": false, "strings": false, "comments": false },
  // Guarda sólo lo necesario
  "files.autoSave": "off",
  // Ejecuta ESLint sólo al guardar
  "eslint.run": "onSave",
  // Minimiza decoraciones
  "problems.decorations.enabled": false,
  // Desactiva semantic highlighting si aún consume mucho
  "editor.semanticHighlighting.enabled": false
}
```

### Extensiones: desactivar selectivamente
1. Abre: Command Palette → `Extensions: Show Running Extensions`.
2. Identifica >150 MB y desactiva temporalmente (Disable (Workspace)).
3. Extensiones que más memoria suelen usar: ESLint, Volar, Tailwind CSS, GitLens.

### Workbench sin extras
```jsonc
"git.enabled": false,          // si usas CLI afuera
"gitlens.enabled": false,      // temporal
"scss.validate": false,
"css.validate": false          // si no editas CSS activamente
```

## 4. Consolidación de dependencias
Acción pendiente: unificar versiones de `zod` y `@trpc/*`.

Comandos sugeridos (verifica breaking changes antes):
```bash
pnpm why zod
pnpm add zod@latest -F admin -F client -F web-vue -F server
```

## 5. Estrategia de trabajo para reducir carga
| Estrategia | Beneficio |
|------------|-----------|
| Abrir sólo un paquete (carpeta) cuando editas ese frontend | Menos grafos de tipos simultáneos |
| Usar `code --disable-extensions` para sesiones de revisión | Evita carga de extension host |
| Ejecutar lint/build desde terminal externo | Quita watchers internos de VS Code |
| Cerrar pestañas inactivas (preview mode) | Menos modelos de texto en memoria |

## 6. Modo análisis vs edición
Cuando sólo vas a leer código:
```bash
code . --disable-workspace-trust --disable-extensions
```
> Pierdes IntelliSense avanzado pero reduces la huella.

## 7. Backend y CSV (runtime futuro)
- Cambiar `multer` a almacenamiento en disco para archivos grandes.
- Repetir patrón de `BATCH` en importadores restantes (clases/servicios/carga académica) si los CSV pueden ser enormes.

## 8. Docker optimizado (Pendiente)
Evitar instalar `server` dentro de imágenes `admin` y `client`. Ejemplo base (admin):
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY pnpm-lock.yaml package.json ./
RUN pnpm fetch
COPY . .
RUN pnpm -F admin build
FROM nginx:alpine
COPY --from=build /app/packages/admin/dist /usr/share/nginx/html
```

## 9. Diagnóstico adicional
### a) Log TS Server (temporal)
Command Palette → `TypeScript: Open TS Server log`. Observa memoria reportada; si >1.5GB en un sólo server, fragmenta el workspace.

### b) Profiling del Extension Host
Command Palette → `Developer: Show Running Extensions` → botón `Start Extension Host Profile`. Para detectar extensiones culpables.

### c) Medir watchers
En terminal (PowerShell):
```powershell
(Get-Process -Name code).Length   # Número de procesos
```

## 10. Checklist sugerido de acción rápida
- [ ] Añadir settings avanzados arriba (SyntaxServer off / projectDiagnostics off)
- [ ] Desactivar extensiones no críticas (GitLens, Tailwind si no se edita UI) 
- [ ] Unificar `zod`
- [ ] Optimizar Dockerfiles
- [ ] Refactor importadores restantes a batch
- [ ] Cambiar `multer` a disco
- [ ] Ejecutar ESLint sólo al guardar
- [ ] Usar ventana separada por paquete cuando trabajes en uno

## 11. Umbrales de referencia (aprox.)
| Escenario | Uso razonable total |
|-----------|---------------------|
| Monorepo 4 paquetes + extensiones pesadas | 1.5–2.5 GB |
| 1 paquete (frontend) + ESLint | 700–1100 MB |
| Modo lectura sin extensiones | <500 MB |

Si después de aplicar todo sigues viendo >3 GB sólo con el proyecto abierto, revisa antivirus/seguridad corporativa (pueden duplicar watchers) o desactiva temporalmente Windows Defender para carpeta (exclusión) y compara.

## 12. Preguntas frecuentes
**¿Eliminar `node_modules` ayuda?** Solo momentáneamente; luego TS reindexa de nuevo. Mejor reducir número de paquetes abiertos.

**¿Puedo limitar memoria del proceso principal?** No directamente; puedes reducir insumos (menos extensiones, menos proyectos, watchers excluidos).

---
Si quieres, el próximo paso puedo aplicarte directamente los ajustes extra en `settings.json` y preparar refactor de los otros importadores. Indícame cuáles priorizamos.
