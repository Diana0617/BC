# 📄 Cómo Generar el PDF de la Guía WhatsApp

Tienes **3 opciones** para convertir la guía a PDF:

---

## Opción 1: Script Automatizado con Node.js (Recomendado)

### Paso 1: Instalar Dependencias

```bash
cd c:/Users/merce/Desktop/desarrollo/BC
npm install --save-dev marked puppeteer
```

### Paso 2: Ejecutar el Script

```bash
node scripts/generate-whatsapp-guide-pdf.js
```

### Resultado

El PDF se generará en: `docs/GUIA_CONFIGURACION_WHATSAPP_META.pdf`

**Ventajas:**
- ✅ Totalmente automatizado
- ✅ Estilos profesionales incluidos
- ✅ Footer con número de página
- ✅ Índice clickeable
- ✅ Tablas bien formateadas

---

## Opción 2: Visual Studio Code + Extensión (Más Fácil)

### Paso 1: Instalar Extensión

1. Abre VS Code
2. Ve a Extensions (Ctrl+Shift+X)
3. Busca: **"Markdown PDF"** (autor: yzane)
4. Haz clic en "Install"

### Paso 2: Generar PDF

1. Abre el archivo `GUIA_CONFIGURACION_WHATSAPP_META.md` en VS Code
2. Presiona `F1` (o `Ctrl+Shift+P`)
3. Escribe: `Markdown PDF: Export (pdf)`
4. Presiona Enter

### Resultado

El PDF se generará en el mismo directorio con el nombre:
`GUIA_CONFIGURACION_WHATSAPP_META.pdf`

**Ventajas:**
- ✅ No requiere código
- ✅ Un solo clic
- ✅ Funciona offline

**Desventajas:**
- ⚠️ Estilos básicos
- ⚠️ Menos control sobre formato

---

## Opción 3: Herramientas Online (Sin Instalación)

### Opción 3A: Dillinger.io

1. Ve a: https://dillinger.io/
2. Copia y pega el contenido de `GUIA_CONFIGURACION_WHATSAPP_META.md`
3. Haz clic en "Export As" > "PDF"
4. Descarga el archivo

### Opción 3B: StackEdit

1. Ve a: https://stackedit.io/app
2. Copia y pega el contenido del Markdown
3. Haz clic en el ícono de menú (☰) > "Export to disk"
4. Selecciona "PDF"

### Opción 3C: Markdown to PDF (md2pdf.netlify.app)

1. Ve a: https://md2pdf.netlify.app/
2. Pega el contenido del Markdown
3. Haz clic en "Convert to PDF"
4. Descarga

**Ventajas:**
- ✅ No requiere instalación
- ✅ Funciona en cualquier navegador

**Desventajas:**
- ⚠️ Requiere internet
- ⚠️ Menos privacidad (subes tu contenido)
- ⚠️ Estilos limitados

---

## Opción 4: Pandoc (Para usuarios avanzados)

### Paso 1: Instalar Pandoc

**Windows:**
```bash
choco install pandoc
# O descargar desde: https://pandoc.org/installing.html
```

### Paso 2: Convertir

```bash
cd c:/Users/merce/Desktop/desarrollo/BC

pandoc GUIA_CONFIGURACION_WHATSAPP_META.md \
  -o docs/GUIA_CONFIGURACION_WHATSAPP_META.pdf \
  --pdf-engine=xelatex \
  --variable geometry:margin=2cm \
  --toc \
  --number-sections \
  -V colorlinks=true \
  -V linkcolor=blue \
  -V urlcolor=blue
```

**Ventajas:**
- ✅ Control total sobre formato
- ✅ Tabla de contenidos automática
- ✅ Numeración de secciones

**Desventajas:**
- ⚠️ Requiere LaTeX instalado (más complejo)

---

## 🎨 Personalizar Estilos (Opción 1)

Si usas la **Opción 1** (script Node.js), puedes personalizar los estilos editando:

```javascript
// scripts/generate-whatsapp-guide-pdf.js

const CSS_STYLES = `
<style>
  /* Cambiar color principal */
  h1 { color: #your-color; }
  
  /* Cambiar fuente */
  body { font-family: 'Georgia', serif; }
  
  /* Agregar logo en header */
  .doc-header:before {
    content: url('logo.png');
  }
</style>
`;
```

---

## 📊 Comparación de Opciones

| Opción | Dificultad | Calidad | Tiempo | Offline |
|--------|-----------|---------|--------|---------|
| Script Node.js | Media | ⭐⭐⭐⭐⭐ | 2 min | ✅ |
| VS Code Extension | Fácil | ⭐⭐⭐⭐ | 30 seg | ✅ |
| Online Tools | Muy Fácil | ⭐⭐⭐ | 1 min | ❌ |
| Pandoc | Difícil | ⭐⭐⭐⭐⭐ | 5 min | ✅ |

---

## 🚀 Recomendación

**Para presentaciones ejecutivas:**
- Usa **Opción 1** (Script Node.js) para mejor calidad y estilos profesionales

**Para revisión rápida:**
- Usa **Opción 2** (VS Code Extension) para generar rápidamente

**Si no puedes instalar nada:**
- Usa **Opción 3** (Online) pero evita subir información sensible

---

## ✅ Checklist Post-Generación

Después de generar el PDF, verifica:

- [ ] Todas las páginas se generaron correctamente
- [ ] Las tablas se ven completas (no cortadas)
- [ ] Los bloques de código son legibles
- [ ] Los emojis se renderizaron (o fueron removidos)
- [ ] Los links están clickeables (si aplica)
- [ ] El tamaño del archivo es razonable (< 10MB)
- [ ] La numeración de páginas es correcta

---

## 🐛 Solución de Problemas

### Problema: "puppeteer no se instala"

**Solución:**
```bash
# Instalar versión específica
npm install --save-dev puppeteer@21.0.0

# O usar puppeteer-core (más ligero)
npm install --save-dev puppeteer-core
```

### Problema: "Error de permisos al generar PDF"

**Solución:**
```bash
# Crear directorio docs manualmente
mkdir docs

# Ejecutar con permisos
sudo node scripts/generate-whatsapp-guide-pdf.js  # Linux/Mac
# O ejecutar terminal como Admin en Windows
```

### Problema: "Faltan imágenes en el PDF"

**Solución:**
Las imágenes deben estar en rutas relativas o absolutas. Si usas placeholders como:
```markdown
![Selección de tipo de app](docs/images/meta-app-type.png)
```

Asegúrate de que existan o cámbialas por URLs públicas.

---

## 📞 Ayuda

Si tienes problemas generando el PDF, puedes:

1. Enviarme el Markdown y yo te genero el PDF
2. Usar cualquiera de las opciones online (más fácil)
3. Reportar el error específico para ayudarte

---

**¿Cuál opción prefieres?** 😊
