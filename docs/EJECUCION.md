# Guía de ejecución

Cómo levantar el sistema completo en tu máquina, de cero.

El proyecto son **dos repositorios** que se ejecutan a la vez:

| Repositorio             | Qué es        | Dónde queda             |
| ----------------------- | ------------- | ----------------------- |
| `marine-fleet-backend`  | La API        | `http://localhost:3000` |
| `marine-fleet-frontend` | La página web | `http://localhost:5173` |

> **Este documento está en los dos repositorios, igual.** Si lo modificas, actualiza las dos copias.

---

## 1. Requisitos

Antes de empezar necesitas instalado:

- **Node.js 22 o superior** — comprueba con `node -v`
- **Una base PostgreSQL** — un proyecto gratuito de [Supabase](https://supabase.com)
  (recomendado: no hay nada que instalar) o PostgreSQL 15 o superior en tu equipo
- **Git**

---

## 2. Clonar los dos repositorios

Ponlos en la misma carpeta, uno al lado del otro:

```bash
git clone https://github.com/Samydap/marine-fleet-backend.git
```

```bash
git clone https://github.com/Samydap/marine-fleet-frontend.git
```

---

## 3. Preparar la base de datos

**Opción A — Supabase (recomendada).**

1. Crea un proyecto en [supabase.com](https://supabase.com) y guarda la contraseña de la base que
   te pide.
2. En el proyecto pulsa **Connect** (arriba), pestaña **Connection String**, método
   **Session pooler**, y copia la cadena. Se ve así:
   `postgresql://postgres.<id-del-proyecto>:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres`.
   Va en el `.env` del paso 4.2.

Usa el **Session pooler** y no la conexión directa: la directa solo funciona por IPv6.

> Las **API keys** de Supabase (`anon`, `service_role`) no sirven aquí: son para la API REST de
> Supabase. El backend se conecta directo a la base con la cadena de conexión.

**Opción B — PostgreSQL en tu equipo.** Crea una base vacía, por ejemplo desde `psql`:

```sql
CREATE DATABASE marina;
```

En los dos casos, las tablas, los triggers y los datos de prueba los crean los pasos 4.3 y 4.4
(`migration:run` y `seed`).

> También puedes crearlos desde el **SQL Editor** de Supabase pegando
> `database/supabase/01_esquema.sql` y luego `02_datos.sql`. Si lo haces así, el paso 4.3 solo
> registra la migración y no vuelve a crear nada. La carpeta `database/supabase` explica qué
> hace cada script.

---

## 4. Levantar el backend

Abre una terminal **en la carpeta `marine-fleet-backend`**:

**4.1. Instala las dependencias** (solo la primera vez, tarda un par de minutos):

```bash
npm install
```

**4.2. Crea el archivo de configuración** copiando el de ejemplo:

```bash
cp .env.example .env
```

En Windows PowerShell, si `cp` no te funciona:

```bash
Copy-Item .env.example .env
```

Abre el archivo `.env` y ajusta dos cosas:

- **La base de datos:**
  - Con Supabase, pega en `DATABASE_URL` la cadena del paso 3 y cambia `[YOUR-PASSWORD]` por
    la contraseña de la base. Si la contraseña tiene símbolos como `@`, `#` o `/`, cámbiala
    en Supabase por una de solo letras y números, o la cadena no se entiende. El SSL se activa
    solo.
  - Con PostgreSQL local, deja `DATABASE_URL` comentada y usa `DB_HOST`, `DB_PORT`,
    `DB_USER`, `DB_PASSWORD` y `DB_NAME`.
- **Fotos y carteles (Supabase Storage):** en `SUPABASE_URL` va la Project URL
  (`https://<id>.supabase.co`) y en `SUPABASE_SERVICE_ROLE_KEY` la llave **secreta** del
  proyecto (**Project Settings → API Keys**, la `sb_secret_...` o la `service_role`). Nunca
  la `anon` ni la `publishable`. Así todo el equipo ve las mismas fotos y carteles; sin ellas
  se guardan solo en tu disco. El bucket se crea solo.
- **`JWT_SECRET` y `JWT_REFRESH_SECRET`**: cambia el texto de ejemplo por cualquier cadena de
  **mínimo 32 caracteres**. Si son más cortas, la aplicación no arranca.

**4.3. Crea todas las tablas** (catálogos, criminales, recompensas, operativos, incidentes,
auditoría, triggers, etc.):

```bash
npm run migration:run
```

**4.4. Carga los datos de prueba** (roles, un usuario por rol, mares, bases navales,
organizaciones, criminales con su historial de recompensas, avistamientos, operativos,
incidentes y criterios de amenaza). Se puede repetir sin duplicar nada:

```bash
npm run seed
```

**4.5. Arranca la API:**

```bash
npm run start:dev
```

Déjala corriendo. Cuando veas que arrancó, la API queda en `http://localhost:3000` y la
documentación interactiva de todos los endpoints en:

**`http://localhost:3000/api/docs`**

---

## 5. Levantar el frontend

Abre una **segunda terminal**, sin cerrar la anterior, **en la carpeta `marine-fleet-frontend`**:

**5.1. Instala las dependencias** (solo la primera vez):

```bash
npm install
```

**5.2. Arranca la página:**

```bash
npm run dev
```

Abre en el navegador:

**`http://localhost:5173`**

No necesitas configurar nada más: el frontend está preparado para hablar con el backend en
`http://localhost:3000` automáticamente.

---

## 6. Usuarios de prueba

El comando `npm run seed` del paso 4.4 crea un usuario por cada rol. Todos usan la misma
contraseña:

| Correo                                 | Rol                          |
| -------------------------------------- | ---------------------------- |
| `almirante@marina.gov`                 | Almirante                    |
| `director_inteligencia@marina.gov`     | Director de Inteligencia     |
| `analista_datos_criminales@marina.gov` | Analista de Datos Criminales |
| `coordinador_operaciones@marina.gov`   | Coordinador de Operaciones   |
| `desarrollador_backend@marina.gov`     | Desarrollador Backend        |
| `especialista_seguridad@marina.gov`    | Especialista en Seguridad    |
| `capitan@marina.gov`                   | Capitán de Base              |

**Contraseña para todos:** `Marina.2026`

Cada rol ve un menú distinto según sus permisos.

---

## 7. El día a día

Una vez hecha la instalación, cada vez que te sientes a trabajar son solo tres pasos:

1. **La base de datos**: con Supabase no hay que hacer nada. Con PostgreSQL local, comprueba que
   el servicio esté encendido.
2. **Terminal 1**, en `marine-fleet-backend`:

```bash
npm run start:dev
```

3. **Terminal 2**, en `marine-fleet-frontend`:

```bash
npm run dev
```

Y abre `http://localhost:5173`.

Para detener cualquiera de los dos servidores, pulsa `Ctrl + C` en su terminal.

Los pasos de instalación (`npm install`, `.env`, `migration:run`, `seed`) **no se repiten**,
salvo que alguien agregue dependencias o migraciones nuevas. En ese caso, después de un
`git pull`, vuelve a correr:

```bash
npm install && npm run migration:run
```

---

## 8. Problemas frecuentes

**`"DATABASE_URL" with value ... fails to match the cadena de conexion de PostgreSQL pattern`**
Pegaste otra cosa en `DATABASE_URL`, por ejemplo una API key. Debe empezar por
`postgresql://`: cópiala de **Connect → Connection String → Session pooler**.

**`ECONNREFUSED` o el backend no arranca y menciona la base de datos**
Con PostgreSQL local, el servicio no está encendido o `DB_HOST`/`DB_PORT` no coinciden. Con
Supabase, revisa que la cadena sea la del Session pooler.

**`ENOTFOUND` o `ENETUNREACH` con un host `db.<id>.supabase.co`**
Esa es la conexión directa, que solo funciona por IPv6. Copia la del **Session pooler**.

**`password authentication failed for user ...`**
La contraseña de la cadena no es la de la base, o quedó `[YOUR-PASSWORD]` sin cambiar. Si no
la recuerdas, cámbiala en **Project Settings → Database → Reset database password**.

**`no pg_hba.conf entry ... no encryption` o `SSL required`**
La conexión no va cifrada. Quita `DB_SSL=false` del `.env` si lo pusiste.

**`database "marina" does not exist`**
Falta el paso 3: crea la base vacía (en Supabase la base se llama `postgres`).

**El backend se cierra nada más arrancar mencionando `JWT_SECRET`**
Las claves de `.env` son demasiado cortas. Deben tener mínimo 32 caracteres.

**`Port 3000 is already in use` o `Port 5173 is already in use`**
Ya tienes ese servidor corriendo en otra terminal. Ciérrala, o busca y cierra el proceso.

**La página carga pero no muestra datos**
Falta el backend. Comprueba que la terminal 1 siga corriendo y entra a
`http://localhost:3000/api/docs` para confirmarlo.

**`npm install` falla**
Comprueba que tienes Node 22 o superior con `node -v`. Si el error persiste, borra la carpeta
`node_modules` y el archivo `package-lock.json` y vuelve a intentarlo.
