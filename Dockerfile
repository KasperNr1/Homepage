FROM nginx:alpine
COPY index.html impressum.html datenschutz.html style.css /usr/share/nginx/html/
COPY gonzales /usr/share/nginx/html/gonzales
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 8080

CMD ["/bin/sh", "-c", "export PORT=${PORT:-8080}; envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
