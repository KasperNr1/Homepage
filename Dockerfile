FROM node:24-alpine AS site-builder

RUN apk add --no-cache git

WORKDIR /workspace

COPY . .

RUN node scripts/build-site.mjs \
	--output /site-public \
	--cache /tmp/homepage-cache \
	--force

FROM nginx:alpine AS runtime

COPY --from=site-builder /site-public/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 8080

CMD ["/bin/sh", "-c", "export PORT=${PORT:-8080}; envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
