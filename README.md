# Cambridge Trainer — preparación Cambridge English (A1-C2)

Entrenador personal completo para preparar **cualquier examen de Cambridge
English, de A1 a C2** (Key/KET, Preliminary/PET, First/FCE, Advanced/CAE,
Proficiency/CPE): test de nivel inicial, Reading & Use of English, Grammar,
Vocabulary (spaced repetition), Writing con corrección por IA, Listening,
Speaking (grabación + speech-to-text + análisis), plan de estudio adaptativo,
simulacro completo (Mock Exam), seguimiento de errores, dashboard con
gráficas, gamificación, un tutor de IA conversacional y **Mi Clase**: un
apartado totalmente independiente para el material de tu propio profesor o
academia.

El usuario elige su **examen objetivo** en Ajustes; todo el contenido
(dificultad, vocabulario, escala de puntuación, nombre del examen mostrado en
la app) se adapta a ese nivel.

## Stack

- **Frontend:** React + TypeScript, Next.js (App Router), Tailwind CSS v4
- **Backend:** Next.js API routes
- **Base de datos:** PostgreSQL vía Prisma ORM — requerido incluso en
  desarrollo (SQLite no sobrevive a un host serverless como Vercel, cuyo
  sistema de archivos es de solo lectura/efímero en producción)
- **Pagos:** Stripe Checkout (`src/lib/stripe.ts`) — opcional; sin claves de
  Stripe configuradas, `/pricing` funciona en modo demo (activación
  simulada, claramente etiquetada, sin pasarela real)
- **Auth:** sesión propia con cookie httpOnly + JWT (`src/lib/auth.ts`),
  preparada para múltiples cuentas
- **Gráficos:** Recharts
- **IA:** capa `AIProvider` desacoplada (`src/lib/ai/`) — usa un proveedor
  mock por defecto (con heurísticas reales sobre tu texto/voz, no respuestas
  fijas) y conecta un modelo real implementando la misma interfaz

## Primeros pasos

```bash
npm install
cp .env.example .env   # y rellena los valores — ver comentarios en el propio archivo
docker compose up -d   # levanta Postgres local (o apunta DATABASE_URL a uno ya existente)
npm run db:migrate     # crea las tablas
npm run db:seed         # carga la cuenta demo + 25 ejercicios + 40 palabras
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Si prefieres no usar Docker, cualquier Postgres local o remoto sirve — solo
crea una base de datos vacía y pon su connection string en `DATABASE_URL`.

**Cuenta de demostración** (con historial de progreso, errores, vocabulario,
sesiones, writings, speaking y simulacros ya cargados):

```
email: demo@c1trainer.com
password: demo1234
```

También puedes crear una cuenta nueva desde `/register` — te llevará
directamente al test de nivel inicial y el dashboard empezará a cero (estado
real, no simulado).

## Módulos

| Módulo | Qué hace |
| --- | --- |
| **Test de nivel** | 40 preguntas (Grammar/Vocabulary/Reading/Use of English/Listening) que cubren de A1 a C2, nivel detallado por destreza + plan de estudio inicial |
| **Reading / Use of English** | Las 8 partes del examen, contenido original, corrección inmediata con explicación de cada opción |
| **Grammar** | 13 temas C1 (o generados por nivel para A1/A2/B1/B2/C2 — ver "Nivel objetivo") con explicación + ejemplos + ejercicio de práctica progresivo |
| **Vocabulary** | 40 palabras, flashcards con algoritmo SM-2 (spaced repetition) + "Mi diccionario": selecciona cualquier palabra en cualquier parte de la app para añadirla |
| **Writing** | 10 prompts C1 (o generados por nivel — desde mensajes cortos de 20-35 palabras en A2 hasta tareas de 280-320 en C2), análisis heurístico real (registro, vocabulario repetido, cohesión, ortografía) + versión mejorada comparada |
| **Listening** | Ejercicios con voz sintética del navegador; la transcripción permanece oculta y las reproducciones limitadas (3, como en el examen real) hasta corregir — arquitectura lista para audio real, ver Contenido |
| **Speaking** | Grabación con micrófono + transcripción automática (Web Speech API) + análisis de fluidez/vocabulario/muletillas |
| **Study Plan** | Calendario semanal generado según tus puntos débiles, regenerable |
| **Mock Exam** | Simulacro completo de las 4 destrezas con cronómetro y puntuación agregada (escala 140-210) |
| **My Errors** | Historial y detección de patrones de error por categoría + "Tu ADN de errores": diagnóstico narrativo por IA de por qué cometes tus errores más repetidos |
| **Progress** | Gráficas de evolución + "Tu nivel real en el tiempo": tu nivel CEFR real (independiente del examen objetivo), según cada Writing/Speaking corregido |
| **Achievements** | XP, nivel, racha y logros desbloqueables |
| **AI Tutor** | Chat persistido contra el `AIProvider` |
| **Mi Clase** | Apartado independiente de Cambridge: sube teoría/apuntes/ejercicios de tu profesor o academia (archivo o texto pegado) y genera ejercicios que la IA basa únicamente en ese material, con corrección paso a paso — ver sección propia más abajo |

## Scripts

| Script                | Qué hace                                       |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo (Turbopack)              |
| `npm run build`        | Build de producción                             |
| `npm run start`        | Sirve el build de producción                    |
| `npm run lint`         | ESLint                                          |
| `npm run test`         | Tests unitarios (Vitest) sobre lógica pura (scoring, escalas, rate limiting) |
| `npm run db:migrate`   | Aplica migraciones de Prisma                    |
| `npm run db:seed`      | Reinserta los datos de demostración (idempotente) |
| `npm run db:studio`    | Abre Prisma Studio (explorar la base de datos)  |
| `npm run db:reset`     | Reset completo de la base de datos + reseed     |

## Estructura

```
prisma/schema.prisma       Modelo de datos completo (27 modelos)
prisma/content/             Contenido de ejercicios (RUE, Grammar, Listening, Vocabulary)
prisma/seed.ts               Seed idempotente: cuenta demo + catálogo de contenido
src/content/                 Contenido estático usado por la UI (test de nivel, temas de
                            gramática, prompts de writing/speaking)
src/app/(auth)/               Login / registro
src/app/(app)/                 App protegida por sesión: dashboard + todas las secciones
src/app/api/                    Rutas API (auth, ejercicios, writing, speaking, vocabulario,
                            mock exam, study plan, tutor...)
src/lib/ai/                      Capa AIProvider (interfaz + mock con heurísticas reales)
src/lib/exercise-completion.ts   Corrección, XP, racha y logros al completar un ejercicio
src/lib/spaced-repetition.ts     Algoritmo SM-2 para vocabulario
src/lib/gamification.ts          XP, nivel, racha y desbloqueo de logros
src/components/                  Componentes de UI por módulo
```

## Privacidad

- Las API keys de IA nunca están en el frontend (solo en variables de entorno
  del servidor, ver `.env`).
- Desde **Ajustes** el usuario puede eliminar su cuenta y todos sus datos
  (cascada completa vía Prisma `onDelete: Cascade`).
- **Speaking**: las grabaciones de audio nunca se suben al servidor — solo la
  transcripción (generada en el navegador) se envía para análisis. Cada
  intento es eliminable individualmente desde la propia sección.

## Contenido y copyright

Todo el contenido de ejercicios (Reading, Use of English, Grammar, Listening,
Vocabulary, Writing, Speaking, test de nivel) es original, escrito para esta
app — reproduce el tipo de tarea y la dificultad de Cambridge C1 Advanced sin
copiar preguntas reales del examen. Los ejercicios de Listening no incluyen
archivos de audio (para no usar contenido con copyright); `Exercise.audioUrl`
está listo para conectar grabaciones propias sin cambios de modelo de datos.

## Nivel objetivo (A1-C2)

- Cada usuario tiene un `targetLevel` en su perfil (Ajustes → "Examen
  objetivo"), por defecto `C1`. `src/lib/cambridge-exams.ts` mapea cada
  nivel CEFR a su cualificación de Cambridge (nombre, escala de puntuación
  interna, umbral de aprobado).
- **Contenido C1**: la librería de ejercicios escrita a mano (Reading & Use
  of English, Grammar, Listening) sigue siendo C1, y se usa tal cual para
  usuarios con ese nivel objetivo.
- **Resto de niveles (A1, A2, B1, B2, C2)**: se generan con IA bajo demanda
  y se guardan en la base de datos como catálogo compartido por nivel (igual
  que el vocabulario), así que benefician a todos los usuarios de ese nivel,
  no solo a quien los pidió primero:
  - Reading/Use of English/Listening tienen un botón "Generar nuevo
    ejercicio (IA)".
  - **Grammar** (`src/lib/grammar-topics.ts`): la lista de 8 temas y sus
    explicaciones se generan por nivel (p. ej. "Present Simple" para A2 en
    vez de "Conditionals and mixed conditionals"), y cada tema tiene su
    propio botón para generar el ejercicio de práctica.
  - **Writing** (`src/lib/writing-prompts.ts`): las tareas generadas
    respetan el tipo y la longitud reales del examen en ese nivel — un
    mensaje corto guiado de 20-35 palabras en A2 Key, no un essay de CAE.
  - El vocabulario se completa automáticamente si faltan palabras de ese
    nivel, y Writing/Speaking/Tutor evalúan y explican con las expectativas
    propias de cada nivel (no siempre con el listón de C1).
  - Esto requiere `AI_PROVIDER="deepseek"` (o similar) para tener variedad
    genuina; con el proveedor `mock`, estos niveles funcionan pero con
    contenido de relleno.
- El test de nivel inicial (`src/lib/placement.ts`) sitúa al usuario en toda
  la escala A1-C2; el banco de 40 preguntas (`src/content/placement-test.ts`)
  incluye ítems de los 6 niveles (más densidad en B1-C1), así que los
  extremos A1/A2/C2 también se miden directamente y no solo se extrapolan.
- **Listening a ciegas**: mientras el ejercicio está sin corregir, la
  transcripción permanece oculta y el botón "Escuchar" (voz sintética del
  navegador) está limitado a 3 reproducciones, como las dos escuchas del
  examen real — se revela todo al corregir (`ExercisePlayer.tsx`).
- **Control de coste/abuso de IA** (`src/lib/ai/rateLimit.ts`): las acciones
  de "generar contenido nuevo" repetibles sin límite (ejercicio individual,
  mini-lección, iniciar Mock Exam) están limitadas a un cupo diario por
  usuario; generar temas de Grammar o prompts de Writing no cuenta porque ya
  se autolimita al ser un catálogo compartido por nivel. Además,
  `src/lib/ai/deepseekClient.ts` cachea en memoria (60s) llamadas
  idénticas para absorber dobles clics o reintentos.

## Referencia oficial de Cambridge (formato + rúbricas + vocabulario)

La app está enriquecida con datos **estructurales/factuales** extraídos de los
handbooks públicos de Cambridge English (A2 Key, B1 Preliminary, B2 First, C1
Advanced, C2 Proficiency) y de sus listas de vocabulario oficiales. Deliberadamente
**no** se incluye ningún sample paper real (preguntas, textos o tapescripts de
examen) — solo formato, rúbricas y listas de palabras, para no redistribuir
contenido con copyright de Cambridge Assessment dentro del banco de ejercicios:

- `src/content/exam-format-specs.ts` — estructura exacta de cada prueba por
  nivel (partes, nº de preguntas, tipo de tarea, timing), usada para calibrar
  el nº de preguntas al generar ejercicios y para la página **Formato del
  examen** (`/exam-format`), que muestra al usuario la estructura real de su
  examen objetivo.
- `src/content/writing-assessment-scale.ts` — la escala de evaluación
  oficial de Writing (Content/Communicative Achievement/Organisation/Language,
  0-5, con descriptores por nivel A2-C2), inyectada en el prompt del
  examinador de IA (`evaluateWriting`) para que puntúe contra el rubric real,
  no una aproximación.
- `src/content/speaking-assessment-scale.ts` — el marco de evaluación
  oficial de Speaking (Grammar and Vocabulary / Discourse Management /
  Pronunciation / Interactive Communication), inyectado en `evaluateSpeaking`.
- `src/content/official-wordlists.ts` + `official-wordlists/*.json` — solo
  las palabras (sin definiciones ni ejemplos, que sí son prosa original con
  copyright) de las listas de vocabulario oficiales A2 Key y B1 Preliminary
  (~1.300 entradas), usadas como semilla para que `generateVocabulary` elija
  palabras reales en vez de inventarlas; la definición, traducción y ejemplo
  que ve el usuario siguen siendo generados de cero por la IA.

## Mi diccionario (captura de palabras en toda la app)

- `WordCapture` (`src/components/shared/WordCapture.tsx`) se monta una vez
  en `AppShell` y está activo en toda la app: al seleccionar una palabra,
  frase o incluso una frase larga/oración con puntuación normal (hasta 280
  caracteres — solo se rechazan números y símbolos de código/URL) en
  cualquier texto renderizado — un pasaje de Reading, una transcripción de
  Listening ya corregida, una explicación de Grammar, un mensaje del AI
  Tutor... — aparece un pequeño menú flotante con dos acciones
  independientes. El popover se reposiciona automáticamente (debajo de la
  selección si no hay sitio arriba, sin salirse de los bordes de la
  pantalla) y se cierra si haces scroll, para no quedarse "flotando" lejos
  del texto al que apunta:
  - **Traducir**: `POST /api/translate` (`AIProvider.translateText`)
    muestra la traducción al español ahí mismo, junto a la selección, sin
    guardar nada ni salir de la página.
  - **Añadir al diccionario**: `POST /api/vocabulary/save-word` reutiliza la
    entrada si esa palabra ya existe en el catálogo compartido; si no,
    genera una ficha completa con IA (`AIProvider.explainWord`) usando la
    frase donde se seleccionó como contexto, para elegir el sentido
    correcto de palabras ambiguas. Si la selección tiene más de una
    palabra (una frase), además genera `grammarNote`: un desglose de su
    estructura gramatical y tiempo verbal, mostrado en la flashcard junto
    a la definición — las palabras sueltas no lo necesitan.
- La palabra queda enlazada al usuario vía `VocabularyReview.addedManually`,
  así que entra en la cola de repaso espaciado normal y también aparece en
  la nueva pestaña **Mi diccionario** dentro de Vocabulary — separada del
  catálogo completo compartido (`VocabularyBrowser` con `?mine=1`).

## Mi Clase (material propio del usuario/profesor/academia)

Apartado **completamente independiente** del resto de la app: no comparte
modelos de datos, XP, racha, logros ni el registro de errores (`ErrorLog`)
de Cambridge. Vive en `/mi-clase` y usa sus propios modelos Prisma
(`ClassMaterial`, `ClassExercise`, `ClassQuestion`, `ClassAttempt`,
`ClassAnswer`) sin ninguna relación con `Exercise`/`Attempt`/`ErrorLog`.

- **Subida de material** (`src/lib/class-materials.ts`): archivo `.txt`,
  `.pdf` (`pdf-parse`) o `.docx` (`mammoth`), o texto pegado directamente.
  Solo se guarda el **texto extraído** (igual que Speaking solo guarda la
  transcripción, nunca el audio) — no se almacenan los bytes del archivo
  original. El texto se recorta a ~20.000 caracteres (`MATERIAL_MAX_CHARS`)
  y queda marcado como `truncated` si el original era más largo.
- **Generación de ejercicios** (`AIProvider.generateExerciseFromMaterial`,
  implementado en `mockProvider.ts` y `deepseekProvider.ts`): el prompt usa
  una persona distinta a la del resto de la app (`CLASS_MATERIAL_PERSONA`)
  que prohíbe explícitamente inventar contenido o enmarcarlo como examen de
  Cambridge — cada pregunta, respuesta y explicación debe basarse
  únicamente en el texto subido, y las explicaciones son paso a paso,
  citando o parafraseando la parte del material de la que sale la
  respuesta.
- **Corrección** (`src/lib/class-exercise-completion.ts`): misma lógica de
  grading que `exercise-completion.ts`, pero sin tocar `ErrorLog`,
  `Progress`, XP ni racha — `ExercisePlayer.tsx` se reutiliza vía su nueva
  prop opcional `submitUrl`, y simplemente no muestra el bloque de XP si la
  respuesta no lo incluye.
- **Cuota de IA**: la generación de ejercicios cuenta contra el mismo cupo
  diario (`src/lib/ai/rateLimit.ts`, tipo `"class-exercise"`) que el resto
  de generación de contenido nuevo.

## Onboarding y planes de pago

- **Onboarding** (`/onboarding`, gate en `requireOnboardedUser()`): tras
  registrarse, el usuario elige entre hacer el **test de nivel** (flujo
  existente, sin cambios) o **elegir su nivel él mismo** (`OnboardingChoice.tsx`
  → `POST /api/onboarding/choose-level`), que fija `targetLevel`/`overallLevel`
  directamente y genera un Study Plan inicial sin desglose por destreza (no
  hay datos de test). Ambos caminos marcan `UserProfile.onboardingCompleted`,
  que es el único campo que gatea el acceso al resto de la app — reemplaza al
  antiguo gate directo sobre `hasCompletedPlacementTest`, que ahora solo
  indica si el usuario hizo el test real (se sigue guardando para uso futuro).
- **Prueba gratuita de 7 días** (`src/lib/billing.ts`): se activa sola al
  registrarse (`UserProfile.trialEndsAt = ahora + 7 días`), sin pedir tarjeta.
  `getPlanStatus(profile)` deriva en cada request si la prueba sigue activa,
  cuántos días quedan, o si ha caducado — no hay ningún job en segundo plano
  que la "caduque". Se comunica en el registro, en una insignia en la Topbar
  (verde si hay plan de pago, morada en prueba, roja si caducó) y en un
  banner en el Dashboard cuando quedan ≤2 días o ya ha terminado.
- **Planes y precios** (`/pricing`, `src/components/billing/PricingPlans.tsx`):
  dos planes definidos en `PLANS` (`src/lib/billing.ts`) — **Mensual 9,99 €**
  y **Anual 79,99 €** (~33% de descuento). Precio de partida, pensado para
  cambiarse libremente antes de lanzar (solo hay que editar `PLANS` y crear
  los Price correspondientes en Stripe).
- **Pagos reales con Stripe** (`src/lib/stripe.ts`, opcional): si
  `STRIPE_SECRET_KEY` + los dos `STRIPE_PRICE_ID_*` están configurados,
  "Elegir plan" en `/pricing` crea una sesión de **Stripe Checkout** real
  (`POST /api/billing/checkout`) y el navegador se redirige a la página de
  pago alojada por Stripe — la tarjeta se introduce ahí, nunca en un
  formulario propio. La activación real del plan solo ocurre al recibir el
  webhook (`POST /api/billing/webhook`, verifica la firma con
  `STRIPE_WEBHOOK_SECRET`), nunca desde una petición que el navegador pueda
  llamar directamente. Gestionar o cancelar una suscripción real abre el
  **Billing Portal** de Stripe (`POST /api/billing/portal`). **Sin claves de
  Stripe**, `/pricing` cae automáticamente en modo demo: un panel de "pago"
  simulado (campos de tarjeta deshabilitados, claramente etiquetado) que
  activa el plan directamente en la base de datos vía `POST
  /api/billing/subscribe` — esa ruta se autodesactiva en cuanto Stripe está
  configurado, para que nunca quede como una vía de activación gratuita.
- La caducidad de la prueba **no bloquea** el acceso a ninguna sección todavía
  (solo se avisa) — añadir el bloqueo real es una decisión de producto que
  falta tomar.
- **Límite de intentos** (`src/lib/rateLimit.ts`) en `/api/auth/login` (10/min
  por IP) y `/api/auth/register` (5/min por IP) — protección básica en
  memoria contra fuerza bruta y registros masivos; para un despliegue
  multi-instancia con abuso sostenido, cambiarlo por un store compartido
  (p. ej. Upstash Redis) es el siguiente paso natural.

## Despliegue a producción

Stack elegido: **GitHub** (código) → **Supabase** (base de datos) →
**Vercel** (frontend + backend) → **dominio propio** (Cloudflare o cualquier
registrador). Esto es exactamente lo que hay que hacer, en orden. Nada de
esto lo puedo hacer yo por ti (crear cuentas, pagar por servicios o
introducir tus propios datos de facturación no me corresponde) — pero cada
paso es corto.

### 1. GitHub

Si el proyecto aún no es un repositorio de GitHub:

```bash
git add -A
git commit -m "Ready for deployment"
```

Crea un repositorio nuevo en [github.com/new](https://github.com/new)
(privado si prefieres) y sigue las instrucciones que te da para subir un
repo ya existente (`git remote add origin ...` + `git push`).

### 2. Supabase (base de datos)

1. Crea una cuenta en [supabase.com](https://supabase.com) y un proyecto
   nuevo (elige una región cercana a donde esté la mayoría de tus usuarios).
   Te pedirá una contraseña para la base de datos — guárdala.
2. Ve a **Project Settings → Database → Connect**, pestaña **"ORMs"** →
   preset **Prisma**. Te da directamente las dos variables que este proyecto
   necesita:
   - `DATABASE_URL` — URL con el *connection pooler* (puerto 6543,
     `?pgbouncer=true`) — la que usa la app en cada petición.
   - `DIRECT_URL` — URL directa (puerto 5432, sin pooler) — la que usa Prisma
     solo para aplicar migraciones.

   (Si esa pestaña no aparece en tu versión de Supabase, coge la "Transaction
   pooler" para `DATABASE_URL` y la conexión directa para `DIRECT_URL` — ambas
   están en la misma pantalla.)
3. Aplica las migraciones a esa base de datos **desde tu máquina, una sola
   vez** (usa el `DIRECT_URL`, no el pooled):
   ```bash
   DATABASE_URL="<tu DIRECT_URL de Supabase>" npx prisma migrate deploy
   ```
   Esto crea todas las tablas. **No** ejecutes `npm run db:seed` contra esta
   base de datos — la cuenta demo es solo para desarrollo local.
4. **Usuarios**: no hace falta configurar nada más en Supabase para esto —
   la app gestiona su propio registro/login (tabla `User` con contraseña
   hasheada + cookie de sesión, `src/lib/auth.ts`), que vive en esa misma
   base de datos Postgres. Supabase Auth (su sistema de login con
   proveedores sociales, magic links, etc.) es un producto aparte que esta
   app no usa — solo estás usando Supabase como alojamiento de la base de
   datos. Si en algún momento quieres login social (Google, etc.) en vez del
   propio, dímelo y lo cableamos aparte.

### 3. Vercel (frontend + backend)

1. En [vercel.com](https://vercel.com), inicia sesión con GitHub → "Add New
   Project" → importa el repositorio del paso 1. Vercel detecta Next.js solo,
   no hace falta tocar el build command.
2. Antes de desplegar, en **Environment Variables** añade:
   - `DATABASE_URL` y `DIRECT_URL` — los dos del paso 2
   - `AUTH_SECRET` — genera uno nuevo y real, no reutilices el de desarrollo:
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `APP_URL` — de momento pon la URL que Vercel te va a asignar (p. ej.
     `https://tu-app.vercel.app`); la actualizas en el paso 4 si conectas un
     dominio propio
3. Despliega. La app ya funciona: cualquiera puede registrarse desde
   `/register` y tiene 7 días de prueba gratis.

### 4. Dominio propio (Cloudflare o cualquier registrador)

1. Compra el dominio donde prefieras (Cloudflare Registrar, Namecheap,
   cualquiera — todos funcionan igual de bien con Vercel).
2. En Vercel: **Project Settings → Domains** → añade tu dominio. Vercel te da
   los registros DNS exactos que hay que crear (normalmente un `CNAME` o un
   registro `A`).
3. En el panel DNS de tu dominio (en Cloudflare: pestaña **DNS**), añade
   esos registros exactamente como Vercel los pide. Si usas Cloudflare, dale
   a la nube naranja "DNS only" (gris) en ese registro mientras Vercel emite
   el certificado SSL, para evitar conflictos — puedes volver a activar el
   proxy de Cloudflare después si quieres.
4. Espera a que el dominio se verifique en Vercel (minutos, a veces hasta
   unas horas por propagación DNS).
5. Actualiza `APP_URL` en las variables de entorno de Vercel a tu dominio
   real (`https://tudominio.com`) y vuelve a desplegar.

### 5. Activar pagos reales con Stripe (opcional, pero es lo que pediste)

1. Crea una cuenta en [stripe.com](https://stripe.com) (tú, no yo — requiere
   tus propios datos fiscales/bancarios).
2. En el Dashboard de Stripe → **Product catalog** → crea dos productos:
   - "Cambridge Trainer — Mensual", precio recurrente **9,99 € / mes**
   - "Cambridge Trainer — Anual", precio recurrente **79,99 € / año**
   (o los precios que prefieras — solo tienen que coincidir con lo que
   muestres en `src/lib/billing.ts` si los cambias).
3. Copia el **Price ID** de cada uno (empieza por `price_...`).
4. En **Developers → API keys**, copia la **Secret key** (empieza por
   `sk_live_...` en modo real, `sk_test_...` en modo prueba — usa `sk_test_`
   mientras pruebas el flujo completo).
5. En **Developers → Webhooks → Add endpoint**, URL:
   `https://tu-dominio.com/api/billing/webhook`, eventos a escuchar:
   `checkout.session.completed` y `customer.subscription.deleted`. Copia el
   **Signing secret** (`whsec_...`).
6. En Vercel, añade estas variables de entorno y vuelve a desplegar:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID_MONTHLY`
   - `STRIPE_PRICE_ID_ANNUAL`
7. Prueba el flujo completo en modo test (Stripe da un número de tarjeta de
   prueba, `4242 4242 4242 4242`, cualquier fecha futura y CVC) antes de
   cambiar las claves a modo real (`sk_live_...` / `whsec_...` del endpoint
   en modo real).

Sin este paso, `/pricing` sigue funcionando en modo demo (activación
simulada) — la app no se rompe, simplemente no cobra de verdad todavía.

### 6. (Opcional) IA real

Sin `AI_PROVIDER`/`DEEPSEEK_API_KEY`, la app funciona entera con el
proveedor mock (contenido de calidad razonable, determinista, sin coste).
Para generación realmente por IA, añade `AI_PROVIDER="deepseek"` y
`DEEPSEEK_API_KEY` en las variables de entorno de producción.

## Notas de arquitectura / próximos pasos

- **Proveedores de IA disponibles** (`AI_PROVIDER` en `.env`):
  - `mock` (por defecto) — heurísticas reales sobre tu texto/voz, sin coste ni API key.
  - `deepseek` — usa la API de DeepSeek (`src/lib/ai/deepseekProvider.ts`).
    Rellena `DEEPSEEK_API_KEY` en `.env` y pon `AI_PROVIDER="deepseek"`.
    Cada método hace fallback automático al proveedor mock si la llamada
    falla (sin API key, rate limit, error de red...), así que la app nunca
    se rompe por un problema puntual de la API.
  - Para otro proveedor (Anthropic, OpenAI...), implementa `AIProvider`
    (ver `src/lib/ai/provider.ts`) y añade un caso en `src/lib/ai/index.ts`.
- Mock Exam agrega resultados a partir de los intentos reales completados
  dentro de la ventana temporal del simulacro (no hay un cronómetro que
  fuerce el envío automático; el tiempo transcurrido es informativo).
