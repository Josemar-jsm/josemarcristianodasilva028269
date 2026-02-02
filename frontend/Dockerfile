FROM node:20-alpine AS build
WORKDIR /app

COPY pss-web/package*.json ./
RUN npm install

COPY pss-web .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/pss-web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

