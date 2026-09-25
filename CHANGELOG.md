# Changelog

Este changelog usa una organizacion trimestral para dar un panorama rapido del estado del proyecto.

## [Unreleased]

- Sin cambios pendientes.

## Vista rapida (Q3 2026 en progreso)

- Estado general: mejoras de navegacion, internacionalizacion, descubrimiento de contenido, SEO, contenido en tiempo real, videos editoriales y experiencia interactiva en curso.
- Stack actual: Next.js 16.3.5, React 19, Sanity 5, ESLint 9.
- Calidad tecnica: lint, 12 pruebas y build de produccion aprobados; esquema y dos borradores de Sanity validados sin errores. Videos revisados localmente en navegador, incluidos reproduccion, subtitulos, carga diferida, teclado, temas e idiomas. Las 24 comprobaciones HTTP corresponden a la actualizacion previa de Next.js; la revision de videos en produccion se realiza despues del despliegue.
- Riesgos abiertos: quedan 25 paquetes afectados en la auditoria local (13 altos, 11 moderados y uno bajo), un error de formularios reproducido tambien antes de la actualizacion y la verificacion de Sanity Live tras desplegar la correccion.

## 2026

### Q3 (Jul-Sep) - Navegacion, internacionalizacion, descubrimiento de contenido, SEO y experiencia interactiva

#### Resumen

- Se agrego ordenamiento por URL en proyectos, blog y categorias.
- Se agrego filtrado multi-select por etiquetas en proyectos y blog.
- Se incorporo un filtro por tipo de contenido en categorias para alternar entre proyectos y posts.
- Se mantuvo el ordenamiento en servidor para conservar las paginas principales como Server Components.
- Se habilito SEO administrable desde Sanity para todas las rutas publicas indexables.
- Se centralizo la generacion de title, meta description, canonical, Open Graph y Twitter Cards.
- Se unifico el modelo SEO de articulos, proyectos y categorias y se retiro la compatibilidad con los campos obsoletos.
- Se sustituyo la revalidacion fija de cinco minutos por Sanity Live para reflejar publicaciones en menos de diez segundos.
- Se desplego una Sync Tag Function que invalida el cache de Vercel antes de refrescar las pestanas abiertas.
- Se separaron las lecturas publicas, el listener de comentarios y las escrituras autenticadas para evitar tokens en el navegador.
- Se retiro el Deploy Hook heredado `Sanity Deploy`; los despliegues por push a GitHub permanecen activos.
- Se integro Canary como mascota virtual contextual en blog, proyectos y categorias.
- Se agrego una flor ambiental para dar dinamismo a la mascota y conservar su estado entre vistas.
- Se ajusto la lectura de vinetas de Canary en mobile y la convivencia con los controles de filtros.
- Se diversifico el reposo de Canary y se corrigieron las reacciones pendientes y los mensajes de filtros retenidos.
- Se agrego una busqueda variable de la flor y una lluvia ocasional en la que Canary se cobija bajo sus petalos.
- Se incorporo internacionalizacion completa en espanol e ingles con rutas publicas prefijadas por locale.
- Se localizaron contenido, navegacion, formularios, accesibilidad y metadata SEO mediante next-intl y Sanity.
- Se agrego un selector de idioma compacto con icono animado que conserva la ruta, los slugs traducidos y los filtros activos.
- Se valido la integracion de filtros, internacionalizacion, SEO y Canary con build de produccion usando Turbopack.
- Se oculto la tabla de contenido vacia en posts y proyectos para aprovechar todo el ancho disponible.
- Se actualizo Next.js a 16.3.5 para corregir vulnerabilidades, conservando las versiones de React y Sanity y sin vulnerabilidades criticas en la auditoria local posterior.
- Se agrego el bloque Video al Portable Text de articulos y proyectos, con archivos MP4 en Sanity o enlaces de YouTube, portada opcional y subtitulos WebVTT.

#### Feature

- Agregar controles reutilizables para ordenar contenido por fecha y nombre.
- Permitir ordenar proyectos, posts y resultados de categorias con el parametro `sort`.
- Agregar filtro de tipo en categorias con el parametro `type` para mostrar todos, proyectos o posts.
- Agregar filtro multi-select de etiquetas en proyectos y blog con el parametro `tags`.
- Preservar filtros activos al navegar entre categorias.
- Incluir `date` y `_type` en consultas de Sanity necesarias para ordenar y filtrar listas combinadas.
- Crear un objeto SEO reutilizable con titulo opcional, meta description e imagen Open Graph.
- Agregar una seccion SEO en Studio con documentos de pagina de ID fijo y valores predeterminados.
- Generar metadata dinamica para inicio, sobre mi, contacto, proyectos, blog y categorias.
- Aplicar fallbacks de contenido y canonical sin parametros de filtros, orden o comentarios.
- Reutilizar el objeto SEO en articulos, proyectos y categorias sin mantener campos legacy.
- Migrar las consultas editoriales a `sanityFetch` con perspectiva published, CDN y etiquetas de sincronizacion.
- Montar `SanityLive` solo en el layout publico y mantener Studio fuera de la suscripcion en tiempo real.
- Agregar el endpoint autenticado `/api/revalidate-tags` para invalidar sync tags y el cache de las rutas publicas.
- Desplegar la funcion `invalidate-tags` en Sanity Blueprints con runtime Node.js 24 y alcance exclusivo al dataset production.
- Reducir `generateStaticParams` a consultas minimas de slugs publicados y conservar la generacion bajo demanda.
- Mantener los comentarios visibles y `client.listen` en el navegador sin credenciales, con las escrituras en un cliente exclusivo de servidor.
- Integrar Canary como mascota contextual en las barras de filtros de proyectos, blog y categorias.
- Crear un motor de acciones extensible para mapear intenciones del sitio a estados de Canary.
- Separar render de sprites, dialogos, acciones y estado persistente para facilitar nuevas animaciones.
- Agregar vinetas contextuales con mensajes automaticos para listados, filtros y estados sin resultados.
- Incorporar Flower como animacion ambiental que atrae a Canary y se comporta como lampara en modo oscuro.
- Variar el reposo de Canary con pausas aleatorias de 5 a 11 segundos, parpadeos, curiosidad, saltos ocasionales y momentos de quietud sin repetir el ultimo gesto.
- Reservar el glitch para la interaccion directa y acumular como maximo una reaccion al hacer clic durante un vuelo o salto, ejecutandola despues de aterrizar.
- Agregar una busqueda de la flor con miradas a uno o ambos lados y pausas variables antes de acercarse, reutilizando las animaciones de curiosidad y parpadeo.
- Incorporar lluvias breves de 4 a 6 segundos, con esperas aleatorias de 35 a 70 segundos y comienzo cuando Canary esta en reposo junto a la flor.
- Hacer que Canary se sorprenda, mire hacia la flor y salte para cobijarse bajo sus petalos, con una celebracion al terminar y retorno de la flor a su forma normal.
- Integrar rutas `/es` y `/en` con mensajes localizados y formatos regionales `es-MX` y `en`.
- Localizar documentos de Sanity por idioma y enlazar sus versiones mediante metadata de traduccion.
- Resolver slugs editoriales entre idiomas y preservar query params al cambiar de locale.
- Generar canonical, hreflang, Open Graph locale y sitemap bilingue sin alternates para contenido sin traduccion.
- Controlar el lanzamiento del contenido ingles mediante la variable `ENGLISH_ENABLED`.
- Reemplazar el selector `ES / EN` por un control circular de globo alineado con los iconos del encabezado.
- Incorporar `portableVideo` al cuerpo editorial compartido, con titulo obligatorio, portada opcional, pie de hasta 180 caracteres y seleccion de origen sin migrar contenido existente.
- Admitir MP4 de hasta 100.000.000 bytes mediante el uploader nativo de Sanity, con validacion posterior a la carga y antes de publicar. Los archivos requieren optimizacion previa, preferentemente H.264/AAC; no se incorpora conversion ni streaming adaptativo.
- Admitir pistas WebVTT opcionales en espanol e ingles, con etiqueta y sin idiomas duplicados. No se generan portadas ni subtitulos automaticamente.
- Validar enlaces normales, cortos, Shorts y embeds de YouTube con un parser compartido que comprueba el dominio y extrae el identificador; reproducir desde el principio sin importar HTML ni parametros del enlace.
- Mostrar una miniatura optimizada con `next/image` y cargar el iframe de `youtube-nocookie.com` solo al activar el boton de reproduccion. Conservar enlaces directos accesibles para ambas fuentes.
- Reproducir MP4 directamente desde Sanity con controles nativos, `playsInline`, `preload="none"` y `crossOrigin="anonymous"`, sin autoplay ni bucle, dentro de un marco adaptable 16:9 sin recortar el video.
- Localizar mensajes y controles propios en espanol e ingles, limitar la interactividad al reproductor y ampliar solo la proyeccion GROQ de detalle, conservando Sanity Live, los listados y las portadas principales.

#### Chore

- Actualizar `next-sanity` a la version 13 e incorporar las dependencias de Sanity Blueprints y Functions.
- Configurar las variables privadas de Vercel y de la funcion de sync tags sin versionar secretos.
- Rotar el token de escritura de comentarios, revocar el token publico anterior y eliminar `NEXT_PUBLIC_SANITY_TOKEN`.
- Eliminar el Deploy Hook `Sanity Deploy` para evitar builds completos en cada publicacion del CMS.
- Preparar una migracion idempotente de contenido bilingue con respaldo, dry run y auditoria posterior.
- Fijar `next` y `eslint-config-next` en 16.3.5 y actualizar el lockfile con sus dependencias compatibles, incluidos Sharp 0.35.4 y PostCSS 8.5.23.
- Agregar siete pruebas de `node:test` para URLs de YouTube, dominios enganosos, limite exacto de 100 MB, referencias ausentes, fuente activa y subtitulos; las 12 pruebas totales pasan junto con lint, build de produccion y `git diff --check`.
- Validar videos con fixtures locales en movil y escritorio, temas claro y oscuro, espanol e ingles, con y sin portada, varios bloques y contenido existente. Comprobar reproduccion, pausa, avance, pantalla completa, subtitulos y errores de archivo; verificar ausencia de solicitudes MP4 e iframes de YouTube antes de reproducir.
- Comprobar CORS y respuestas parciales HTTP 206 del CDN para MP4 y VTT desde localhost y el origen de produccion. Revisar insercion, edicion y cambio de fuente en Studio, y validar dos borradores temporales sin publicar contenido ficticio; estas verificaciones son previas al despliegue.

#### Fix

- Invalidar las rutas publicas junto con los sync tags para evitar respuestas del Full Route Cache con contenido anterior.
- Sincronizar las pestanas del sitio mediante `BroadcastChannel` cuando una conexion de Sanity Live recibe la actualizacion.
- Mantener `defineLive` en el limite de servidor y usar una version editorial para coordinar el refresco entre pestanas.
- Orientar a Canary hacia la flor cuando aparece cerca sin requerir desplazamiento.
- Evitar que la vineta de Canary choque con los botones de filtros en mobile.
- Mantener visible la vineta tras taps en filtros para permitir lectura en interacciones tactiles.
- Evitar desapariciones de Canary al cambiar de animacion, conservando los fotogramas montados y una imagen cargada mientras se prepara la siguiente accion.
- Esperar a que la flor termine de aparecer antes de iniciar su tiempo visible y la persecucion, con una pausa de reaccion variable.
- Mostrar la flor completamente formada y sin movimiento cuando se activa la preferencia de movimiento reducido.
- Evitar que pasar el cursor sobre Canary interrumpa un vuelo o salto en curso.
- Liberar la lectura de filtros al perder el foco, ocultar la pagina o interactuar fuera del control, incluso cuando una opcion desaparece sin emitir su evento de salida.
- Mantener limitada la duracion de los mensajes tactiles y estabilizar los valores predeterminados para evitar cancelaciones de temporizadores en cada render.
- Orientar a Canary hacia la flor antes de iniciar el desplazamiento y evitar que retroceda cuando ya se encuentra cerca.
- Pausar la busqueda, los gestos ambientales y la desaparicion de la flor durante la lluvia para completar la escena de refugio.
- Cancelar la lluvia y sus reacciones pendientes al hacer clic en Canary, leer filtros, cambiar de pagina, ocultarla, entrar en modo oscuro o activar movimiento reducido.
- Mantener filtros, comentarios y enlaces internos dentro del locale activo.
- Corregir alternates automaticos, metadata de traduccion y detalles editoriales del contenido ingles.
- Ocultar la tabla de contenido y su columna cuando no hay encabezados H2 o H3, permitiendo que el texto ocupe todo el ancho en posts y proyectos.
- Evitar el renderizado del indice cuando la lista de encabezados esta vacia, es nula o no esta definida, conservando la jerarquia y los enlaces cuando hay titulos.
- Corregir los avisos de seguridad de Next.js, incluido `GHSA-m99w-x7hq-7vfj`; Next.js, Sharp y PostCSS dejan de aparecer como paquetes afectados en la auditoria del lockfile. La correccion en produccion requiere desplegar esta actualizacion.
- Validar solo la fuente seleccionada del bloque Video, evitando que un enlace de YouTube incompleto y oculto impida publicar un archivo MP4; conservar los datos al alternar origen.
- Permitir que los videos ocupen el ancho disponible de la columna editorial cuando hay tabla de contenido, incluso en posts con poco texto.

#### Style

- Ajustar los filtros a una UI compacta alineada a la derecha con iconos outline.
- Reutilizar iconos minimalistas desde el archivo compartido de iconos.
- Agregar icono de etiqueta reconocible para el filtro de tags.
- Marcar el elemento activo con color primario y fondo suave sin indicadores redundantes.
- Alinear Canary, Flower y la vineta con la fila compacta de controles.
- Extender la nube sobre Canary y la flor, con los petalos formando una cubierta elevada, el tallo a un costado y las gotas detenidas sobre el refugio.
- Compactar la lluvia en pantallas pequenas para conservar el espaciado original entre el titulo, Canary y los filtros antes, durante y despues de la animacion.
- Igualar tamano, alineacion y contraste del selector de idioma con el control de tema.
- Animar estrellas sutiles alrededor del icono de idioma y respetar `prefers-reduced-motion`.
- Unificar la separacion entre los iconos sociales y los controles de idioma y tema.
- Aumentar a 28 px los controles de idioma y tema en mobile y separar visualmente las utilidades de las redes sociales.
- Duplicar el espacio a cada lado del separador entre redes sociales y controles: de 12 a 24 px en escritorio y de 4 a 8 px en mobile pequeño.

#### Commits de referencia

- [f874668](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/f874668) - feat: agregar filtros de contenido
- [e134146](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/e134146) - feat: agregar filtro de tags
- [6807f3e](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/6807f3e) - feat: agregar SEO administrable desde Sanity
- [e080f98](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/e080f98) - feat: agregar actualizacion automatica de contenido
- [a990c32](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/a990c32) - fix: asegurar invalidacion del cache de rutas
- [2f05a8a](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/2f05a8a) - fix: sincronizar actualizaciones entre pestanas
- [12bd9fa](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/12bd9fa) - fix: mantener Sanity Live en el servidor
- [22f7551](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/22f7551) - feat: integrar Canary como mascota contextual
- [bb97aea](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/bb97aea) - fix: orientar Canary hacia la flor cercana
- [b526831](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/b526831) - fix: evitar choque de vineta de Canary en movil
- [9296193](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/9296193) - fix: mantener vineta de Canary tras tap en filtros
- [753a342](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/753a342) - feat: implementar internacionalizacion en espanol e ingles
- [d1bfa28](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/d1bfa28) - fix: excluir alternates automaticos del lanzamiento bilingue
- [3907e8c](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/3907e8c) - fix: corregir metadatos de traduccion de Sanity
- [247b1e0](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/247b1e0) - fix: mejorar revision editorial del contenido ingles
- [f99897e](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/f99897e) - fix: corregir terminologia de pronombres reflexivos
- [ecab222](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/ecab222) - feat: mejorar selector de idioma animado
- [1718031](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/1718031) - style: unificar controles de navegacion
- [c20ce90](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/c20ce90) - style: ampliar separacion entre redes sociales y controles
- [460b9cd](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/460b9cd) - fix: estabilizar animaciones y persecucion de Canary
- [2ac951d](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/2ac951d) - feat: variar reposo de Canary y estabilizar interacciones
- [b49d694](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/b49d694) - feat: agregar busqueda y orientacion natural de Canary
- [20de65b](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/20de65b) - feat: agregar lluvia y refugio floral para Canary
- [d99223e](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/d99223e) - fix: ocultar tabla de contenido vacia
- [a6af7e6](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/a6af7e6) - fix: actualizar Next.js para corregir vulnerabilidades
- [101dcc9](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/101dcc9) - feat: agregar videos en Portable Text

### Q2 (Abr-Jun) - Modernizacion y estabilidad

#### Resumen

- Se completo la migracion de la plataforma a un stack moderno.
- Se adapto App Router al modelo async de rutas dinamicas.
- Se establecio una estrategia explicita de cache para datos de Sanity.
- Se reforzo estabilidad en UI y se corrigio un problema de SSR en Studio.

#### Chore

- Actualizar stack del proyecto a Next.js 16, React 19, Sanity 5 y ESLint 9.
- Migrar configuracion de lint a ESLint CLI con flat config.
- Ajustar configuracion de Turbopack para definir la raiz del workspace.
- Reemplazar @dotlottie/react-player por @lottiefiles/dotlottie-react para compatibilidad con React 19.
- Integrar skills locales del proyecto (.agents y skills-lock.json) para soporte de Sanity, Portable Text y UX sin depender del scope global.
- Agregar assets de la mascota virtual estilo pixel art.

#### Feature

- Migrar rutas dinamicas para usar params y searchParams async en App Router.
- Agregar manejo de notFound en rutas dinamicas para evitar errores de prerender.
- Definir estrategia explicita de cache para consultas de Sanity con revalidacion por defecto.
- Integrar soporte de tablas en Studio con @sanity/table y unificar el formato de tabla en Portable Text.
- Agregar bloque Table con configuracion de encabezado opcional y alineacion por columna.
- Implementar renderer responsivo para tablas con scroll horizontal y estilos de lectura mejorados.
- Aplicar renderer compartido en contenido de About para mantener consistencia visual.
- Agregar soporte de pie de imagen (caption) en Portable Text desde schema, query y frontend.
- Mejorar el espaciado de listas con viñetas para corregir alineacion en lineas multilinea.
- Habilitar bloques de codigo en Portable Text usando @sanity/code-input en Studio.
- Implementar renderer de snippets con boton de copiado, etiqueta de lenguaje y soporte de filename.
- Agregar resaltado de sintaxis por lenguaje en bloques de code de Portable Text con Shiki para frontend.
- Separar el boton de copiado en un componente cliente dedicado para mantener interaccion sin perder SSR en el renderer de codigo.
- Implementar sección de compartir contenido en posts y proyectos asi como el asignar sus elementos Open Graph.

#### Fix

- Corregir manejo de estado en ShowComments para evitar warning de setState dentro de effect.
- Corregir dependencia de handleClick en Navbar usando useCallback.
- Corregir fallback de imagen en Post para evitar referencias indefinidas.
- Sustituir img por next/image en PortableTextComponents para optimizacion de imagenes.
- Corregir error de SSR en /studio que causaba "window is not defined" y respuesta 500 en produccion.
- Mover el render de NextStudio a un componente cliente dedicado para evitar evaluacion de codigo del navegador en el servidor.
- Cargar el componente del Studio con import dinamico sin SSR.
- Corregir warning de hidratacion en la raiz de la app por desajuste de atributos en html al aplicar tema oscuro antes de hidratar.
- Agregar suppressHydrationWarning en la etiqueta html del layout principal para alinear SSR y cliente en Next.js 16.
- Corregir defaults de bloques code en schemas de Sanity para persistir `language: text` al crear snippets nuevos y evitar estados `description-null/script` hasta re-seleccionar lenguaje.
- Alinear selector de lenguaje de code-input agregando opcion `Text` y usando modo `sh` en comandos de shell para coherencia visual en Studio.

#### Style

- Actualizar referencia visual de version de Next.js en el footer de 14 a 16.
- Unificar ritmo vertical y espaciado en bloques de Portable Text (titulos, parrafos, listas, tablas, imagenes y codigo).

#### Commits de referencia

- [f418303](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/f418303) - chore: actualizar stack del proyecto a Next 16
- [860bcd6](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/860bcd6) - feat: migrar rutas dinamicas a APIs async
- [233b1cd](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/233b1cd) - feat: agregar revalidacion en consultas de Sanity
- [04b5b6c](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/04b5b6c) - fix: reforzar estabilidad en componentes de contenido y navegacion
- [d9f8bfb](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/d9f8bfb) - fix: corregir mismatch de hidratacion por tema oscuro
- [ad7d43f](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/ad7d43f) - style: actualizar referencia de version en footer
- [1bb8e4c](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/1bb8e4c) - feat: integrar tablas avanzadas y unificar formato de tabla en Portable Text
- [b2a1fa5](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/b2a1fa5) - feat: aplicar renderer compartido y cargar captions desde Sanity
- [004510e](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/004510e) - feat: mejorar bloques de codigo en Portable Text
- [db167a1](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/db167a1) - style: unificar espaciado en bloques Portable Text
- [f6550f4](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/f6550f4) - chore: agregar skills locales del proyecto para Sanity y UX
- [8a32628](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/8a32628) - fix: persistir lenguaje default text en bloques code
- [b604247](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/b604247) - feat: agregar resaltado de sintaxis en bloques de codigo de portable text
- [019c348](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/019c348) - agregar assets de canario virtual estilo pixel art
- [041dcba](https://github.com/UlisesSnz/portafolio-nextjs-v2/commit/041dcba) - agregar funcionalidad de compartir contenido y Open Graph en posts y proyectos

### Q1 (Ene-Mar) - Sin actividad

- Proyecto en pausa durante el trimestre.
- Sin releases ni cambios funcionales registrados.
