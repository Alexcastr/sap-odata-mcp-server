# Servidor MCP para SAP OData

Este proyecto es un servidor del Protocolo de Contexto de Modelo (MCP) diseñado para actuar como un puente entre la IA de Claude y un servicio SAP OData. Permite a Claude consultar y interactuar con los datos de tu sistema SAP de forma segura y estructurada.

Esta guía proporciona los pasos detallados para clonar, configurar y ejecutar el servidor localmente, y luego integrarlo con la aplicación de escritorio de Claude.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado el siguiente software:

1. **Git:** Para clonar el repositorio. url[https://github.com/GutjahrAI/sap-odata-mcp-server]
2. **Node.js:** Se recomienda la versión 18 o superior. Es preferible gestionarlo a través de una herramienta como **FNM** (`Fast Node Manager`) para evitar problemas con las rutas del sistema.
3. **pnpm:** Un gestor de paquetes rápido y eficiente para Node.js. (`npm install -g pnpm`).
4. **Aplicación de Escritorio de Claude:** Donde se configurará el servidor MCP.

## Guía de Instalación y Configuración

Sigue estos pasos en orden para poner en marcha el servidor.

### Paso 1: Clonar y Preparar el Proyecto

Primero, obtén el código fuente y navega hasta el directorio del proyecto.

```bash
# 1. Clona el repositorio en tu máquina local
git clone <URL-de-tu-repositorio-git>

# 2. Navega al directorio del proyecto
cd sap-odata-mcp-server

# 3. (Opcional pero recomendado) Activa la versión correcta de Node.js con FNM
fnm use

# 4. Instala todas las dependencias del proyecto
pnpm install

```

### Paso 2: Configurar las Variables de Entorno

El servidor necesita credenciales para conectarse a tu servicio SAP OData. Estas se gestionan a través de un archivo `.env`.

1. En la raíz del proyecto `sap-odata-mcp-server`, crea un nuevo archivo llamado `.env`.
2. Copia y pega el siguiente contenido en el archivo, reemplazando los valores de ejemplo con tus credenciales reales.

```env
# Credenciales requeridas para la conexión OData de SAP
SAP_ODATA_BASE_URL="https://your-sap-host:8000/sap/opu/odata/sap/YOUR_SERVICE_NAME"
SAP_USERNAME="tu-usuario-sap"
SAP_PASSWORD="tu-contraseña-sap"
SAP_CLIENT="100"

# Configuración opcional
SAP_TIMEOUT=30000
SAP_VALIDATE_SSL=false
SAP_ENABLE_CSRF=true

```

### Paso 3: Compilar el Código TypeScript

El código fuente está escrito en TypeScript (`.ts`), pero Node.js ejecuta JavaScript (`.js`). El siguiente comando compila tu código y lo guarda en la carpeta `dist/`.

```bash
# Compila el proyecto
pnpm run build

```

Si todo va bien, verás una nueva carpeta `dist` en tu proyecto que contiene los archivos `.js` compilados.

### Paso 4: Configurar el Servidor en Claude Desktop

Este es el paso final donde conectas tu servidor local con Claude.

1. Abre la aplicación de escritorio de Claude.
2. Ve a **Configuración** (el ícono del engranaje) y luego selecciona la pestaña **Desarrollador**.
3. En la sección "Servidores MCP locales", haz clic en **Editar configuración**.
4. Añade una nueva entrada para tu servidor. Asígnale un nombre claro, por ejemplo, `sap-odata-local`.
5. **Configura los campos `command` y `args`:**

   * **`command` (Comando):** Este es el paso más importante. Necesitas la **ruta absoluta** al ejecutable de `node.exe` que estás utilizando. Para encontrarla, abre tu terminal (la misma que usaste en los pasos anteriores) y ejecuta:

      * En Git Bash, WSL o macOS: `which node`
      * En CMD de Windows: `where node`
      * Esto te dará una ruta como `C:\Users\tu-usuario\.fnm\node-versions\vXX.X.X\installation\node.exe`.

   * **`args` (Argumentos):** Esta es la ruta absoluta al archivo principal de tu servidor compilado, que es `index.js` dentro de la carpeta `dist`.

6. **Configura las variables de entorno (`env`):**

   * Dentro de la configuración del servidor en Claude, debes replicar las variables que pusiste en tu archivo `.env`.

7. __Ejemplo de Configuración Final:__
   Abre el archivo `claude_desktop_config.json` haciendo clic en el enlace de la UI o navegando a `%APPDATA%\Claude\claude_desktop_config.json` y asegúrate de que la entrada de tu servidor se vea así (recuerda usar dobles barras invertidas `\\` en las rutas de Windows):

```json
{
  "mcpServers": {
    "sap-odata": { // El nombre que le diste a tu servidor
      "command": "C:\\Users\\acast\\AppData\\Local\\fnm_multishells\\20064_1753455152836\\node.exe",
      "args": [
        "C:\\Users\\acast\\sap-odata-mcp-server\\dist\\index.js"
      ],
      "env": {
        "SAP_ODATA_BASE_URL": "http://s4h24.sap4practice.com:8024/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV",
        "SAP_USERNAME": "user name",
        "SAP_PASSWORD": "user passw",
        "SAP_CLIENT": "100",
        "SAP_VALIDATE_SSL": "false"
      }
    }
  }
}

```

8. **Guarda los cambios** y reinicia la aplicación de Claude.

### Paso 5: Verificación

Vuelve a `Configuración > Desarrollador`. El estado de tu servidor `sap-odata` debería cambiar a **running** en color azul. ¡Si es así, lo has logrado! Ya puedes empezar a usar las herramientas de tu servicio SAP OData en Claude.

## Troubleshooting (Solución de Errores Comunes)

- **ERROR: `MCP sap-odata: spawn node ENOENT`**

   - **Causa:** La aplicación de Claude no puede encontrar el ejecutable de `node`. Esto es muy común cuando se usan gestores de versiones como `fnm`.
   - **Solución:** No uses `node` en el campo `command`. Usa la ruta absoluta y completa al archivo `node.exe` como se describe en el **Paso 4**.

- **ERROR: `Server disconnected`**

   - **Causa:** El script de Node.js se inició pero se cerró inmediatamente debido a un error interno.
   - **Solución:** Haz clic en el botón **"Abrir carpeta de registro"** en la pantalla de Desarrollador de Claude. Busca un archivo llamado `sap-odata.log` (o el nombre que le diste a tu servidor). El mensaje de error real estará dentro de este archivo.

- **ERROR: `ReferenceError: exports is not defined in ES module scope`**

   - **Causa:** Hay un conflicto entre el sistema de módulos que tu `package.json` declara y el formato al que TypeScript está compilando.
   - **Solución:** Asegúrate de que el archivo `package.json` **NO** contenga la línea `"type": "module"`. Luego, verifica que tu archivo `tsconfig.json` tenga `"module": "commonjs"` en las `compilerOptions`. Finalmente, elimina la carpeta `dist` y vuelve a compilar el proyecto con `pnpm run build`.

```markdown
# Dockerfile for MCP-server


```dockerfile
# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app

# Instala pnpm globalmente
RUN npm install -g pnpm

# Copia sólo package.json y lockfile para cachear instalación
COPY package.json pnpm-lock.yaml ./

# Instala todas las dependencias
RUN pnpm install --frozen-lockfile

# Copia la configuración de TypeScript y el código fuente
COPY tsconfig.json ./
COPY src ./src

# Compila el proyecto
RUN pnpm run build

# Stage 2: producción
FROM node:20-alpine
WORKDIR /app

# Define modo producción
ENV NODE_ENV=production

# Copia build y dependencias de producción
COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml ./

# Instala sólo dependencias de producción
RUN npm install -g pnpm \
    && pnpm install --prod --frozen-lockfile

# Copia tu .env (variables como PORT, SAP_*, etc.)
COPY .env .env

# Expone el puerto de tu servidor
EXPOSE 8007

# Arranca la aplicación
CMD ["node", "dist/index.js"]

```

---

## .dockerignore

```text
node_modules
dist
npm-debug.log*
.vscode
.git
.gitignore
README.md
Dockerfile
docker-compose.yml

```

---

## docker‑compose.yml

```yaml
version: '3.8'

services:
  mcp-server:
    build: .
    env_file:
      - .env
    ports:
      - "8007:8007"
    restart: unless-stopped

```

## command for run docker

- Construir imagen

```bash

docker build -t sap-odata-mcp-server .



```

- Ejecutar contenedor standalone

```bash
docker run -d \
  --name mcp-server \
  --env-file .env \
  -p 8007:8007 \
  sap-odata-mcp-server \
  --service    http://s4h24.sap4practice.com:8007/sap/opu/odata/sap/ \
  --username   user name \
  --password   passw here \
  --validateSSL false \
  --entities   A_PurchaseOrder,A_PurchaseOrderItem,A_PurchaseOrderNote


```

- Levantar con Docker Compose

```bash
docker-compose up --build


```

---

## SAP‑OData‑MCP‑Server Configuration

Añade este bloque JSON en tu `README.md` (o en la sección de configuración) para explicar cómo invocar el MCP dentro del contenedor Docker:

```json
{
  "sap-catalog": {
    "command": "docker",
    "args": [
      "exec",
      "-i",
      "mcp-server",
      "node",
      "/app/dist/index.js",
      "--service",
      "http://s4h24.sap4practice.com:8007/sap/opu/odata/sap/",
      "--user",
      "user name",
      "--password",
      "passw here",
      "--validateSsl",
      "false",
      "--entities",
      "A_PurchaseOrder,A_PurchaseOrderItem,A_PurchaseOrderNote"
    ]
  }
}
```

```text

```