# ZenTrip - Backend (Node.js)

API REST del proyecto ZenTrip, construida con **Express** y **Firebase Admin SDK**. Se encarga de la autenticación de usuarios mediante tokens de Firebase y expone los endpoints del servidor.

---

## Tecnologías

- [Node.js](https://nodejs.org/)
- [Express 5](https://expressjs.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [dotenv](https://github.com/motdotla/dotenv)
- [CORS](https://github.com/expressjs/cors)

---

## Estructura del proyecto

```
Zentrip-Node/
├── server.js                        # Punto de entrada de la aplicación
├── src/
│   ├── config/
│   │   ├── env.js                   # Carga y exporta variables de entorno
│   │   └── firebase.js              # Inicialización de Firebase Admin SDK
│   ├── controllers/
│   │   └── userControllers.js       # Lógica de negocio para usuarios
│   ├── middlewares/
│   │   └── authMiddleware.js        # Verificación de token Firebase (Bearer)
│   ├── routes/
│   │   └── userRouters.js           # Definición de rutas de usuario
│   └── services/
│       ├── external/
│       │   └── apiService.js        # Llamadas a APIs externas
│       └── firebase/
│           └── firestoreService.js  # Operaciones con Firestore
├── .env                             # Variables de entorno (no subir al repo)
├── package.json
└── Readme.md
```

---

## Instalación

```bash
# Clona el repositorio
git clone https://github.com/ZenTrip-DAW/ZenTrip.git
cd ZenTrip/Zentrip-Node

# Instala las dependencias
npm install
```

---

## Configuración

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=5000
```

Además, coloca el archivo de credenciales de Firebase (`serviceAccountKey.json`) en la ruta configurada en `server.js` o bien configura las credenciales mediante variables de entorno.

---

## Ejecución

```bash
node server.js
```

El servidor arranca por defecto en `http://localhost:5000`.

---

## Endpoints

-- En desarrollo...

### Autenticación

Las rutas protegidas requieren un token de Firebase en la cabecera:

```
Authorization: Bearer <firebase_id_token>
```

---

## Variables de entorno

| Variable | Descripción              | Valor por defecto |
|----------|--------------------------|-------------------|
| `PORT`   | Puerto del servidor      | `5000`            |
