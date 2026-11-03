# Contexto: raiz do projeto. O servidor reaproveita as regras de src/logica e o banco de palavras.
FROM node:22-alpine
WORKDIR /app
RUN echo '{"type":"module"}' > package.json
COPY servidor/package.json servidor/package-lock.json servidor/
RUN cd servidor && npm ci --omit=dev
COPY servidor/*.js servidor/
COPY src/logica src/logica
COPY src/data/personagens.js src/data/iniciante.json src/data/intermediario.json src/data/avancado.json src/data/
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s CMD wget -q -O /dev/null http://127.0.0.1:3000/saude || exit 1
CMD ["node", "servidor/principal.js"]
