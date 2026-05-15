import { createInspiration } from '../services/inspirationsService';

function calcReadingTime(body) {
  const text = (body ?? [])
    .flatMap(s => s.paragraphs ?? [])
    .map(p => p.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' '))
    .join(' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const ARTICLES = [
  /* ────────── 1. ROADTRIP ────────── */
  {
    category: 'ROADTRIP',
    subcategory: 'Ruta clásica',
    emoji: '🗺️',
    title: 'La Carretera Austral: el road trip más salvaje de América del Sur',
    summary: '1.240 km por la Patagonia chilena entre glaciares, fiordos y bosques que casi nadie ha pisado',
    image: 'https://images.unsplash.com/photo-1535223289429-462ea9301402?auto=format&fit=crop&w=800&q=80',
    destination: 'Chile',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>La Carretera Austral es una de las rutas en coche más espectaculares del planeta. Atraviesa la Patagonia chilena de norte a sur durante 1.240 kilómetros, pasando por glaciares que caen al mar, bosques de coihues que no han visto un hacha en siglos, fiordos interminables y pueblos donde el tiempo parece haberse detenido en los años ochenta.</p><p>No es una ruta fácil. Más de la mitad del trayecto son caminos de tierra con baches, ríos que cruzar en ferry y gasolineras separadas por cientos de kilómetros. Pero eso es exactamente lo que la hace única: la Carretera Austral filtra a los viajeros. Solo llegan los que de verdad quieren estar ahí.</p>',
        ],
      },
      {
        heading: 'Por qué es diferente a cualquier otra ruta',
        paragraphs: [
          '<p>La gran mayoría de rutas en coche del mundo llevan de ciudad en ciudad. La Carretera Austral lleva de naturaleza en naturaleza. Los puntos intermedios no son gasolineras sino miradores de glaciares, playas de piedra negra, pueblos de pescadores y lagunas de un azul tan intenso que parece falso.</p><p>El general Pinochet mandó construirla en los años setenta para conectar los territorios del sur que quedaban aislados. Hoy es el sueño de cualquier viajero que busque algo completamente fuera de lo convencional.</p>',
        ],
      },
      {
        heading: 'Los imprescindibles del trayecto',
        paragraphs: [
          '<ul><li><strong>Parque Queulat</strong>: el ventisquero colgante, un glaciar suspendido entre dos montañas que vierte hielo al vacío. Uno de los paisajes más surrealistas de Chile.</li><li><strong>Villa Santa Lucía y el lago Yelcho</strong>: pesca de truchas en aguas esmeraldas rodeadas de bosque nativo.</li><li><strong>Puyuhuapi</strong>: pueblo alemán en medio de la Patagonia. Sus termas están en un fiordo al que solo se llega en barca.</li><li><strong>Bahía Exploradores</strong>: se llega por una pista de tierra de 60 km y al final hay un glaciar que te espera solo, sin nadie más.</li><li><strong>Cochrane y el río Baker</strong>: el río más caudaloso de Chile. El color turquesa del agua no se ha visto en ningún otro río del mundo.</li></ul>',
        ],
      },
      {
        heading: 'Cómo organizarlo',
        paragraphs: [
          '<p>La ruta clásica empieza en Puerto Montt y termina en Villa O\'Higgins o viceversa. Lo mínimo para hacerla con calma son 10-12 días, aunque la gente que quiere vivirla de verdad dedica 3-4 semanas. Los ferries son imprescindibles en varios tramos: el más espectacular es el que sale de Caleta Tortel.</p><p>Alquila el coche con todo el seguro posible. Los caminos de ripio son generosos con los pinchazos y los impactos en el parabrisas. Un 4x4 no es obligatorio en temporada seca, pero en invierno es casi indispensable.</p>',
        ],
      },
      {
        heading: 'La logística que nadie te cuenta',
        paragraphs: [
          '<p>La gasolina cuesta entre un 30% y un 50% más cara que en Santiago. Lleva siempre el depósito lleno porque hay tramos de 200 km sin ninguna estación. El efectivo es fundamental: muchos hospedajes y restaurantes no aceptan tarjeta.</p><p>La mejor época es de noviembre a marzo. En invierno algunos tramos se cortan por nieve y el frío es intenso. Pero en primavera, cuando los lupinos morados florecen junto a la carretera, el paisaje es absolutamente irreal.</p>',
        ],
      },
      {
        heading: 'Lo que te llevas al volver',
        paragraphs: [
          '<p>La Carretera Austral no es un viaje de Instagram. Es demasiado grande para que una foto lo capture. Es el tipo de viaje que cambia la manera en que ves el mundo: cuando pasas dos semanas en medio de esa naturaleza descomunal, todo lo demás parece pequeño y manejable.</p>',
        ],
      },
    ],
  },

  /* ────────── 2. AVENTURA ────────── */
  {
    category: 'AVENTURA',
    subcategory: 'Senderismo',
    emoji: '🧗',
    title: 'Torres del Paine: la Patagonia que te deja sin palabras',
    summary: 'El fin del mundo tiene nombre propio y es uno de los destinos más impresionantes del planeta',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80',
    destination: 'Patagonia, Chile',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>Torres del Paine es uno de esos lugares que no parecen reales hasta que los tienes delante. Tres torres de granito de más de 2.800 metros que emergen de la nada, rodeadas de lagos turquesa, glaciares milenarios y pumas que cruzan los senderos sin inmutarse.</p><p>El parque nacional chileno es uno de los más espectaculares del mundo y el destino ideal para quienes buscan una aventura de verdad, sin trampa ni cartón. Aquí la naturaleza manda y el ser humano aprende a adaptarse.</p>',
        ],
      },
      {
        heading: 'El trekking "W" explicado',
        paragraphs: [
          '<p>La ruta en W dura 5 días y dibuja una W sobre el mapa siguiendo los tres valles más espectaculares del parque. No requiere experiencia previa en alta montaña pero sí buena condición física, porque cada día se caminan entre 15 y 22 km con desniveles considerables.</p><p>El punto más alto y más impresionante es el Mirador Las Torres, donde se llega después de dos horas de subida por roca viva. Cuando aparecen las torres al amanecer, con el lago rojo de abajo y el cielo naranja de fondo, se entiende perfectamente por qué la gente cruza el mundo para verlas.</p>',
        ],
      },
      {
        heading: 'El circuito completo: para los que quieren más',
        paragraphs: [
          '<p>El circuito completo añade 4 días más por la cara trasera del macizo, donde casi no hay nadie. Solo viento patagónico, cóndores planeando a baja altura y el silencio más absoluto que hayas experimentado en tu vida. El paso John Gardner, a 1.241 metros, regala una vista del glaciar Grey que muy poca gente ha visto.</p>',
        ],
      },
      {
        heading: 'Lo que necesitas saber antes de reservar',
        paragraphs: [
          '<ul><li>Las plazas en refugios y campamentos se agotan meses antes de la temporada. Reserva en octubre para enero-febrero.</li><li>La mejor época es de noviembre a marzo. En abril el parque cierra tramos por mal tiempo.</li><li>El viento patagónico puede derribarte: lleva ropa técnica impermeable aunque el día salga soleado.</li><li>El vuelo más práctico llega a Punta Arenas (3h de bus hasta Puerto Natales, la base del trekking).</li><li>Lleva efectivo. Dentro del parque no hay cajeros.</li></ul>',
        ],
      },
      {
        heading: 'La fauna del parque',
        paragraphs: [
          '<p>Los guanacos son tan abundantes que a veces bloquean el camino. Los cóndores, con sus casi tres metros de envergadura, planean sin esfuerzo sobre las corrientes de aire. Y los pumas, aunque tímidos, son muy numerosos: las posibilidades de ver uno son mayores aquí que en casi cualquier otro lugar de Sudamérica.</p>',
        ],
      },
      {
        heading: 'Lo que nadie te cuenta',
        paragraphs: [
          '<p>Torres del Paine tiene días perfectos y días imposibles. El viento puede alcanzar los 120 km/h y la lluvia puede durar 48 horas seguidas. Viene en el pack. Los viajeros que lo aceptan y se adaptan viven una experiencia mucho más auténtica que los que esperaban un trekking de postal.</p>',
        ],
      },
    ],
  },

  /* ────────── 3. GASTRONOMÍA ────────── */
  {
    category: 'GASTRONOMÍA',
    subcategory: 'Alta cocina',
    emoji: '🍽️',
    title: 'San Sebastián: la ciudad con más estrellas Michelin por metro cuadrado',
    summary: 'Una ciudad pequeña con una escena gastronómica que ha conquistado el mundo entero',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
    destination: 'San Sebastián, España',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>San Sebastián tiene 180.000 habitantes, tres restaurantes con tres estrellas Michelin y más bares por metro cuadrado que casi cualquier ciudad del mundo. Comer aquí no es una necesidad: es el plan. La conversación más habitual entre locales no es sobre el tiempo ni el trabajo. Es sobre qué bar tiene el mejor pintxo de bacalao este año.</p><p>La Parte Vieja, el barrio histórico, tiene calles tan pequeñas que los bares se tocan entre sí. En cada barra hay montañas de pintxos que se renuevan cada hora. El protocolo es moverse, pedir uno en cada sitio y no sentarse nunca hasta que encuentras el lugar que merece la pausa.</p>',
        ],
      },
      {
        heading: 'La ruta de pintxos perfecta',
        paragraphs: [
          '<ul><li><strong>Bar Txepetxa</strong>: solo sirve anchoas. Veinte variedades distintas. Son las mejores del mundo y lo saben.</li><li><strong>La Cuchara de San Telmo</strong>: sin barra, sin pintxos, solo cocina vasca de temporada. Siempre hay cola.</li><li><strong>Bar Ganbara</strong>: las setas salteadas son un clásico absoluto de la ciudad.</li><li><strong>Bar Borda Berri</strong>: el rabo de buey estofado y las kokotxas al pilpil son de otro nivel.</li><li><strong>Bodega Donostiarra</strong>: el sitio de los locales. Sin pretensiones, con el mejor vino de la casa.</li></ul>',
        ],
      },
      {
        heading: 'La alta cocina vasca',
        paragraphs: [
          '<p>Arzak lleva cuatro décadas con tres estrellas Michelin. Es una institución familiar dirigida ahora por Elena Arzak, considerada la mejor chef del mundo en múltiples ocasiones. Reservar con 3-4 meses de antelación es lo mínimo. El menú degustación cuesta unos 220€ por persona y es una experiencia que altera permanentemente la percepción de lo que puede ser la comida.</p><p>Mugaritz, de Andoni Luis Aduriz, juega en otra liga. No es un restaurante: es un laboratorio donde lo que sirven te hace cuestionarte qué es un alimento y qué es un plato. Dos estrellas Michelin y considerado durante años el segundo mejor restaurante del mundo.</p>',
        ],
      },
      {
        heading: 'Más allá de los pintxos',
        paragraphs: [
          '<p>La playa de La Concha es una de las más bonitas de Europa. El monte Urgull tiene unas vistas perfectas de la bahía al atardecer. Y el barrio de Gros, al otro lado del río Urumea, es donde van los donostiarras cuando quieren escapar de los turistas: mejores precios, mejores pintxos y ambiente más auténtico.</p>',
        ],
      },
      {
        heading: 'Cuándo ir y cuánto cuesta comer bien',
        paragraphs: [
          '<p>San Sebastián es agradable todo el año. En enero y febrero llueve mucho pero los pintxos tienen la misma calidad con la mitad de gente. En verano la ciudad se llena y los precios suben un 20-30%.</p><p>Una ruta de pintxos completa por la Parte Vieja cuesta entre 25 y 40€ por persona incluyendo txakoli o sidra. Una cena en un restaurante de mercado con dos platos y vino ronda los 45-60€. El lujo de una estrella Michelin empieza en 90€ y sube sin techo.</p>',
        ],
      },
    ],
  },

  /* ────────── 4. INVIERNO ────────── */
  {
    category: 'INVIERNO',
    subcategory: 'Aurora boreal',
    emoji: '❄️',
    title: 'Laponia: ver la aurora boreal desde una cabaña de cristal',
    summary: 'Noches infinitas, renos, trineo de perros y un cielo que no olvidarás en tu vida',
    image: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=800&q=80',
    destination: 'Laponia, Finlandia',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>Laponia finlandesa es el lugar donde el mundo se vuelve completamente silencioso. Bosques de abedules cubiertos de nieve, lagos helados que reflejan el cielo y, si tienes suerte, una cortina de luz verde que ondea sobre tu cabeza como si el universo se hubiera puesto a bailar.</p><p>La aurora boreal no se puede garantizar. Necesitas cielo despejado, oscuridad total y actividad solar. Pero en Laponia, de noviembre a febrero, las probabilidades son de las más altas del planeta, y cuando ocurre, entiendes perfectamente por qué la gente viaja miles de kilómetros para verla.</p>',
        ],
      },
      {
        heading: 'Las cabañas de cristal',
        paragraphs: [
          '<p>Dormir en una cabaña con el techo de cristal y ver la aurora desde la cama es una de esas experiencias que justifican un viaje. Kakslauttanen Arctic Resort fue el primero en popularizarlas pero hoy hay muchas opciones en distintos rangos de precio. Algunas tienen sauna privada, otras están en medio del bosque, y las más exclusivas tienen jacuzzi con vistas al cielo.</p><p>La temperatura interior se mantiene perfectamente aunque fuera haya -30°C. El truco es ir en noches de luna nueva, cuando el cielo está más oscuro y las auroras se ven con mucha más intensidad.</p>',
        ],
      },
      {
        heading: 'Las actividades que no están en los folletos',
        paragraphs: [
          '<ul><li><strong>Safari de huskies</strong>: conducir tu propio trineo con 6-8 perros por el bosque nevado es una de las experiencias más intensas del viaje. Los perros tiran con una fuerza increíble y el silencio entre los árboles es absoluto.</li><li><strong>Safari de renos con guía sami</strong>: los sami son el pueblo indígena de Laponia y algunos todavía viven de la cría de renos. La experiencia incluye vestirte con pieles tradicionales y aprender a conducir el trineo.</li><li><strong>Motos de nieve</strong>: para llegar a lugares donde nadie más llega. Al amanecer son especialmente mágicas.</li><li><strong>Sauna y lago helado</strong>: la combinación más escandinava del mundo. Hay que hacerlo al menos una vez en la vida, aunque el primer segundo en el agua sea un shock total.</li></ul>',
        ],
      },
      {
        heading: 'La aldea de Papá Noel',
        paragraphs: [
          '<p>Rovaniemi, la capital de Laponia, está exactamente en el Círculo Polar Ártico y tiene el Santa Claus Village oficial. Es una atracción turística de primer nivel para familias con niños: puedes tomarte una foto con Papá Noel en su oficina privada, visitar el Pueblo Ártico y hacer actividades en la nieve durante todo el día.</p>',
        ],
      },
      {
        heading: 'Cómo organizarlo y cuánto cuesta',
        paragraphs: [
          '<p>Vuelo directo a Rovaniemi o Kittilä desde Helsinki en 1h15. Muchos operadores ofrecen paquetes todo incluido de 3-5 noches que incluyen alojamiento en cabaña, actividades y traslados desde el aeropuerto. Un paquete de 4 noches con experiencias incluidas ronda los 1.200-2.500€ por persona según la cabaña. Reservar en verano para diciembre es esencial porque se agotan.</p>',
        ],
      },
    ],
  },

  /* ────────── 5. CULTURAL ────────── */
  {
    category: 'CULTURAL',
    subcategory: 'Historia antigua',
    emoji: '🏛️',
    title: 'Kioto: la ciudad donde Japón guardó toda su alma',
    summary: 'Templos dorados, geishas reales y calles de bambú que parecen un sueño',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    destination: 'Kioto, Japón',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>Mientras Tokio mira al futuro a toda velocidad, Kioto mira hacia adentro. Fue la capital imperial de Japón durante más de mil años y hoy conserva más de 1.600 templos budistas y 400 santuarios sintoístas. Es la ciudad donde el Japón tradicional sobrevivió al tiempo, a las guerras y a la modernización.</p><p>Hay algo en Kioto que no está en ningún otro lugar de Japón: la sensación de que el tiempo pasa de otra manera. Las calles de Gion, los templos al amanecer y los jardines zen tienen un efecto casi meditativo sobre cualquier visitante que llegue con la mente abierta.</p>',
        ],
      },
      {
        heading: 'Los imprescindibles',
        paragraphs: [
          '<ul><li><strong>Fushimi Inari</strong>: miles de torii naranjas que forman un túnel de colores a lo largo de varios kilómetros. Sube hasta la cima, a 233 metros, donde los turistas prácticamente desaparecen y el bosque es completamente tuyo.</li><li><strong>Kinkaku-ji</strong>: el Pabellón Dorado. Cubierto de pan de oro, reflejado en el lago. Al amanecer, antes de las 9h, puedes verlo casi solo.</li><li><strong>Arashiyama</strong>: el bosque de bambú, los monos salvajes en el monte y el tren turístico Sagano son visitas de medio día perfectas.</li><li><strong>Gion</strong>: el barrio histórico de las geishas. De noche, con las farolas encendidas y los kimonos pasando, es una de las estampas más bonitas de Asia.</li><li><strong>Nishiki Market</strong>: el mercado cubierto de la ciudad, lleno de sabores extraños, encurtidos, tofu fresco y cosas que no sabes lo que son pero quieres probar.</li></ul>',
        ],
      },
      {
        heading: 'La experiencia del té y del kimono',
        paragraphs: [
          '<p>Alquilar un kimono para pasar el día es una experiencia que la mayoría de viajeros descarta por parecer demasiado turística. Es un error. Caminar por los templos vestido con la ropa tradicional cambia completamente la manera de relacionarse con el lugar. Hay muchos alquileres en Higashiyama desde 25€.</p><p>Una ceremonia del té auténtica, guiada por un maestro en un jardín privado, cuesta entre 20 y 60€ y dura unos 45 minutos. Es una de las experiencias más peculiares y memorables de Japón.</p>',
        ],
      },
      {
        heading: 'Cuándo ir y cómo moverse',
        paragraphs: [
          '<p>La primavera (finales de marzo y abril) es la época de los cerezos en flor: los parques y templos son absolutamente mágicos, pero la ciudad está a tope. El otoño (noviembre) con las hojas rojas de los arces es igual de espectacular y algo menos masificado.</p><p>Kioto se mueve en bicicleta o en autobús. El bus de un día ilimitado cuesta 600 yenes (unos 4€) y cubre todos los puntos principales. La bici se alquila en cualquier hotel y es la mejor manera de descubrir los barrios menos turísticos.</p>',
        ],
      },
    ],
  },

  /* ────────── 6. MONTAÑA ────────── */
  {
    category: 'MONTAÑA',
    subcategory: 'Alta montaña',
    emoji: '🏔️',
    title: 'Campo Base del Everest: la caminata que cambia tu perspectiva de todo',
    summary: '130 km a pie por los Himalayas hasta llegar al pie de la montaña más alta del mundo',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    destination: 'Nepal',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>No hace falta ser alpinista para llegar al Campo Base del Everest. El trekking clásico desde Lukla hasta el Campo Base (5.364 m) lo hacen cada año miles de personas de todas las edades y condiciones físicas. Eso no significa que sea fácil: el soroche, el mal de altura, es real y hay que respetarlo absolutamente.</p><p>Pero lo que te encuentras al llegar, ese glaciar Khumbu con sus seracs azules y ese cielo tan oscuro a 5.000 metros que parece el espacio, no tiene comparación con nada que hayas visto antes.</p>',
        ],
      },
      {
        heading: 'La ruta en datos',
        paragraphs: [
          '<ul><li><strong>Duración</strong>: 12-14 días de ida y vuelta desde Lukla</li><li><strong>Distancia total</strong>: aproximadamente 130 km</li><li><strong>Altitud máxima en el trekking</strong>: 5.545 m en Kala Patthar, el mirador del Everest</li><li><strong>Dificultad</strong>: media-alta. No requiere equipo técnico pero sí buena condición física</li><li><strong>Mejor época</strong>: marzo-mayo y septiembre-noviembre</li><li><strong>Coste aproximado</strong>: 1.500-2.000€ incluyendo vuelos internos, permisos, guía y alojamiento en teahouses</li></ul>',
        ],
      },
      {
        heading: 'El vuelo a Lukla: el aeropuerto más peligroso del mundo',
        paragraphs: [
          '<p>El trekking empieza con una aventura: el vuelo de 35 minutos desde Katmandú hasta Lukla, en una pista de apenas 460 metros construida en la ladera de una montaña. Los vuelos solo despegan con buen tiempo y a veces hay retrasos de días. Es parte de la experiencia.</p><p>Desde Lukla, el primer pueblo es Phakding y la primera parada obligatoria de aclimatación es Namche Bazaar (3.440 m), el corazón de la región sherpas, con internet, cafés y las mejores tiendas de equipo de montaña fuera de Katmandú.</p>',
        ],
      },
      {
        heading: 'La aclimatación no es opcional',
        paragraphs: [
          '<p>El protocolo estándar es no subir más de 300-500 metros de altitud por día por encima de los 3.000 metros. Descansar un día completo en Namche y otro en Dingboche (4.410 m) es fundamental para no arriesgarse al edema pulmonar o cerebral.</p><p>Las pastillas de Diamox (acetazolamida) son el medicamento preventivo más común. Consulta con tu médico antes del viaje y lleva siempre ibuprofeno para los dolores de cabeza por la altitud, que son casi universales.</p>',
        ],
      },
      {
        heading: 'Los sherpas: los verdaderos protagonistas',
        paragraphs: [
          '<p>Los sherpas no son solo guías: son la razón por la que el Everest ha podido ser escalado. Su adaptación genética a la altura les permite funcionar a niveles de oxígeno que dejarían a cualquier otro ser humano incapacitado. Un buen sherpa no es un lujo en este trekking: es la diferencia entre un viaje increíble y uno peligroso.</p>',
        ],
      },
    ],
  },

  /* ────────── 7. ROMÁNTICO ────────── */
  {
    category: 'ROMÁNTICO',
    subcategory: 'Luna de miel',
    emoji: '💕',
    title: 'Santorini: ¿por qué es el destino romántico más fotografiado del mundo?',
    summary: 'Cúpulas azules, atardeceres imposibles y el Mediterráneo más azul que hayas visto nunca',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
    destination: 'Santorini, Grecia',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>Santorini tiene algo que ninguna foto consigue capturar del todo: la luz. A las seis de la tarde, cuando el sol empieza a bajar sobre la caldera volcánica, todo se vuelve dorado. Las casas blancas, las cúpulas azules de Oia, el mar de abajo. Es uno de esos momentos en los que se entiende perfectamente por qué la gente se enamora viajando.</p><p>La isla es el resultado de una erupción volcánica catastrófica ocurrida hace 3.600 años que hundió la caldera central y creó esa forma de media luna característica. Toda la arquitectura blanca está construida en el borde del acantilado que se formó entonces. Vivir en el borde del cráter de un volcán nunca fue tan bonito.</p>',
        ],
      },
      {
        heading: 'Oia vs Fira: ¿dónde alojarse?',
        paragraphs: [
          '<p><strong>Oia</strong> es más tranquila, más cara y más pintoresca. El atardecer desde el castillo de Oia es el más famoso del Mediterráneo: llega con una hora de antelación o no verás nada por la multitud. Los hoteles con piscina infinita sobre la caldera cuestan entre 200 y 800€ la noche, pero algunas opciones más asequibles existen si reservas con meses de antelación.</p><p><strong>Fira</strong> es la capital, tiene más vida nocturna, más restaurantes a todos los precios y es entre un 30 y un 50% más asequible que Oia. El teleférico que baja al puerto viejo (donde amarran los cruceros) es un paseo de cinco minutos con una de las mejores vistas de la caldera.</p>',
        ],
      },
      {
        heading: 'Lo que no sale en Instagram',
        paragraphs: [
          '<ul><li>La playa de Perissa: negra y volcánica, con tabernas buenísimas y casi sin la masificación de las playas más famosas</li><li>El vino Assyrtiko: producido con uvas cultivadas en espiral para protegerse del viento, es uno de los blancos más minerales y únicos del Mediterráneo</li><li>Akrotiri: la ciudad minoica enterrada bajo ceniza volcánica hace 3.600 años. La "Pompeya griega" tiene frescos de colores perfectamente conservados</li><li>El camino a pie de Fira a Oia: 10 km por el borde del acantilado con vistas a la caldera durante todo el trayecto. Una de las caminatas más bonitas de Europa</li></ul>',
        ],
      },
      {
        heading: 'La gastronomía de la isla',
        paragraphs: [
          '<p>Santorini tiene sus propios productos únicos: los tomates cherry de caldera (más dulces y concentrados por el suelo volcánico), las habas amarillas que se comen como hummus, el pepino blanco y el queso fava. Los restaurantes frente al mar en Ammoudi, el pequeño puerto bajo Oia, son los más caros de la isla y los más especiales para una cena de aniversario.</p>',
        ],
      },
      {
        heading: 'Cuándo ir y cómo llegar',
        paragraphs: [
          '<p>La mejor época es mayo-junio y septiembre. Julio y agosto son los meses más calurosos y más masificados: los precios se multiplican y los caminos más famosos están llenos. En mayo la temperatura es perfecta (25-28°C) y la isla todavía respira.</p><p>Hay vuelos directos desde muchas ciudades españolas en temporada, aunque a veces más económico es volar a Atenas y tomar el ferry de 8 horas (con cabina, es muy llevadero) o el vuelo corto de 45 minutos.</p>',
        ],
      },
    ],
  },

  /* ────────── 8. FAMILIA ────────── */
  {
    category: 'FAMILIA',
    subcategory: 'Parques nacionales',
    emoji: '👨‍👩‍👧',
    title: 'Costa Rica con niños: la aventura verde que toda la familia recordará',
    summary: 'Monos, volcanes, tirolinas y playas perfectas para los más pequeños de la casa',
    image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=800&q=80',
    destination: 'Costa Rica',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>Costa Rica tiene el 5% de la biodiversidad del planeta en un país del tamaño de Andalucía. Para los niños, eso significa ver perezosos colgados de los árboles al lado del camino, monos capuchinos que roban bananas de los puestos del mercado, ranas venenosas de colores imposibles y tortugas gigantes poniendo huevos en la playa de noche con una linterna roja que no las asusta.</p><p>Es uno de esos destinos donde el espectáculo natural es tan constante que los niños no piden el móvil en todo el viaje. Eso, por sí solo, ya vale el precio del avión.</p>',
        ],
      },
      {
        heading: 'Los mejores destinos para familias',
        paragraphs: [
          '<ul><li><strong>La Fortuna y el volcán Arenal</strong>: las aguas termales naturales calentadas por el volcán son el paraíso para niños de cualquier edad. Las hay gratuitas y privadas (de resort). El volcán tiene forma perfectamente cónica y se ve desde casi todas partes.</li><li><strong>Manuel Antonio</strong>: el parque nacional más visitado del país combina selva densa con playas de arena blanca. Los monos se sientan en la misma arena que tú y los perezosos están en los árboles a dos metros del camino.</li><li><strong>Monteverde</strong>: el bosque nuboso de las tirolinas más largas de América Central. Las pasarelas colgantes sobre la copa de los árboles dan vértigo incluso a los adultos.</li><li><strong>Tortuguero</strong>: el canal de la selva al que solo se llega en barca. De julio a octubre, las tortugas laúd salen a desovar de noche. Verlo con niños es una experiencia que no olvidarán.</li></ul>',
        ],
      },
      {
        heading: 'La filosofía Pura Vida',
        paragraphs: [
          '<p>Los costarricenses dicen "pura vida" para todo: hola, adiós, gracias, de nada, qué bien, cómo estás. Es contagioso de una manera ridícula. Al tercer día toda la familia lo usa sin darse cuenta. Costa Rica no tiene ejército desde 1948 y ese presupuesto histórico se invirtió en educación y parques naturales. Se nota en la actitud de la gente y en el estado de conservación del territorio.</p>',
        ],
      },
      {
        heading: 'Logística y presupuesto',
        paragraphs: [
          '<p>Costa Rica no es barato para Centroamérica. El alojamiento, los tours y la comida tienen precios similares a Europa. Un viaje de 10 días para una familia de cuatro con vuelos, hoteles medios y actividades incluidas puede rondar los 5.000-7.000€. Pero la calidad de las experiencias y la seguridad del destino para familias es excepcional.</p><p>La época seca (diciembre a abril) es la más recomendable para familias. En temporada verde (mayo-noviembre) hay más vida en la selva pero también muchos días de lluvia.</p>',
        ],
      },
    ],
  },

  /* ────────── 9. FESTIVAL ────────── */
  {
    category: 'FESTIVAL',
    subcategory: 'Carnaval',
    emoji: '🎉',
    title: 'El Carnaval de Río: cinco días en la fiesta más grande del mundo',
    summary: 'Samba, plumas, un millón de personas bailando y la alegría más contagiosa del planeta',
    image: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=800&q=80',
    destination: 'Río de Janeiro, Brasil',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>El Carnaval de Río no tiene comparación posible. Dos millones de personas en la calle cada noche durante cuatro días, escuelas de samba que llevan un año entero preparando sus carrozas de 30 metros y bailarines que ensayan durante doce meses para desfilar cuatro minutos por el Sambódromo. Es arte, es danza, es música y es euforia colectiva al mismo tiempo.</p><p>Lo que más sorprende a quien lo vive por primera vez no es el espectáculo visual sino la energía. La samba en vivo a 140 decibelios hace que el cuerpo se mueva solo. No hace falta saber bailar. Nadie lo sabe al principio y todo el mundo termina haciéndolo.</p>',
        ],
      },
      {
        heading: 'Sambódromo vs blocos de calle: la gran elección',
        paragraphs: [
          '<p><strong>El Sambódromo</strong> es el estadio de la samba, una avenida de 700 metros de largo con gradas a ambos lados. Las escuelas más importantes desfilan durante cuatro noches y los mejores competidores por el título. Las entradas para las noches principales se agotan meses antes, pero la experiencia de estar en las gradas a las 2 de la madrugada con una escola de samba pasando a centímetros es completamente única.</p><p><strong>Los blocos</strong> son las fiestas callejeras gratuitas que hay por toda la ciudad durante las dos semanas previas al carnaval oficial. El Cordão da Bola Preta reúne a 800.000 personas en una sola mañana en el centro. Banda de Ipanema, en el barrio más famoso de Río, es más pequeño pero el ambiente es excepcional.</p>',
        ],
      },
      {
        heading: 'Más allá del carnaval: Río merece una semana',
        paragraphs: [
          '<p>El Pão de Açúcar al atardecer, con el teleférico y las vistas de la bahía de Guanabara, supera incluso al Corcovado en términos de espectáculo visual. El barrio de Santa Teresa, con sus tranvías y sus galerías de arte, es el Río más auténtico y menos turístico. Y Lapa, con sus arcos coloniales iluminados de noche y la música de los botecos desbordando a la calle, es la mejor fiesta gratuita de la ciudad.</p>',
        ],
      },
      {
        heading: 'Lo que necesitas saber antes',
        paragraphs: [
          '<ul><li>Las entradas del Sambódromo se ponen a la venta en diciembre: no esperes más</li><li>Lleva solo lo necesario en los blocos: efectivo justo, el móvil en el bolsillo delantero y nada de valor visible</li><li>Los hoteles en Ipanema y Copacabana multiplican su precio por 4-5 durante el carnaval: reserva con un año de antelación o considera Airbnb en barrios más tranquilos</li><li>El carnaval ocurre 47 días antes de Pascua, siempre en febrero o principios de marzo</li></ul>',
        ],
      },
    ],
  },

  /* ────────── 10. MOCHILERO ────────── */
  {
    category: 'MOCHILERO',
    subcategory: 'Interrail',
    emoji: '🎒',
    title: 'Interrail por Europa: el viaje de tu vida con un solo billete de tren',
    summary: 'De Madrid a Lisboa, de París a Praga sin aviones ni itinerarios fijos',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
    destination: 'Europa',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>El Interrail es un pase de tren que te permite viajar por 33 países europeos durante un período determinado. Lo inventaron en 1972 para jóvenes europeos y hoy lo usan personas de todas las edades y de todo el mundo. La premisa es simple: llegas a una ciudad, decides qué te apetece ver, y coges el siguiente tren. No hay más planificación obligatoria que esa.</p><p>Es el único viaje donde el transporte es en sí mismo parte de la experiencia. Los trenes europeos pasan por montañas suizas, viñedos franceses, costas croatas y ciudades medievales polacas. Por la ventana desfila Europa entera durante dos semanas.</p>',
        ],
      },
      {
        heading: 'Qué pase elegir',
        paragraphs: [
          '<ul><li><strong>7 días en 1 mes</strong>: para rutas cortas de 3-4 países. Perfecto para un primer Interrail.</li><li><strong>15 días en 2 meses</strong>: el más versátil para rutas de Europa occidental o central.</li><li><strong>1 mes continuo</strong>: para los que quieren hacer Europa entera sin prisa. El precio ronda los 500€.</li><li><strong>Country passes</strong>: si solo quieres viajar por uno o dos países, son más económicos que el global.</li></ul>',
        ],
      },
      {
        heading: 'La ruta más popular',
        paragraphs: [
          '<p>El clásico de dos semanas suele combinar: Lisboa o Madrid → Barcelona → Niza o Marsella → Florencia → Roma → Venecia → Viena o Praga → Berlín → Ámsterdam → París. Es demasiado para dos semanas si quieres ver algo de verdad. Elige la mitad y vívela bien.</p><p>La ruta de los Balcanes (Liubliana, Zagreb, Split, Dubrovnik, Sarajevo) es la que más está creciendo entre viajeros de 25-35 años: más auténtica, más barata y mucho menos masificada que el circuito clásico.</p>',
        ],
      },
      {
        heading: 'Los trenes nocturnos: la joya del Interrail',
        paragraphs: [
          '<p>El tren nocturno es el héroe no reconocido del Interrail. Viajas de noche, ahorras una noche de hostel y amaneces en una ciudad nueva. El más mítico es el que une Viena con Venecia por los Alpes. También el Barcelona-París, el Madrid-Lisboa y el nuevo NightJet que conecta Berlín con Roma son extraordinarios.</p><p>Eso sí: los trenes nocturnos tienen suplemento y la reserva de cama no está incluida en el pase. Reserva siempre con semanas de antelación porque se llenan rápido.</p>',
        ],
      },
      {
        heading: 'Consejos para hacerlo bien',
        paragraphs: [
          '<ul><li>Lleva una mochila de máximo 40 litros. Lo que no quepa, no va.</li><li>Los hostels de 6-8 camas son donde ocurren las mejores conversaciones del viaje.</li><li>Cocinar en el hostel dos noches de tres hace el presupuesto sostenible en el tiempo.</li><li>No reserves todo: deja siempre un margen de 2-3 días libre para quedarte más en un sitio que te haya sorprendido.</li><li>La app Railplanner de Interrail funciona sin conexión y tiene todos los horarios.</li></ul>',
        ],
      },
    ],
  },

  /* ────────── 11. PLAYA ────────── */
  {
    category: 'PLAYA',
    subcategory: 'Playa virgen',
    emoji: '🏖️',
    title: 'Tailandia: las playas que convirtieron el sudeste asiático en el destino del mundo',
    summary: 'Aguas turquesas, longtails, cocoteros y puestas de sol que se graban a fuego en la memoria',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    destination: 'Tailandia',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>Tailandia lleva décadas siendo el destino de referencia para todo tipo de viajeros y hay una razón muy clara para eso: ofrece playas de primer nivel mundial, comida increíble a precios ridículos y una cultura que sorprende en cada esquina. Todo a la vez. En ningún otro país del mundo consigues esa combinación con tanta consistencia.</p><p>El sur del país, dividido entre el golfo de Tailandia al este y el mar de Andamán al oeste, es una de las costas más variadas y espectaculares de toda Asia. Las islas tienen personalidades completamente distintas: puedes elegir entre fiestas hasta el amanecer, submarinismo en arrecifes vírgenes o semanas de absoluta desconexión.</p>',
        ],
      },
      {
        heading: 'Las islas que no deberías perderte',
        paragraphs: [
          '<ul><li><strong>Koh Lanta</strong>: la más tranquila del sur. Sin fiestas masivas, con playas largas de arena fina y atardeceres perfectos. Ideal para parejas y familias.</li><li><strong>Koh Phi Phi</strong>: la más fotogénica, famosa por The Beach. Maya Bay lleva años gestionando el acceso para proteger el arrecife: hoy se visita en kayak, que es mucho mejor.</li><li><strong>Koh Tao</strong>: el mejor lugar del mundo para sacarse el curso de buceo por precio-calidad. El Open Water cuesta unos 280€ todo incluido y tardas cuatro días.</li><li><strong>Krabi</strong>: para hacer escalada en los acantilados de caliza del área de Railay, accesible solo en longtail boat.</li><li><strong>Koh Samui</strong>: más desarrollada y cara, pero con infraestructura perfecta para quien quiere comodidades sin renunciar al paraíso.</li></ul>',
        ],
      },
      {
        heading: 'La comida: la otra razón para ir',
        paragraphs: [
          '<p>La comida callejera tailandesa es, sin ninguna duda, una de las mejores del mundo. Un pad thai en un puesto de la calle cuesta 60-80 bahts (1,5-2€) y es infinitamente mejor que el de cualquier restaurante tailandés fuera de Tailandia. El mango sticky rice con leche de coco es el postre que convierte a cualquier viajero en adicto permanente.</p><p>Los mercados nocturnos de Chiang Mai (al norte) y los mercados flotantes del sur son experiencias gastronómicas que van mucho más allá de comer: son espectáculos visuales, olfativos y auditivos simultáneos.</p>',
        ],
      },
      {
        heading: 'Temporadas y presupuesto',
        paragraphs: [
          '<p>La temporada alta es de noviembre a abril: cielo despejado, mar en calma y precios más altos. En temporada de monzones (mayo-octubre) los precios bajan entre un 30 y un 50% y muchas islas quedan casi vacías. Las playas están igual de bonitas, solo que mojadas parte del tiempo.</p><p>Un viaje de 3 semanas con vuelos, alojamiento en hostels y guesthouses, comida callejera y algunas excursiones puede costar entre 1.500 y 2.500€. Es uno de los destinos con mejor relación calidad-precio del mundo.</p>',
        ],
      },
    ],
  },

  /* ────────── 12. NATURALEZA ────────── */
  {
    category: 'NATURALEZA',
    subcategory: 'Parques nacionales',
    emoji: '🌿',
    title: 'Islandia: el país donde la Tierra todavía está viva',
    summary: 'Géiseres, cascadas, auroras y volcanes activos en la isla más salvaje de Europa',
    image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=800&q=80',
    destination: 'Islandia',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>Islandia parece el planeta en sus primeros días. Géiseres que explotan cada diez minutos, cascadas que caen sobre campos de lava negra, glaciares que se derriten en lagunas llenas de icebergs azules y volcanes que recuerdan de vez en cuando que aquí la Tierra no ha terminado de formarse. No es exageración: Islandia es una de las zonas geológicamente más activas del planeta.</p><p>La isla entera tiene la superficie de Andalucía y menos de 400.000 habitantes. Fuera de Reikiavik, la sensación de estar completamente solo en el fin del mundo es constante y absolutamente adictiva.</p>',
        ],
      },
      {
        heading: 'El Círculo Dorado y más allá',
        paragraphs: [
          '<p>El Círculo Dorado (Geysir, Gullfoss y Þingvellir) es la ruta clásica desde Reikiavik y se puede hacer en un día. Pero lo mejor de Islandia está fuera del circuito organizado y requiere coche y tiempo.</p><ul><li><strong>Jökulsárlón</strong>: la laguna glaciar llena de icebergs azules y blancos. Los bloques de hielo flotan hasta la playa negra de diamantes al lado.</li><li><strong>Landmannalaugar</strong>: montañas de riolita con colores imposibles (rosa, amarillo, verde, morado) y aguas termales naturales gratuitas al final de la pista.</li><li><strong>Costa de Vik</strong>: las rocas basálticas hexagonales de Reynisfjara y el mar negro más furioso de Europa.</li><li><strong>Westfjords</strong>: la región menos visitada, con fiordos estrechos, acantilados de aves y cero turistas.</li></ul>',
        ],
      },
      {
        heading: 'La aurora boreal en Islandia',
        paragraphs: [
          '<p>Islandia es uno de los mejores lugares del mundo para ver auroras boreales gracias a su posición geográfica justo debajo del Círculo Polar Ártico. La temporada va de septiembre a marzo. Lo que no dice nadie es que necesitas cielo despejado, alejarte de la contaminación lumínica de Reikiavik y tener suerte con la actividad solar.</p><p>La app Aurora Forecast muestra la probabilidad de aurora en tiempo real. Cuando el índice KP está por encima de 3 y el cielo está despejado, sal del coche y mira hacia el norte.</p>',
        ],
      },
      {
        heading: 'El Ring Road: la vuelta completa',
        paragraphs: [
          '<p>La carretera 1 rodea toda la isla en 1.332 km. Con 8-10 días tienes tiempo suficiente para recorrerla sin prisa y parar en todo lo que merece la pena. El este de la isla, los fiordos orientales, es la parte menos visitada y la más dramáticamente bonita. Un 4x4 es necesario si quieres salirte del Ring Road hacia las pistas interiores (F-roads), que solo se abren en verano.</p>',
        ],
      },
      {
        heading: 'Cuándo ir y cuánto cuesta',
        paragraphs: [
          '<p>Junio y julio son los meses del sol de medianoche: 24 horas de luz. Perfecto para senderismo pero imposible para ver auroras. Septiembre y octubre tienen una mezcla perfecta: algo de luz diurna para explorar y noches oscuras para las auroras. El alojamiento y la gasolina son caros (Islandia está en el top 5 de países más caros de Europa), pero cocinar en el camping o en el alojamiento reduce el gasto considerablemente.</p>',
        ],
      },
    ],
  },

  /* ────────── 13. CIUDAD ────────── */
  {
    category: 'CIUDAD',
    subcategory: 'Capital americana',
    emoji: '🏙️',
    title: 'Nueva York: la ciudad que nunca te deja indiferente',
    summary: 'Rascacielos, bagels, Central Park y la energía más intensa del planeta en cada esquina',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80',
    destination: 'Nueva York, EEUU',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>Nueva York no necesita presentación pero sí merece explicación. No es la ciudad más bonita del mundo, ni la más antigua, ni la más barata. Pero tiene algo que no tiene ninguna otra: una energía que se siente desde el momento en que sales del metro y te encuentras en medio de Manhattan con rascacielos a todos lados y ocho millones de personas que van a lo suyo sin mirarte.</p><p>Es la ciudad donde cualquiera puede ser anónimo y extraordinario al mismo tiempo. La libertad que da eso es adictiva. Por eso la gente vuelve.</p>',
        ],
      },
      {
        heading: 'Los barrios que merece la pena conocer de verdad',
        paragraphs: [
          '<ul><li><strong>Brooklyn (Dumbo y Williamsburg)</strong>: la vista del puente de Brooklyn desde el parque de Dumbo es la mejor foto de la ciudad. Williamsburg tiene los mejores cafés y restaurantes de toda Nueva York.</li><li><strong>Harlem</strong>: gospel en directo los domingos por la mañana en iglesias históricas. Reserva con semanas de antelación: es gratuito pero hay que llegar pronto.</li><li><strong>The High Line</strong>: parque lineal sobre una vía de tren elevada. Entra en la calle 34 y camina hacia el norte. Gratis y con las mejores vistas de Chelsea.</li><li><strong>Flushing, Queens</strong>: el barrio chino más auténtico de los EEUU. Dim sum a las 10 de la mañana, bolas de tang yuan y tiendas donde nadie habla inglés.</li><li><strong>Lower East Side</strong>: el barrio judío histórico con los mejores bagels de la ciudad y una escena de bares y galerías de arte increíble.</li></ul>',
        ],
      },
      {
        heading: 'Cómo moverse sin gastar de más',
        paragraphs: [
          '<p>El metro funciona 24 horas, 7 días a la semana y cuesta 2,90$ por trayecto. Con una tarjeta de siete días ilimitados (34$) puedes moverte sin pensar. Uber y taxi son mucho más caros y muchas veces más lentos por el tráfico.</p><p>Los museos más importantes tienen una tarifa "sugerida" en lugar de precio fijo: en el Metropolitan Museum puedes pagar lo que quieras y entrar igualmente. El MoMA tiene noches gratuitas los viernes. El Museum of Natural History tiene un sistema similar al Met.</p>',
        ],
      },
      {
        heading: 'Comer bien sin arruinarse',
        paragraphs: [
          '<p>Nueva York tiene la gastronomía más diversa del mundo por razones demográficas. Come en los delis de barrio, en los food trucks y en Chinatown o Flushing. Un bagel con salmón y queso crema en un deli cuesta 8-10$. Un bowl de dim sum en Flushing, 12$. Un slice de pizza en una pizzería italiana del Village, 4$.</p><p>Evita comer en Times Square: estás pagando la ubicación, no la comida. Los mejores restaurantes de la ciudad están en el Village, Brooklyn Heights o el Lower East Side.</p>',
        ],
      },
      {
        heading: 'Lo que no puedes marcharte sin ver',
        paragraphs: [
          '<p>El Top of the Rock al atardecer (no el Empire State: el edificio Rockefeller te da la mejor vista porque el Empire State aparece en ella). Central Park al amanecer antes de que lleguen los corredores. El Brooklyn Bridge a pie, cruzándolo de Manhattan a Brooklyn un domingo por la mañana. Y la librería Strand, con 18 millas de libros de segunda mano, en Broadway con la calle 12. Dos horas mínimas.</p>',
        ],
      },
    ],
  },

  /* ────────── 14. ISLAS ────────── */
  {
    category: 'ISLAS',
    subcategory: 'Atlántico',
    emoji: '🏝️',
    title: 'Azores: el secreto mejor guardado de Europa en medio del Atlántico',
    summary: 'Nueve islas volcánicas con lagos cráter, ballenas, termas naturales y cero masificación',
    image: 'https://images.unsplash.com/photo-1565538420870-da08ff96a207?auto=format&fit=crop&w=800&q=80',
    destination: 'Azores, Portugal',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>Las Azores son nueve islas volcánicas en medio del Atlántico, a 1.500 km de Lisboa. Son portuguesas, están en Europa, y parecen completamente de otro mundo. Los lagos de las calderas volcánicas son verdes y azules al mismo tiempo. Las vacas pastan junto al océano en prados tan verdes que parecen pintados. Y puedes bañarte en aguas termales naturales en la orilla del mar mientras miras el horizonte atlántico.</p><p>Son uno de los destinos más sobrecogedores y menos masificados de Europa. Eso, que es un lujo en el mundo actual, está empezando a cambiar. Los que ya las conocen dicen que hay que ir pronto.</p>',
        ],
      },
      {
        heading: 'Las islas principales',
        paragraphs: [
          '<ul><li><strong>São Miguel</strong>: la más grande y la más fácil de llegar. Las calderas gemelas de Sete Cidades (un lago verde y uno azul separados por un puente) son la imagen más icónica del archipiélago. Las Furnas tienen aguas termales en medio de un parque botánico y un guiso de cozido que se cocina directamente en el suelo volcánico durante horas.</li><li><strong>Flores</strong>: la más bonita visualmente. Cascadas que caen directamente al océano, lagos de colores en calderas y una luz que solo existe en el Atlántico norte.</li><li><strong>Pico</strong>: la montaña más alta de Portugal (2.351 m). Subir al volcán al amanecer es una experiencia que cambia la perspectiva de las cosas. El viñedo de lava negra protegido por la UNESCO produce un vino blanco completamente único.</li><li><strong>Faial</strong>: conocida como "la isla azul" por las hortensias. Puerto de tránsito de veleros que cruzan el Atlántico. Buceo excepcional.</li></ul>',
        ],
      },
      {
        heading: 'Avistamiento de cetáceos',
        paragraphs: [
          '<p>Las aguas profundas alrededor de las Azores son una de las zonas de avistamiento de ballenas más importantes del mundo. De abril a octubre pasan por aquí cachalotes (residentes permanentes), delfines comunes, orcas en migración y, si hay suerte, ballenas azules y jorobadas. Los tours salen principalmente desde Pico o Faial y duran entre 2 y 4 horas en barco.</p><p>Las Azores tienen una regulación muy estricta del avistamiento para proteger a los animales. Los operadores certificados mantienen distancias de seguridad y los avistamientos garantizados son una realidad aquí más que en ningún otro sitio del mundo.</p>',
        ],
      },
      {
        heading: 'Cómo organizarlo',
        paragraphs: [
          '<p>Vuelos directos desde Lisboa o Oporto a São Miguel con SATA o Ryanair. Los vuelos entre islas son baratos y rápidos. Un road trip de 10 días puede cubrir fácilmente 3-4 islas. El alquiler de coche en cada isla es imprescindible y relativamente económico (25-40€/día).</p><p>Las Azores son uno de los pocos destinos europeos donde el viaje sigue siendo genuinamente asequible: alojamiento rural excelente por 50-80€, pescado fresco por 10-15€ y actividades de naturaleza sin los precios inflados del turismo masivo.</p>',
        ],
      },
    ],
  },

  /* ────────── 15. LUJO ────────── */
  {
    category: 'LUJO',
    subcategory: 'Experiencias exclusivas',
    emoji: '✨',
    title: 'Dubái: donde el futuro ya existe y la extravagancia es el idioma oficial',
    summary: 'El rascacielos más alto del mundo, el hotel más fotografiado y el desierto a 20 minutos del centro',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    destination: 'Dubái, EAU',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>Dubái es el único lugar del mundo donde puedes desayunar en un rascacielos de 150 plantas, comer bajo el mar en un restaurante de cristal, esquiar en una pista cubierta por la tarde y cenar en el desierto con un espectáculo de danza beduina por la noche. Todo en el mismo día. Sin ironia.</p><p>Es excesivo. Es artificial. Y es completamente fascinante porque hay algo en ese exceso que resulta honesto: Dubái no finge ser otra cosa. Es la ciudad más ambiciosa del mundo y lleva décadas demostrándolo con acero, cristal y dinero.</p>',
        ],
      },
      {
        heading: 'El Burj Khalifa por dentro',
        paragraphs: [
          '<p>El edificio más alto del mundo (828 metros, 163 plantas) tiene dos miradores. El At the Top del piso 124 cuesta unos 35€ y es suficiente para ver hasta Abu Dhabi en un día despejado. El At the Top SKY del piso 148 cuesta el doble y te deja prácticamente en las nubes, literalmente.</p><p>El espectáculo de las fuentes del Burj Khalifa al atardecer es completamente gratuito y ocurre cada 30 minutos desde las 18h. Es uno de los mejores shows de luz y agua del mundo y no cuesta nada verlo desde el paseo del lago del Dubai Mall.</p>',
        ],
      },
      {
        heading: 'Lo que vale cada céntimo',
        paragraphs: [
          '<ul><li><strong>Desert Safari al atardecer</strong>: dunas en 4x4 con conductor local, sandboard, cena en campamento beduino con música y danza del vientre. Entre 60 y 120€ según el operador. Absolutamente imprescindible.</li><li><strong>Barrio Al Fahidi</strong>: el único rincón del Dubái antiguo que sobrevivió a la modernización. Callejuelas de adobe, galerías de arte y las abras (barcas tradicionales) por el Creek por 1 dírham.</li><li><strong>Gold Souk y Spice Souk</strong>: los mercados tradicionales del Dubái histórico. El oro se puede regatear; las especias no.</li><li><strong>Palm Jumeirah</strong>: el archipiélago artificial con forma de palmera. El monorraíl da la vuelta completa por 5€ y las vistas aéreas son extraordinarias.</li></ul>',
        ],
      },
      {
        heading: 'Cuándo ir y cómo sobrevivir al calor',
        paragraphs: [
          '<p>De noviembre a marzo el clima es perfecto: 25-28°C, sin humedad, sol constante. Es la temporada alta y los precios de hotel son los más altos. En verano el termómetro llega a 45°C con humedad intensa. Solo podrás estar en exteriores de noche. La compensación: los hoteles de 5 estrellas tienen descuentos de hasta el 60% en julio y agosto.</p>',
        ],
      },
    ],
  },

  /* ────────── 16. AVENTURA ────────── */
  {
    category: 'AVENTURA',
    subcategory: 'Deportes extremos',
    emoji: '🧗',
    title: 'Queenstown: la capital mundial de la adrenalina en el fin del mundo',
    summary: 'Bungee jumping, parapente, esquí y los lagos más azules que hayas visto en tu vida',
    image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80',
    destination: 'Queenstown, Nueva Zelanda',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>Queenstown es una ciudad pequeña en la isla sur de Nueva Zelanda, rodeada por el lago Wakatipu y los picos de los Remarkables. Es el lugar donde se inventó el bungee jumping comercial (en 1988, en el puente Kawarau) y donde la gente va específicamente para tirarse desde sitios muy altos y moverse a velocidades que el cuerpo no debería alcanzar.</p><p>Pero lo que sorprende de Queenstown es que también es increíblemente bonita. La combinación de naturaleza extrema y adrenalina organizada no existe en ningún otro sitio del mundo con este nivel de calidad y variedad.</p>',
        ],
      },
      {
        heading: 'Qué hacer (si te atreves)',
        paragraphs: [
          '<ul><li><strong>Bungee en el Kawarau Bridge</strong>: el original. 43 metros sobre el río. Desde aquí empezó todo en 1988.</li><li><strong>Nevis Bungy</strong>: 134 metros de caída libre. El segundo bungee más alto del mundo. Los 8 segundos de caída parecen 30.</li><li><strong>Parapente desde Bob\'s Peak</strong>: vuelo en tándem sobre el lago Wakatipu. Sin riesgo, con las mejores vistas de todo el viaje.</li><li><strong>Skydive desde 4.500 metros</strong>: caída libre con los Alpes del sur debajo. El paisaje durante los 60 segundos de caída no tiene descripción posible.</li><li><strong>Jet boat en el cañón Shotover</strong>: giros a 360° a centímetros de las rocas, a 85 km/h. Los pasajeros salen empapados y con la adrenalina disparada.</li></ul>',
        ],
      },
      {
        heading: 'Más allá de la adrenalina',
        paragraphs: [
          '<p>La carretera hasta Milford Sound (3 horas desde Queenstown) es una de las más espectaculares del planeta. El fiordo, con sus cascadas que caen desde 1.200 metros y los delfines que nadan junto al barco, es uno de los espectáculos naturales más impresionantes de Nueva Zelanda. Reserva el crucero en el fiordo con semanas de antelación.</p><p>El vino de la región de Otago Central, producido a pocos kilómetros, es uno de los mejores pinot noir del mundo. Las bodegas hacen visitas y degustaciones que contrastan perfectamente con la adrenalina del día anterior.</p>',
        ],
      },
      {
        heading: 'Esquí en los Remarkables',
        paragraphs: [
          '<p>La temporada de esquí va de junio a septiembre. Los Remarkables y Coronet Peak son las dos estaciones accesibles desde Queenstown en 30-40 minutos. La nieve en el hemisferio sur tiene una calidad distinta a la europea: más seca y más ligera. Los precios de forfait rondan los 80-100€ al día, similar a Europa.</p>',
        ],
      },
    ],
  },

  /* ────────── 17. CULTURAL ────────── */
  {
    category: 'CULTURAL',
    subcategory: 'Tradiciones',
    emoji: '🏛️',
    title: 'Marrakech: todos los sentidos al límite en el corazón de Marruecos',
    summary: 'Zocos laberínticos, riads con patio interior, especias y una medina declarada Patrimonio de la Humanidad',
    image: 'https://images.unsplash.com/photo-1548021682-2720f4f3b5d5?auto=format&fit=crop&w=800&q=80',
    destination: 'Marrakech, Marruecos',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>Marrakech es un choque de estímulos del que nadie sale indiferente. El olor del comino y la canela en el zoco, el ruido de los artesanos golpeando el cobre en la calle de los caldereros, el caos de la plaza Jemaa el-Fna al anochecer con las cobras, los músicos gnawa, los contadores de historias y los vendedores de zumo de naranja que gritan a coro.</p><p>La ciudad es intensa, es preciosa y es completamente distinta a cualquier otro lugar de la cuenca mediterránea. Está a 3 horas de vuelo desde España. Parece el otro extremo del mundo.</p>',
        ],
      },
      {
        heading: 'La medina: cómo perderse bien',
        paragraphs: [
          '<p>La medina de Marrakech está declarada Patrimonio de la Humanidad y es un laberinto de callejuelas donde te pierdes aunque vayas con mapa abierto. Lo mejor es dejarse llevar: cada callejón lleva a algo inesperado. Una zapatería, un taller de tinte de lana, una pastelería con pastela que sale del horno. El miedo a perderse es el principal obstáculo para disfrutar de Marrakech.</p>',
        ],
      },
      {
        heading: 'Lo que no te puedes perder',
        paragraphs: [
          '<ul><li><strong>Las tenerías de cuero</strong>: las más antiguas del mundo en funcionamiento. Ver a los curtidores trabajando con los cueros naturales desde las terrazas de arriba (que pertenecen a tiendas de cuero) es como viajar varios siglos atrás.</li><li><strong>El Palacio Bahía</strong>: 160 habitaciones, jardines, fuentes y mosaicos de colores. Era el palacio del gran visir del siglo XIX. La entrada cuesta 70 dírhams (unos 6€).</li><li><strong>El zoco de las especias</strong>: ras el hanout, cúrcuma, azafrán local y agua de rosas. Los precios se negocian siempre. Lo que no se negocia es la calidad: es excepcional.</li><li><strong>Jemaa el-Fna al atardecer</strong>: cuando los músicos gnawa empiezan, las luces de las terrazas se encienden y los puestos de cocina llenan la plaza de humo. Es la plaza más viva del mundo.</li></ul>',
        ],
      },
      {
        heading: 'Dormir en un riad',
        paragraphs: [
          '<p>Los riads son casas tradicionales marroquíes con patio interior donde el mundo exterior desaparece por completo. Desde fuera parecen muros de adobe sin ninguna gracia. Por dentro son jardines con fuentes, azulejos de colores, silencio y luz cenital. Hay riads desde 40€ hasta 500€ la noche. Todos tienen en común el desayuno con pastela dulce, khobz caliente, miel de argan y té de menta.</p>',
        ],
      },
      {
        heading: 'Excursión al desierto',
        paragraphs: [
          '<p>Desde Marrakech se organizan excursiones de 2-3 días al desierto de Merzouga, en el Sáhara, con paso por Ouarzazate (ciudad del cine africano) y el valle del Draa. Dormir en una jaima en las dunas de Erg Chebbi y ver el amanecer sobre el Sáhara es uno de esos planes que cambian la percepción del tiempo y del espacio.</p>',
        ],
      },
    ],
  },

  /* ────────── 18. ROMÁNTICO ────────── */
  {
    category: 'ROMÁNTICO',
    subcategory: 'Escapada en pareja',
    emoji: '💕',
    title: 'Praga: la ciudad de cuento que enamora en cualquier época del año',
    summary: 'Puentes de piedra, calles medievales, cerveza de barril y uno de los centros históricos más bonitos de Europa',
    image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=800&q=80',
    destination: 'Praga, Rep. Checa',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>Praga sobrevivió a la Segunda Guerra Mundial prácticamente intacta. Por eso su centro histórico parece un decorado de película: iglesias barrocas, palacios renacentistas, calles de adoquín y el río Moldava cruzado por el Puente de Carlos, con sus 30 estatuas de santos mirando el agua. Es una de las ciudades más fotogénicas de Europa y una de las más asequibles de la Europa central.</p><p>Pero lo mejor de Praga no son los monumentos. Es la sensación de caminar por el casco antiguo de noche, con la niebla sobre el río y las farolas de gas iluminando los adoquines. Hay pocas ciudades europeas que tengan esa atmósfera tan particular.</p>',
        ],
      },
      {
        heading: 'Un fin de semana perfecto en Praga',
        paragraphs: [
          '<ul><li><strong>El Puente de Carlos a las 6am</strong>: completamente vacío, con niebla sobre el río y los santos solos. A las 9 hay decenas de turistas y vendedores de souvenirs.</li><li><strong>El Castillo de Praga al atardecer</strong>: la vista de la ciudad desde la terraza es la mejor postal del viaje. La catedral de San Vito, dentro del complejo, es una de las más impresionantes de Europa.</li><li><strong>El barrio de Malá Strana</strong>: al pie del castillo, con casas de colores pastel, jardines secretos y tabernas medievales donde la cerveza Pilsner cuesta menos de un euro.</li><li><strong>El barrio judío (Josefov)</strong>: seis sinagogas y el cementerio judío más antiguo de Europa, con hasta 12 capas de enterramientos superpuestos.</li></ul>',
        ],
      },
      {
        heading: 'La cerveza como cultura',
        paragraphs: [
          '<p>La República Checa tiene el mayor consumo de cerveza per cápita del mundo. La Pilsner Urquell no filtrada de barril es una experiencia completamente distinta a la que conoces de la botella. En el restaurante Lokál, la sirven a 4°C con una técnica de tirado específica que les lleva meses de entrenamiento dominar.</p><p>Los pivnice (cervecerías) de barrio donde van los praguenses de verdad están en Žižkov, Vinohrady o Holešovice. Sin carta en inglés, con los precios en coronas y la mejor conversación de tu viaje si alguien te acepta en su mesa.</p>',
        ],
      },
      {
        heading: 'Por qué es perfecta para una escapada en pareja',
        paragraphs: [
          '<p>Praga es compacta (el casco histórico se cruza a pie en 20 minutos) y tiene una relación calidad-precio excepcional para ser Europa Central. Una cena con dos platos y dos cervezas en un buen restaurante local cuesta 20-30€. Los hoteles boutique en el casco antiguo son hermosos y razonables comparados con París o Roma. Y en invierno, con los mercados de Navidad en cada plaza y el olor a vino caliente, es directamente mágica.</p>',
        ],
      },
    ],
  },

  /* ────────── 19. FESTIVAL ────────── */
  {
    category: 'FESTIVAL',
    subcategory: 'Tradiciones locales',
    emoji: '🎉',
    title: 'Oktoberfest: la fiesta de la cerveza más grande del mundo en Múnich',
    summary: 'Dos semanas de litros, dirndl, pretzel gigante y una alegría bávara completamente contagiosa',
    image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=800&q=80',
    destination: 'Múnich, Alemania',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>El Oktoberfest empezó en 1810 como una fiesta de bodas reales bávaras y nunca paró. Hoy dura 16-18 días, recibe 6 millones de visitantes al año de todo el mundo, consume 7 millones de litros de cerveza y tiene carpas con capacidad para 10.000 personas cada una donde las bandas tocan en directo mientras todo el mundo brinda, canta y baila encima de los bancos.</p><p>Es ridículo, es excesivo y es extraordinariamente divertido. Hay algo en la combinación de música bávara, litros de cerveza rubia y 10.000 desconocidos cantando al unísono que elimina cualquier barrera cultural o lingüística.</p>',
        ],
      },
      {
        heading: 'Las carpas: cómo funciona',
        paragraphs: [
          '<p>Hay 17 carpas grandes de las principales cervecerías de Múnich (Hofbräu, Augustiner, Paulaner, Löwenbräu…) y decenas de carpas más pequeñas. Sin reserva es casi imposible conseguir sitio sentado en los fines de semana de la primera semana. La reserva hay que hacerla en la página oficial del Oktoberfest o directamente con cada carpa, y suele abrirse en enero-febrero para el festival de septiembre-octubre.</p><p>Las cervezas se sirven solo en masskrug, la jarra de un litro. El precio de cada una ronda los 13-15€. La comida es inevitable: pollo asado entero, salchichas blancas con mostaza dulce y bretzel gigante.</p>',
        ],
      },
      {
        heading: 'Los trajes tradicionales',
        paragraphs: [
          '<p>El dirndl (vestido tradicional bávaro para mujeres) y el lederhosen (pantalón de cuero para hombres) no son obligatorios pero la experiencia mejora notablemente. Puedes alquilarlos cerca del recinto o comprarlos en las tiendas del centro de Múnich. Los bávaros llevan los suyos con orgullo y aprecian que los visitantes hagan el esfuerzo.</p>',
        ],
      },
      {
        heading: 'Múnich más allá del Oktoberfest',
        paragraphs: [
          '<p>Múnich es una ciudad que merece al menos un día entero de exploración independiente del festival. El Englischer Garten (más grande que Central Park de Nueva York) tiene un río artificial donde los surfistas locales montan olas todo el año. El Deutsches Museum es el mayor museo de ciencia y tecnología del mundo. Y el Nymphenburg, el palacio de verano de los reyes bávaros, es comparable a Versalles en escala y en belleza de los jardines.</p>',
        ],
      },
    ],
  },

  /* ────────── 20. NATURALEZA ────────── */
  {
    category: 'NATURALEZA',
    subcategory: 'Fauna salvaje',
    emoji: '🌿',
    title: 'Safari en el Serengueti: ver la Gran Migración con tus propios ojos',
    summary: 'Dos millones de ñus, leones al atardecer y el espectáculo natural más impresionante del planeta',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    destination: 'Tanzania',
    active: true,
    body: [
      {
        heading: '',
        paragraphs: [
          '<p>La Gran Migración del Serengueti es el mayor movimiento de animales terrestres del planeta. Dos millones de ñus, cebras y gacelas recorren un circuito de 1.800 km entre Tanzania y Kenia siguiendo las lluvias con una precisión que los científicos todavía no terminan de explicar del todo. Los cruces del río Mara, donde los cocodrilos esperan inmóviles bajo el agua, son uno de los espectáculos más dramáticos de la naturaleza.</p><p>Ver el Serengueti en silencio desde un Land Cruiser al amanecer, con una manada de elefantes en el horizonte y el cielo pasando de negro a naranja, es una de esas experiencias que reordenan permanentemente las prioridades.</p>',
        ],
      },
      {
        heading: 'La migración mes a mes',
        paragraphs: [
          '<ul><li><strong>Enero-marzo</strong>: los ñus paren en el sur del Serengueti. Hasta 8.000 crías nacen al día durante las semanas del pico. Los guepardos y los leones están a sus anchas.</li><li><strong>Abril-mayo</strong>: la manada se mueve hacia el norte siguiendo las lluvias. El parque está más verde y menos turístico.</li><li><strong>Junio-julio</strong>: los cruces del río Grumeti en el Serengueti occidental. Los primeros cruces dramáticos.</li><li><strong>Agosto-septiembre</strong>: los cruces del río Mara, en la frontera con el Masái Mara (Kenia). El momento más intenso de la migración. Reservar con más de un año de antelación es necesario.</li><li><strong>Octubre-noviembre</strong>: la vuelta al sur. Segundo cruce del Mara, igual de dramático.</li></ul>',
        ],
      },
      {
        heading: 'El Ngorongoro: el zoo natural más grande del mundo',
        paragraphs: [
          '<p>El cráter del Ngorongoro tiene 20 km de diámetro y es el ecosistema volcánico más grande del mundo intacto. Dentro viven permanentemente los cinco grandes (elefante, rinoceronte negro, búfalo, leopardo y león) sin necesidad de emigrar: el cráter es como una trampa natural perfecta llena de recursos. Un safari de un día aquí combinado con el Serengueti es la combinación perfecta.</p>',
        ],
      },
      {
        heading: 'Los balloon safari',
        paragraphs: [
          '<p>Despegar en globo al amanecer sobre las llanuras del Serengueti con la manada debajo es la experiencia más memorable del viaje. Dura entre 60 y 90 minutos y termina con un desayuno en el bush servido en una mesa con mantel. Cuesta entre 500 y 650$ por persona y se reserva a través del operador del safari. Si el presupuesto lo permite, es una de las mejores inversiones que puedes hacer en un viaje.</p>',
        ],
      },
      {
        heading: 'Cómo organizar el safari',
        paragraphs: [
          '<p>Los vuelos internacionales llegan a Kilimanjaro International Airport (JRO) o Dar es Salaam. Desde Arusha salen todos los safaris del norte de Tanzania. Un safari de 5-7 días con Serengueti más Ngorongoro, en jeep compartido con guía y alojamiento en lodge o tented camp, cuesta entre 2.500 y 5.000€ por persona todo incluido. No es barato, pero la experiencia es literalmente única en el mundo.</p>',
        ],
      },
    ],
  },
];

export const SEED_COUNT = ARTICLES.length;

export async function seedInspirations(onProgress) {
  const results = [];
  for (let i = 0; i < ARTICLES.length; i++) {
    const article = ARTICLES[i];
    try {
      const id = await createInspiration({
        ...article,
        readingTime: calcReadingTime(article.body),
      });
      results.push({ ok: true, title: article.title, id });
    } catch (err) {
      results.push({ ok: false, title: article.title, error: err.message });
    }
    if (onProgress) onProgress(i + 1, ARTICLES.length);
  }
  return results;
}
