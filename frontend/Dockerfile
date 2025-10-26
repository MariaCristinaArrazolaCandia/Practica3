FROM node:20

WORKDIR /frontend

# Copiamos package.json y (si existe) package-lock.json desde ESTA carpeta
COPY package.json package-lock.json* /frontend/

RUN npm install

# Copiamos el resto del código React
COPY . /frontend

CMD ["npm", "start"]
