FROM nginx:alpine
COPY index.html style.css /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/templates/default.conf.template
