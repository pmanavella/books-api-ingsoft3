# TP8 CI/CD + Render + SQLite

## 1.	Elección de la Base de Datos: SQLite

Para este trabajo práctico se decidió utilizar SQLite como motor de base de datos embebido dentro del propio backend.
- Motivos de la elección
    - Sin servidor externo: no requiere levantar MySQL ni depender de un contenedor separado.
    - Costo $0: Render permite almacenamiento local persistente sin costo adicional.
    - Suficiente para el alcance del TP: el sistema gestiona una colección pequeña de libros, por lo que una BD liviana es más que suficiente.
    - Ideal para microservicios chicos y despliegues rápidos.
- Limitaciones conocidas
    - No apto para alta concurrencia (decenas o cientos de accesos simultáneos).
    - No soporta múltiples instancias del backend escribiendo a la vez.
    - Para una app real se recomendaría MySQL / PostgreSQL / MariaDB o un servicio administrado como Render PostgreSQL.

## 2. Flujo CI/CD implementado

- El pipeline ci-cd.yml implementa:
- Etapa 1 – build-and-test
    - Construcción del frontend y backend.
    - Ejecución de tests de manera no bloqueante.
- Etapa 2 – build-and-push
    - Se construyen las imágenes Docker de backend y frontend.
    - Se publican en GitHub Container Registry (GHCR).
- Etapa 3 – deploy-qa
    - Render recibe un deploy hook que actualiza:
    - books-backend-qa
    - books-frontend-qa
- Etapa 4 – deploy-prod (con aprobación manual)
    - El despliegue a producción requiere click de aprobación desde GitHub.
    - Luego Render actualiza:
    - books-api-backend-prod
    - books-api-frontend-prod

## 3. Entornos configurados (QA / PROD)

- En Render se configuraron ambas versiones:
    - Backend (QA y PROD)
- Variables en Render:
    - PORT=4000
    - DB_CLIENT=sqlite
    - NODE_ENV=qa | prod
    - SQLite se inicializa correctamente en ambos entornos.
Frontend (QA y PROD)
- Variables:
    - VITE_API_URL=https://books-backend-qa.onrender.com
    - VITE_API_URL=https://books-api-backend-prod.onrender.com

- El build del frontend incorpora correctamente estas variables en tiempo de construcción.

## 4. Qué funciona correctamente

- 
    - CI/CD exitoso en las 4 etapas.
    - Deploy a QA y PROD realizado sin errores.
    - Backend QA y PROD funcionan correctamente
    - Responden a /api/books
    - BD SQLite creada
    - Persistencia OK
    - Variables de entorno de Render correctamente configuradas
    - Frontend compila, despliega y carga la interfaz sin fallas

Todo el pipeline y las plataformas se configuraron correctamente y funcionan como se espera.

## 5. Error  al cargar libros en frontend QA y PROD

A pesar de que backend funcionaba correctamente, el frontend seguia intentando llamar a: http://localhost:4000/api/books
- Tal como se ve en la consola del navegador: 
    - Fetch API cannot load http://localhost:4000/api/books
    - Blocked due to access control checks
- Causa confirmada
    - El build de Vite en Render no estaba recibiendo el valor de la variable VITE_API_URL durante la compilación, por lo que el frontend usa el fallback "http://localhost:4000".
- Esto se debe a que:
    - Vite solo lee variables en tiempo de build,
    - Render inyecta las variables en tiempo de ejecución,
    - Por lo tanto el valor nunca llega a import.meta.env.VITE_API_URL dentro del bundle final.
    - El frontend no tomaba VITE_API_URL durante el build y siempre apuntaba a localhost:4000.

## 6. Estado final del error

- Solución implementada
    - Se eliminaron todas las variables del frontend dentro de Render. 
    - Se re-agregó únicamente VITE_API_URL en el dashboard correspondiente (QA y PROD)
    - Se hizo un nuevo deploy completo desde el pipeline
    - Se verificó con “View Logs” que el valor de VITE_API_URL SÍ estaba presente durante la build.
    - Se probó la interfaz en QA y PROD y ahora apunta correctamente

Resultado final:
- El problema quedó solucionado en ambos entornos. De esta manera, el frontend YA NO llama a localhost, y tanto QA como PROD funcionan correctamente.

## 7. Conclusión final

- El proyecto quedó completamente funcional en QA y en PROD:
    - CI/CD funcionando de punta a punta.
    - Deploy automático a QA y manual a PROD.
    - Backend operativo con SQLite y persistencia correcta.
    - Frontend compilado y desplegado sin errores.
    - El problema de VITE_API_URL fue solucionado y ahora el frontend consume correctamente la API real en ambos entornos.
