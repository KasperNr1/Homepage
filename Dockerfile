FROM node:24-alpine AS build

# Quartz clones its own source and the notes vault during the build.
RUN apk add --no-cache git

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Builds the pinned Quartz notes into public/notes, then the Astro site into dist.
RUN npm run build

FROM nginx:alpine AS runtime

COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 8080

CMD ["/bin/sh", "-c", "export PORT=${PORT:-8080}; envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
