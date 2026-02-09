# Performance Playbook (Traefik + Nginx + Vite)

## 1) Build and budget check

```bash
pnpm run build
pnpm run perf:budget
```

## 2) Nginx config for static cache rules

Use `deploy/nginx/default.conf` in your frontend container.

- `index.html`: `Cache-Control: no-cache, must-revalidate`
- `assets/*` hashados: `Cache-Control: public, max-age=31536000, immutable`
- gzip enabled for text assets

## 3) Traefik middleware

Load `deploy/traefik/dynamic.performance.yml` in Traefik dynamic config and reference:

- `finnance-chain@file`

in your router labels (see `deploy/docker-compose.performance.example.yml`).

## 4) Validate headers in production

```bash
curl -I https://app.seu-dominio.com/index.html
curl -I https://app.seu-dominio.com/assets/<hash>.js
```

Expected:

- `index.html` with `no-cache, must-revalidate`
- `assets/*.js` with `max-age=31536000, immutable`
- gzip/br/zstd compression active when accepted by client

## 5) Validate first-load behavior

1. Open anonymous window.
2. DevTools > Network > Disable cache.
3. Throttling: Fast 4G.
4. Open `/auth/login` and confirm:
   - No white screen.
   - Login render quickly.
   - Only route-critical chunks loaded initially.

## 6) Lighthouse baseline

```bash
npx lighthouse https://app.seu-dominio.com/auth/login --view
```

Track:

- LCP
- FCP
- TBT
- JS transfer size
