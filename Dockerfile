# ---- Base ----
FROM node:lts-alpine AS base
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy and install dependencies
COPY package*.json ./
RUN npm install --include=dev

# Copy all source files
COPY . .

# Build with Turbo
RUN npx turbo run build --filter=...

# ---- Runner ----
FROM node:lts-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy only necessary files from builder
COPY --from=base /usr/src/app ./

# Drop privileges for security
USER node
EXPOSE 3000

CMD ["npm", "start"]

