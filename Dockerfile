# Stage 1: build
FROM node:22.11.0-bullseye AS builder
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
FROM node:22.11.0-bullseye
WORKDIR /app

# Define modo producción
ENV NODE_ENV=production

# Copia sólo lo necesario: el build y las deps de producción
COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml ./

# Instala sólo dependencias de producción
RUN npm install -g pnpm \
    && pnpm install --prod --frozen-lockfile


# Expone el puerto que usa tu servidor (ajusta si tu .env define otro)
EXPOSE 8007

# Arranca la aplicación desde el build
CMD ["node", "dist/index.js"]
