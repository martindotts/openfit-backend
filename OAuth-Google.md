# 🧠 OAuth 2.0 + OpenID Connect - Login con Google (Web)

Este documento explica paso a paso lo que sucede detrás del botón "Iniciar sesión con Google" usando OAuth 2.0 + OpenID Connect.

---

## 🔧 Participantes

1. **Usuario**: Quiere iniciar sesión en tu app.
2. **Tu App (Cliente)**: La aplicación que solicita acceso.
3. **Google (Authorization Server)**: Valida identidad y otorga tokens.
4. **Tu Backend (opcional)**: Maneja sesión y guarda tokens.

---

## 🔄 Flujo paso a paso

### 1. El usuario hace clic en "Iniciar sesión con Google"

Tu app redirige al navegador del usuario a la siguiente URL:

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=...&
  redirect_uri=...&
  response_type=code&
  scope=openid email profile&
  state=xyz
```

### 🔍 Parámetros de la URL

| Parámetro       | Significado                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| `client_id`     | Identificador único de tu aplicación registrado en Google Developer Console |
| `redirect_uri`  | URL a la que Google redirige tras el login (debe coincidir con lo registrado) |
| `response_type` | Debe ser `code` para indicar que se solicita un código de autorización      |
| `scope`         | Permisos solicitados. `openid` activa OIDC. `email`, `profile` añaden info del usuario |
| `state`         | Valor aleatorio para prevenir ataques CSRF                                  |

---

### 2. Google autentica al usuario

- Pide correo y contraseña si no está logueado.
- Muestra los permisos que solicita tu app.
- Si el usuario acepta, redirige a:

```
https://tu-app.com/callback?code=abc123&state=xyz
```

---

### 3. Tu backend intercambia el código por tokens

Envía un `POST` a:

```
https://oauth2.googleapis.com/token
```

Con el siguiente `body`:

```
client_id=...&
client_secret=...&
code=abc123&
redirect_uri=...&
grant_type=authorization_code
```

### 🔐 Tokens recibidos

```json
{
  "access_token": "ya29...",
  "expires_in": 3600,
  "id_token": "eyJhbGciOi...",
  "token_type": "Bearer"
}
```

---

### 4. Tu app decodifica el `id_token` (JWT)

Contiene:

```json
{
  "sub": "1234567890",
  "email": "user@gmail.com",
  "name": "Juan Pérez",
  "picture": "https://...",
  "aud": "tu-client-id",
  "iss": "https://accounts.google.com",
  "exp": 1711234567
}
```

✔️ No es necesario hacer otra petición para saber quién es el usuario.

---

### 5. Tu app inicia la sesión

- Si es nuevo, lo registra.
- Crea su sesión en tu sistema (cookie, JWT, etc).
- El usuario entra a la app.

---

## 🧾 Resumen de tokens

| Token         | Contiene                                      | Uso                        |
|---------------|-----------------------------------------------|----------------------------|
| `id_token`    | Información del usuario (login)               | Identificar al usuario     |
| `access_token`| Permisos para acceder a APIs de Google        | Llamadas a recursos        |
| `refresh_token`| Renovar los tokens (si se solicita `offline_access`) | Sesiones prolongadas       |

---

## 🛡️ Notas de seguridad

- Verificá firma, `aud`, `iss`, `exp` del `id_token`.
- Usá HTTPS.
- Para frontend puro, usá PKCE.
- No uses `access_token` para autenticar usuarios directamente.

---

## ✅ Requisitos

- Tener una cuenta en [Google Developer Console](https://console.developers.google.com/)
- Registrar tu aplicación y configurar correctamente los redirect URIs
