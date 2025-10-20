# ---- Base ----
FROM node:lts-alpine AS base
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Install Turbo globally (optional) and copy package files
COPY package*.json ./
RUN npm install --include=dev

# Copy all source files
COPY . .

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
