FROM node:24-alpine AS notes-builder

RUN apk add --no-cache git

WORKDIR /quartz

COPY notes/quartz.ref /tmp/quartz.ref
RUN QUARTZ_REF="$(tr -d '\r\n' < /tmp/quartz.ref)" \
	&& git init . \
	&& git remote add origin https://github.com/jackyzha0/quartz.git \
	&& git fetch --depth 1 origin "$QUARTZ_REF" \
	&& git checkout --detach FETCH_HEAD \
	&& npm ci

COPY notes/quartz.config.yaml ./quartz.config.yaml
COPY notes/volcano.ref /tmp/volcano.ref
RUN VOLCANO_REF="$(tr -d '\r\n' < /tmp/volcano.ref)" \
	&& git init /vault \
	&& git -C /vault remote add origin https://github.com/KasperNr1/Volcano.git \
	&& git -C /vault fetch --depth 1 origin "$VOLCANO_REF" \
	&& git -C /vault checkout --detach FETCH_HEAD \
	&& rm -rf content \
	&& mkdir content \
	&& git -C /vault archive HEAD | tar -x -C content

COPY notes/index.md ./content/index.md
COPY notes/patch-quartz.mjs /tmp/patch-quartz.mjs
RUN npx quartz plugin install --from-config \
	&& mkdir .katex .d3 .pixi .mermaid \
	&& npm pack katex@0.16.11 --pack-destination /tmp \
	&& npm pack d3@7.9.0 --pack-destination /tmp \
	&& npm pack pixi.js@8.19.0 --pack-destination /tmp \
	&& npm pack mermaid@11.4.0 --pack-destination /tmp \
	&& tar -xzf /tmp/katex-0.16.11.tgz -C .katex --strip-components=1 \
	&& tar -xzf /tmp/d3-7.9.0.tgz -C .d3 --strip-components=1 \
	&& tar -xzf /tmp/pixi.js-8.19.0.tgz -C .pixi --strip-components=1 \
	&& tar -xzf /tmp/mermaid-11.4.0.tgz -C .mermaid --strip-components=1 \
	&& node /tmp/patch-quartz.mjs \
	&& npx quartz build

FROM nginx:alpine AS runtime

COPY index.html contact.html impressum.html datenschutz.html style.css components.js theme.js navigation.js /usr/share/nginx/html/
COPY components /usr/share/nginx/html/components
COPY gonzales /usr/share/nginx/html/gonzales
COPY --from=notes-builder /quartz/public/ /usr/share/nginx/html/notes/
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 8080

CMD ["/bin/sh", "-c", "export PORT=${PORT:-8080}; envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
