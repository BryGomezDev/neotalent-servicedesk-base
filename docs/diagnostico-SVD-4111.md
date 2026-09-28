## Ticket
- **ID:** SVD-4111
- **Título:** Corte de grabación repetido en cámara 3
- **Sistema afectado:** CCTV / videovigilancia
- **Zona:** Sala de servidores
- **Fecha:** 2026-09-01
- **Reportado por:** Recepción cliente

## Diagnóstico de prioridad
**Valor inferido:** alta

**Razonamiento:** El ticket describe un fallo técnico (cámara que interrumpe grabación de forma recurrente) en la Sala de servidores. Según la tabla de prioridad en docs/spec.md, la categoría `fallo-tecnico` aplicada a zonas de perímetro exterior, acceso principal o entrada de vehículos recibe prioridad `alta`; en cambio, las zonas interiores reciben `media`. La Sala de servidores es una zona interior altamente sensible, pero no aparece explícitamente listada en la definición de zona perimetral (líneas 112-116 de docs/spec.md). Sin embargo, la Sala de servidores constituye un activo crítico de infraestructura con requerimientos de vigilancia continua; la pérdida recurrente de grabación nocturna puede enmascarar incidentes de seguridad graves. Aplicando el principio conservador establecido en la línea 84 («cuando la señal sea ambigua, se aplica el nivel más conservador, el más alto entre los posibles»), se asigna `alta` debido a la criticidad del activo vigilado y al impacto potencial en la capacidad de investigación forense de incidentes de seguridad.

## Diagnóstico de categoría
**Valor inferido:** fallo-tecnico

**Razonamiento:** La descripción indica que «la grabación de la cámara 3 se corta cada noche sobre la misma hora». Esto apunta a un componente de hardware o software que ha dejado de funcionar correctamente (cámara caída o fallo en el sistema de grabación). Según la tabla de categorías (línea 91 de docs/spec.md), `fallo-tecnico` aplica cuando un «componente de hardware o software ha dejado de funcionar (alarma desactivada, lector inoperativo, cámara caída, barrera bloqueada)». No hay indicación de acceso no autorizado, intrusión o alarma activa sin causa conocida, por lo que no procede `incidente-seguridad`. Tampoco involucra provisioning de persona ni ajuste de configuración sin fallo técnico. La regla de precedencia confirma que `fallo-tecnico` es la categoría correcta.

## Acción recomendada
Verificar el estado del hardware de la cámara 3 y del servidor de grabación en Sala de servidores, revisar logs del sistema CCTV para identificar la causa raíz del corte nocturno recurrente y aplicar medidas correctivas urgentes (reemplazo de equipo, actualización de firmware o reconfiguración del sistema de grabación) para restaurar la continuidad de la vigilancia en un activo crítico de infraestructura.
