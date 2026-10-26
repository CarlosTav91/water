# Trazadores ambientales · Water Congress 2026

Presentación web *scrollytelling* de la ponencia **"Selección y aplicación de trazadores ambientales para cuantificar filtraciones de relaves en acuíferos salinos"** (WES Perú · Water Congress 2026).

Cada sección se anima al hacer scroll: diagramas que se dibujan, escenas fijadas (pin), contadores, un mapa conceptual y una **calculadora interactiva de mezcla de dos componentes**.

## Estructura

```
index.html        Página única
css/styles.css    Estilos (tema oscuro, responsive)
js/main.js        Animaciones (GSAP + ScrollTrigger), calculadora y navegación
assets/           Imágenes (foto aérea, logos, captura de Fraktal, QR)
.nojekyll         Indica a GitHub Pages que sirva los archivos tal cual
```

Librerías cargadas desde CDN (no requiere instalación ni compilación): GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13 (scroll suave), Lucide 0.468.0 (íconos) y Google Fonts (Oswald, Roboto).

## Publicar en GitHub Pages

1. Cree un repositorio nuevo en GitHub (por ejemplo `trazadores-wc2026`).
2. Suba **el contenido de esta carpeta** (`index.html` debe quedar en la raíz del repositorio):
   ```bash
   git init
   git add .
   git commit -m "Presentación web Water Congress 2026"
   git branch -M main
   git remote add origin https://github.com/<usuario>/trazadores-wc2026.git
   git push -u origin main
   ```
   También puede arrastrar los archivos en GitHub → *Add file → Upload files*.
3. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. En uno o dos minutos la página estará en `https://<usuario>.github.io/trazadores-wc2026/`.

## Ver en local

```bash
python -m http.server 8000
```

y abra `http://localhost:8000`. (Abrir `index.html` con doble clic también funciona.)

## Notas de contenido

- El perfil tipo Schoeller, el mapa de estaciones y las bandas temporales son **esquemas conceptuales**; reemplácelos por los datos del sitio cuando estén confirmados.
- La etiqueta de los isótopos ("línea independiente") debe ajustarse a "realizada" o "recomendada" según el alcance real de la verificación isotópica.
- Confirme los permisos para publicar la captura de Fraktal System y las afiliaciones de los autores antes de hacer público el repositorio.
- Accesibilidad: con *reducir movimiento* activado en el sistema, la página se muestra completa y sin animaciones.
