# Despliegue automático a Hostinger

Cada `git push` a `main` compila el frontend en GitHub (no en tu servidor) y sube
solo los archivos ya compilados por SSH. El backend se sincroniza y actualiza
(`composer install`, migraciones) también por SSH, sin que tú tengas que entrar
manualmente cada vez. Tu servidor nunca necesita Node.js.

Esto se configura **una sola vez**. Después, actualizar es solo hacer push.

## 1. Estructura en Hostinger

Necesitas dos carpetas/dominios en tu hosting:

- Uno para el **frontend** (archivos estáticos): por ejemplo `public_html/` de tu
  dominio principal, o `public_html/app/` si usas un subdominio como `app.tudominio.com`.
- Uno para el **backend** (Laravel): fuera de `public_html` si puedes (por seguridad),
  con su `public/` apuntado como document root de un subdominio, por ejemplo
  `api.tudominio.com` → document root = `.../backend/public`.

En hPanel: **Dominios → Subdominios** para crear `api.tudominio.com`, y en
**Hosting → Administrar → Dominios/PHP** puedes ajustar el document root de cada uno.

## 2. Clave SSH para GitHub Actions

En tu ordenador (no en el servidor):

```bash
ssh-keygen -t ed25519 -f deploy_key -N ""
```

Esto genera `deploy_key` (privada) y `deploy_key.pub` (pública).

**Añade la pública a Hostinger** — en hPanel → **Avanzado → SSH Access** → pega el
contenido de `deploy_key.pub`. O por SSH ya conectado con tu usuario/contraseña normal:

```bash
mkdir -p ~/.ssh
echo "CONTENIDO_DE_deploy_key.pub" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## 3. Secretos en GitHub

En el repo: **Settings → Secrets and variables → Actions → New repository secret**.
Añade estos (los datos de host/puerto/usuario están en hPanel → **Avanzado → SSH Access**):

| Secreto | Valor |
|---|---|
| `HOSTINGER_SSH_HOST` | IP o host SSH de Hostinger |
| `HOSTINGER_SSH_PORT` | Puerto SSH (Hostinger suele usar `65002`, no el 22) |
| `HOSTINGER_SSH_USER` | Tu usuario SSH de Hostinger |
| `HOSTINGER_SSH_KEY` | Contenido completo del archivo `deploy_key` (la **privada**) |
| `HOSTINGER_FRONTEND_PATH` | Ruta absoluta donde sirves el frontend, ej. `/home/USUARIO/public_html` |
| `HOSTINGER_BACKEND_PATH` | Ruta absoluta donde vive el backend, ej. `/home/USUARIO/backend` |
| `VITE_API_URL` | URL pública de tu API, ej. `https://api.tudominio.com/api` |

## 4. Primer despliegue manual del backend (solo una vez)

Los workflows automáticos asumen que el backend ya existe en el servidor y solo lo
**actualizan**. La primera vez, hazlo tú por SSH:

```bash
ssh -p PUERTO usuario@host
cd ~/backend   # o donde hayas decidido ponerlo
git clone <tu-repo> .   # o sube backend/ por SFTP si prefieres no usar git ahí
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
# Edita .env: DB_CONNECTION=mysql (crea la BD en hPanel → Bases de datos) y FRONTEND_URL
php artisan migrate --force
php artisan storage:link
```

Configura también el **cron de Laravel** si lo necesitas (hPanel → Cron Jobs):
```
* * * * * php /home/USUARIO/backend/artisan schedule:run >> /dev/null 2>&1
```

## 5. A partir de aquí

- Cambios en `frontend/` → push a `main` → GitHub compila y sube `dist/` por SSH.
- Cambios en `backend/` → push a `main` → GitHub sincroniza el código, corre
  `composer install`, `migrate --force` y cachea config/rutas, todo automático.
- Puedes disparar cualquiera de los dos manualmente desde la pestaña **Actions** del
  repo en GitHub (botón "Run workflow"), sin necesidad de hacer push.

## Notas

- `--delete` en el rsync del frontend borra en el servidor lo que ya no exista en
  `dist/` — así el destino siempre refleja exactamente el último build.
- El backend excluye `vendor/`, `.env`, `storage/` y la base de datos del sync, así
  que nunca se sobrescriben con el `composer install`/`migrate` remotos.
- Si tu plan de Hostinger no tiene `composer` en el `PATH` por defecto, prueba
  `php ~/composer.phar install ...` o revisa la ruta exacta con `which composer`
  dentro de una sesión SSH.
