# Incluído em cada location: no Nginx, um add_header dentro de location
# descarta os do nível de cima.
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header X-Frame-Options "DENY" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
# 'unsafe-inline' e data: porque o plugin legado do Vite injeta scripts de detecção de recursos; o React usa style inline.
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' data:; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'" always;
