# ---- Base ----
FROM node:lts-alpine AS base
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Install dependencies for all workspaces with proper caching
COPY package.json ./
COPY turbo.json ./
COPY apps ./apps
COPY packages ./packages

# Install with workspaces, include dev deps for building
RUN npm install --workspaces --include=dev

# Build all workspaces
RUN npx turbo run build

# ---- Runner ----
FROM node:lts-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy only necessary files from base
COPY --from=base /usr/src/app .

# Drop privileges for security
USER node
EXPOSE 3000

CMD ["npm", "start"]
