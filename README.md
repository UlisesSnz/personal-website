# Portfolio Website with Nextjs, Tailwind CSS and Framer-motion

## Previsualización de borradores

El Studio integrado en `/studio` incluye Presentation. Al abrir un documento guardado, Presentation activa Next.js Draft Mode mediante un secreto temporal y muestra su borrador en el sitio. Los cambios guardados se actualizan dentro de Presentation; una pestaña externa puede requerir recarga. La vista previa ofrece navegación, clic para editar y un enlace visible para salir.

Para habilitarla en un entorno:

1. Crear en Sanity un token con permiso **Viewer** y configurar `SANITY_API_READ_TOKEN` como variable **solo del servidor** en ese entorno. No usar el token de escritura ni una variable `NEXT_PUBLIC_*`.
2. Confirmar que el origen exacto del sitio está autorizado en CORS de Sanity con credenciales para el Studio integrado. Agregar también el origen local si se probará allí. La configuración de origen y token debe estar lista antes del primer despliegue de esta integración.
3. Desplegar y abrir `/studio`, entrar en Presentation y seleccionar un documento. El acceso compartido a borradores debe permanecer desactivado; la entrada se limita al secreto temporal de una sesión del Studio.

Con `ENGLISH_ENABLED=false`, `/en` solo se abre con Draft Mode válido. El build omite la generación estática inglesa en ese caso; al cambiar la bandera se necesita un nuevo build. La vista pública usa contenido publicado y mantiene sus rutas estáticas y caché. Los borradores nuevos necesitan un slug para abrir su detalle; mientras falta, Presentation envía al listado y muestra un aviso.

Antes de dar por terminada la puesta en marcha, probar con dos sesiones separadas (editora y anónima): cambios guardados y clic para editar, proyectos y artículos nuevos, traducciones presentes y ausentes, salida y retorno al contenido publicado, `/en` bloqueado en público, ausencia de borradores en sitemap/HTML público, y cabeceras `noindex` y `private, no-store` en preview.
