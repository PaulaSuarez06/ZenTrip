<div align="center">

<img src="https://res.cloudinary.com/dgph0sewo/image/upload/v1779507852/logo_ZenTrip_psxmmi.png" alt="Logo ZenTrip" width="350">

</div>

<br>

Organizar un viaje en grupo es un caos. Grupo de WhatsApp, cientos de mensajes, encuestas perdidas, enlaces por todas partes, conversaciones que no tienen nada que ver... Zentrip nace para acabar con esto.

El nombre lo dice: **Zen** (tranquilidad) + **Trip** (viaje). Una app donde tienes todo lo que necesitas para organizar un viaje, ya sea en grupo o en solitario, sin perder la cabeza.

Es para todos: para los que disfrutan organizando, para los que no quieren ni pensar en ello pero les gustaría saber qué pasa cada día, y para cualquiera que quiera viajar sin estrés.

Nosotras la creamos porque la necesitábamos. La idea es simple: que tu viaje esté organizado, que el grupo decida junto, y que disfrutes el viaje sin pensar en logística.

---

## 1. Introducción y justificación

### Breve descripción de la aplicación

ZenTrip es una aplicación web que centraliza todo lo necesario para organizar viajes individuales y grupales. Su finalidad es eliminar la fragmentación de información que existe cuando se planifica un viaje: en lugar de usar múltiples plataformas (WhatsApp, correos, enlaces dispersos), los usuarios tienen un único lugar donde pueden crear itinerarios, hacer reservas, gestionar presupuestos, invitar a amigos y compartir experiencias.

### Objetivos

Una vez puesto en marcha, ZenTrip permite que los usuarios:

- Planifiquen viajes completos desde la creación hasta el regreso
- Inviten y colaboren con otros viajeros en tiempo real
- Busquen y guarden reservas de vuelos, hoteles, restaurantes y actividades
- Gestionen presupuestos individuales y grupales
- Coordinen listas de equipaje compartidas
- Compartan fotos y mensajes con los miembros del grupo
- Tomen decisiones grupales mediante votaciones
- Publiquen itinerarios y compartan inspiración con otros viajeros

### Motivación

Organizar un viaje en grupo es un caos. Grupo de WhatsApp, cientos de mensajes, encuestas perdidas, enlaces por todas partes, conversaciones que no tienen nada que ver... Zentrip nace para acabar con esto.

El nombre lo dice: Zen (tranquilidad) + Trip (viaje). Una app donde tienes todo lo que necesitas para organizar un viaje, ya sea en grupo o en solitario, sin perder la cabeza.

Es para todos: para los que disfrutan organizando, para los que no quieren ni pensar en ello pero les gustaría saber qué pasa cada día, y para cualquiera que quiera viajar sin estrés.

Nosotras la creamos porque la necesitábamos. La idea es simple: que tu viaje esté organizado, que el grupo decida junto, y que disfrutes el viaje sin pensar en logística.

---

## 2. Análisis y diseño del proyecto

### 2.1. Descripción de la arquitectura web

ZenTrip tiene una arquitectura SPA, cliente-servidor. La aplicación carga una sola página HTML y React gestiona la navegación.

**Frontend:** Se encarga de mostrar la interfaz al usuario, gestionar el flujo de la navegación y realizar peticiones tanto al backend como a Firebase.

**Backend:** API REST con Node.js y Express. Gestiona la lógica de negocio, validaciones, operaciones protegidas por token y comunicación con APIs.

**Base de datos:** Almacena la información de usuarios, viajes, reservas, invitaciones, actividades e itinerarios. Se puede acceder desde el frontend y el backend dependiendo de la funcionalidad. Desde el frontend se traen los datos en tiempo real.

**Autenticación:** Gestionada por Firebase Authentication. Firebase genera los tokens de autenticación y el backend los verifica con Firebase Admin SDK. De esta manera, permite verificar los permisos de los usuarios para acceder a ciertas rutas.

**Comunicación:** La aplicación realiza peticiones HTTP para llevar el token en la cabecera que autoriza el retorno de la información, logrando comunicar de esta manera el frontend y el backend mediante una API REST.

El frontend se comunica con la base de datos (Firebase) directamente sin pasar por el backend para funcionalidades de almacenamiento y dar datos en tiempo real. En cuanto al backend, interviene cuando el frontend hace peticiones en funcionalidades que requieren ser protegidas, verificando los permisos. El backend también permite la conexión con APIs externas.

### 2.2. Tecnologías y herramientas utilizadas

**Frontend:**
- React + Vite: Como framework de la interfaz.
- React Router: Enrutar y dirigir el flujo de la web.
- React Select: Selects personalizados.
- Tailwind CSS: Estilos.
- Firebase: Base de datos, operaciones en tiempo real.
- @react-google-maps/api: Integración de mapas de Google.
- Cloudinary: Subida de imágenes.
- Lucide React: Iconos.
- DiceBear: Avatars para personalizar tu foto de perfil.

**Backend:**
- Node.js: Como entorno para ejecución.
- Express: Framework para hacer las peticiones HTTP.
- Firebase: Verificación de token.
- Axios: Peticiones HTTP a APIs externas.
- JWT: Tokens para invitaciones.
- Mailjet: Envío de correos de invitación.

**Base de datos:**
- Firebase: Base de datos no relacional en la nube.

**Integración y pruebas:**
- Postman: Pruebas de los endpoints del backend.
- Pruebas manuales de flujos de usuario y comportamiento de interfaz.

**Seguridad:**
- reCAPTCHA de Google: Para login y registro.
- Token: Verificación por token de Firebase.
- Protected router: Rutas protegidas según el tipo de usuario.
- .env: Variables de entorno.
- Expiración de sesión: Gestionada en AuthContext.

**Despliegue y hosting:**
- Vercel: Tanto el backend como el frontend están desplegados en Vercel.

**Otras herramientas:**
- Figma: Diseño de la interfaz.

### 2.3. Análisis de usuarios

#### Usuario no registrado

**Necesidades:** Ver viajes que le comparten amigos y conocidos.

Solo puede ver viajes públicos compartidos por URL y puede registrarse e iniciar sesión.

#### Usuario registrado (Miembros/viajeros)

**Necesidades:** Organizar el viaje y tener una vista que les permita hacerlo con mayor facilidad y automáticamente. Desea compartir sus viajes y buscar inspiración de otros.

**Puede:**
- Crear y organizar viajes en solitario y en grupo.
- Invitar a otros usuarios.
- Buscar hoteles, vuelos, restaurantes y actividades.
- Planificar rutas.
- Gestionar presupuesto propio y grupal.
- Colaborar en el equipaje en grupo.
- Votar para tomar decisiones.
- Ver y añadir nuevas actividades al itinerario.
- Subir y descargar fotos del viaje.
- Gestionar su perfil y personalizarlo.
- Recibir notificaciones de invitaciones y reservas.
- Participar en la comunidad guardando itinerarios de viajeros, comentar y dar me gusta.
- Publicar viajes en los que están invitados.
- Chatear con miembros del viaje.
- Leer ideas de viajes.

#### Organizador de un viaje (creador del viaje)

**Necesidades:** Limitar que otras personas terminen echando a perder la planeación.

Puede hacer lo de los usuarios anteriores más gestionar los participantes, agregando y eliminando. También puedes editar o eliminar el viaje.

#### Administrador

**Necesidades:** Publicar contenido de inspiración para otros usuarios, siendo el único que puede modificar el contenido global.

Puede hacer todo lo de los usuarios anteriores más:
- Acceder al panel de administrador para agregar, editar o eliminar los contenidos que se ven en el home como las imágenes de inspiración y las lecturas.

### 2.4. Requisitos funcionales y no funcionales

#### Requisitos Funcionales

Principales funcionalidades de la aplicación:

- Registro e inicio de sesión con email o cuenta de Google.
- Verificación de email al registrarse.
- Creación y gestión de viajes individuales y grupales.
- Sistema de invitaciones por email y grupales.
- Búsqueda de vuelos, hoteles, coches, restaurantes y actividades.
- Guardado de reservas dentro del viaje.
- Planificación de itinerario con actividades.
- Votaciones grupales para tomar decisiones.
- Gestión de presupuesto y gastos del viaje.
- Control de equipaje individual y grupal.
- Galería de fotos del viaje.
- Chat entre miembros del viaje.
- Notificaciones en tiempo real.
- Publicar itinerarios con opción de dar me gusta, comentar y guardar.
- Gestión de perfil de usuarios.
- Panel de administración para gestionar "Explorar" e "inspiración" para lecturas e imágenes de inspiración respectivamente.

#### Requisitos No Funcionales

Rendimiento, usabilidad, seguridad, accesibilidad:

**Usabilidad:** La interfaz es intuitiva y no requiere aprendizaje previo para utilizarla. Notifica al usuario si la operación tuvo éxito o si tuvo algún error.

**Responsive:** La aplicación se adapta a dispositivos móviles y de escritorio.

**Rendimiento:** La carga inicial es rápida. Guarda información en el local storage para evitar hacer múltiples llamadas a la base de datos y al backend.

**Seguridad:** Las contraseñas no se exponen, las gestiona Firebase. Las claves externas de APIs externas están ocultas. Las rutas están protegidas según el rol.

**Privacidad:** Los miembros del viaje pueden elegir qué compartir.

### 2.5. Estructura de navegación

#### Páginas principales y rutas

Las rutas de ZenTrip están organizadas en tres tipos principales según lo que pueda hacer cada usuario. Rutas públicas (los usuarios sin autenticar pueden acceder), rutas protegidas (sólo pueden acceder los usuarios autenticados) y las rutas de administrador (a las que solo pueden acceder los administradores)

![Mapa de navegación de ZenTrip](https://res.cloudinary.com/dgph0sewo/image/upload/v1779506583/2.5_estructura_de_navegacion.drawio_1_i2bkan.png)

#### Flujo de navegación

Cuando llegas sin registrarte, ves la landing y contenido público. Si intentas entrar a algo protegido, te manda a login. Una vez que te registras e inicias sesión, Firebase verifica quién eres y guarda un token. A partir de ahí puedes acceder a todo. Si eres admin, además tienes acceso al panel. Mientras el token sea válido sigues dentro, cuando expire te saca a login.

La idea es que cuando entras veas directo el home (/home), desde donde puedes crear un viaje, entrar en uno que ya tienes, explorar destinos, ver qué comparte la gente... Y dentro de un viaje todo está en pestañas, así no te abruma tener todo de golpe.

![Diseño del sitio - Parte 1](https://res.cloudinary.com/dgph0sewo/image/upload/v1779506931/2.5_1_sj3la8.png)

![Diseño del sitio - Parte 2](https://res.cloudinary.com/dgph0sewo/image/upload/v1779507031/2.5_2_ezpukb.png)

![Diseño del sitio - Parte 3](https://res.cloudinary.com/dgph0sewo/image/upload/v1779507032/2.5_3_mixs1b.png)

### 2.6. Organización de la lógica de negocio

#### Estructura del backend

El backend está hecho con Node.js y Express. Todo está dividido para que sea fácil trabajar.

Primero están las rutas (en /src/routes/), que son los endpoints de la API. Tenemos una para cada cosa: autenticación, usuarios, viajes, invitaciones, vuelos, hoteles, coches, restaurantes, actividades, traducción…

Después los controladores (en /src/controllers/), que reciben las peticiones, procesan lo que necesitan y llaman a los servicios. Los servicios (en /src/services/) son donde ocurre la lógica real. Algunos hablan con Firebase Firestore para guardar y traer datos, otros se conectan con APIs externas como Booking.com, Google Places, Nominatim, Mailjet y Cloudinary. La ventaja de tenerlo así separado es que si en algún momento queremos cambiar de proveedor, solo tocamos el servicio, el resto no se entera.

Los middlewares (en /src/middlewares/) son como filtros. El de autenticación verifica que tu token de Firebase sea válido cada vez que haces una petición protegida. También tenemos uno que valida reCAPTCHA en el login para evitar bots, y uno que maneja errores centralizadamente.

#### Conexión con APIs de terceros

Usamos bastantes APIs externas. Firebase maneja todo lo de autenticación y login. Firestore es donde guardamos todo: viajes, reservas, mensajes, notificaciones, todo. Booking.com a través de RapidAPI nos da los vuelos, hoteles y actividades. Google Places para los restaurantes, Google Translate para traducir contenidos, Google reCAPTCHA para proteger el login, Nominatim de OpenStreetMap para resolver coordenadas de ciudades y aeropuertos, Mailjet para mandar los emails de invitación, Cloudinary para guardar imágenes, y Open-Meteo para el tiempo.

### 2.7. Modelo de datos simplificado

En nuestro caso, optamos por una base de datos no relacional almacenada en Firestore, ya que cada viaje es diferente, unos pueden reservar hotel, otro solo actividades… De esta manera, permitimos al usuario que pueda crear viajes complejos con múltiples tipos de reservas y datos sin limitaciones, mientras la aplicación escala automáticamente.

#### Colecciones

| Colección | Descripción |
|-----------|-------------|
| trips | Viajes creados por el usuario |
| trips/{tripId}/members | Miembros participantes en un viaje |
| trips/{tripId}/activities | Actividades y planes del viaje |
| trips/{tripId}/bookings | Reservas (hoteles, vuelos, restaurantes, etc.) |
| trips/{tripId}/expenses | Gastos compartidos entre miembros |
| trips/{tripId}/payments | Pagos/liquidaciones entre miembros |
| notifications | Notificaciones para usuarios |

#### Relaciones

| De | A | Tipo | Descripción |
|----|----|------|-------------|
| trips | users | 1:1 | Creador del viaje |
| members | users | 1:1 | Miembro participante |
| activities | bookings | 1:1 | Actividad vinculada a reserva |
| activities | users | 1:1 | Creador de la actividad |
| bookings | activities | 1:1 | Check-in de la reserva |
| bookings | users | 1:1 | Usuario que hizo la reserva |
| expenses | users | 1:1 | Usuario que pagó |
| expenses | users | 1:N | Usuarios entre quienes se divide |
| expenses | bookings | 1:1 | Gasto vinculado a reserva |
| expenses | activities | 1:1 | Gasto vinculado a actividad |
| payments | users | 1:1 | Usuario que paga (from) |
| payments | users | 1:1 | Usuario que recibe (to) |
| payments | expenses | 1:1 | Pago asociado a gasto |
| notifications | users | 1:1 | Usuario receptor |
| notifications | trips | 1:1 | Viaje relacionado |

---

## 3. Conclusiones

### Resultados obtenidos y cumplimiento de objetivos

Cuando empezamos con este proyecto, teníamos muchas ideas. Queríamos que los usuarios pudieran hacer casi todo en una sola aplicación: planificar un viaje, invitar a amigos, reservar, guardar las reservas, hacer listas de equipaje, subir fotos...

Y conseguimos la mayoría de cosas que nos propusimos. Un usuario puede planificar un viaje completo, invitar a sus amigos, hacer reservas a través de un enlace y adjuntarlas en su dashboard, crear listas de equipaje y subir fotos del viaje, entre otras funcionalidades.

### Retos encontrados y soluciones implementadas

Lo complicado fue integrar las APIs. Al principio queríamos usar Amadeus para hacer reservas de verdad, pero cerraron el acceso a nuevos desarrolladores. Así que acabamos usando RapidAPI, pero tampoco es lo ideal: tienes que pagar más si necesitas muchas llamadas y además los resultados no son tan completos como en Booking.

El diseño tardó mucho más de lo que pensábamos. Pero valió la pena porque después, cuando empezamos a hacer los componentes, todo fue mucho más rápido. Visualmente ya teníamos claro cómo tenía que ser todo.

### Aprendizajes y mejoras futuras

Por falta de tiempo no pudimos implementar la funcionalidad de viajar con mascotas. Era algo que queríamos añadir para que los usuarios pudieran filtrar sitios donde sí se pueden llevar animales. Pero entre el tiempo y los problemas con las APIs, se quedó sin hacer. Es algo que se podría desarrollar en el futuro si encontramos mejores integraciones de APIs.

### Organización y seguimiento del proyecto

#### Metodología utilizada

Para organizarnos usamos Jira. Cada dos semanas hacíamos una reunión de planificación y nos repartíamos las tareas en el kanban con fechas. Esto nos permitió mantener el control del proyecto y asegurar que todos íbamos al mismo ritmo.

#### Deviaciones de la planificación

**Fases que tardaron más:**
- El diseño de la aplicación fue mucho más tiempo de lo esperado. Sin embargo, esto tuvo un impacto positivo, ya que una vez terminado, la creación de componentes fue más rápida.

**Funcionalidades no completadas:**
- Filtro de viajes con mascotas: No pudimos desarrollar la opción de mostrar al usuario a qué sitios puede ir con su mascota. Esto se debió tanto a la falta de tiempo como a las limitaciones de las APIs disponibles que no proporcionaban esa información.
- Tampoco es posible realizar la reserva directamente desde la aplicación, como mencionamos anteriormente por no ser partner de plataformas como Booking o AirBnb.

#### Mejoras futuras

A futuro, el chat debería tener un intermediario como RabbitMQ o Redis para no sobrecargar la base de datos. Básicamente, los mensajes se guardarían en una cola en lugar de ir directo a la BD, así cuando hay muchas peticiones no hay retraso en la llegada de mensajes. El usuario recibiría su respuesta al instante sin tener que esperar a que todo se procese.

---

## 4. Bibliografía y fuentes de información

- https://vitejs.dev/
- https://tailwindcss.com/docs
- https://docs.rapidapi.com
- https://developers.google.com/maps/documentation/places
- https://mailjet.com/guides
- https://cloudinary.com/documentation
- https://open-meteo.com/
- https://nominatim.org/release-docs/latest/
- https://es.react.dev/learn
- https://nodejs.org/docs/latest/api/
- https://firebase.google.com/docs?hl=es-419
- https://developers.google.com/apis-explorer?hl=es-419

---

## 5. Anexos

### Guía de instalación, configuración y despliegue

#### Requisitos previos

Tener instalado en el equipo:
- Node.js v18 o superior
- npm v9 o superior

#### 1. Clonar el repositorio

```bash
git clone https://github.com/ZenTrip-DAW/ZenTrip.git
cd ZenTrip
```

El repositorio contiene dos carpetas principales:
- Zentrip-Node/ → Backend (Node.js + Express)
- Zentrip-React/ → Frontend (React + Vite)

#### 2. Instalación y arranque en local

Colocar los archivos .env proporcionados en cada carpeta correspondiente (Zentrip-Node/.env y Zentrip-React/.env), e instalar las dependencias de ambos proyectos:

```bash
cd Zentrip-Node
npm install
cd ../Zentrip-React
npm install
```

Arrancar el backend:

```bash
cd Zentrip-Node
node server.js
```

Arrancar el frontend en otra terminal:

```bash
cd Zentrip-React
npm run dev
```

La aplicación estará disponible en http://localhost:5173.

#### 3. Acceso a la versión desplegada

La aplicación está desplegada y accesible públicamente. El frontend y el backend están alojados de forma independiente en Vercel, aunque el usuario solo interactúa con un único enlace que da acceso a la landing page y al resto de la aplicación. El frontend realiza automáticamente las llamadas al backend sin que el usuario tenga que configurar nada.

**Enlace de acceso:** https://zen-trip-phi.vercel.app

---

## Información del Proyecto

**Autoras:** Daniela Elena Ene · Paula Suárez · Daniela Villegas  
**Año académico:** 2025-2026  
**Ciclo:** CFGS Desarrollo de Aplicaciones Web  
**Centro:** IES Alonso de Avellaneda

---

© 2026 Zentrip. Todos los derechos reservados.
