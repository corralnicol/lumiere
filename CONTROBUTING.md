# Código de Conducta

Para mantener un flujo de trabajo prágmatico y organizado, nuestro equipo seguirá un flujo de trabajo basado en Git-flow pero con ajustes orientados a la velocidad, con las siguientes prácticas fundamentales:

- **[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)**
- **[Atomic Commits](https://dev-to.translate.goog/samuelfaure/how-atomic-git-commits-dramatically-increased-my-productivity-and-will-increase-yours-too-4a84?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=tc)**
- **[Feature Branches](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow) pequeñas y específicas**
- **Pull requests con revisión obligatoria**
- **Integración continua en `dev`**
- **Releases desde `main` usando tags ([CalVer](https://calver.org/))**

> Todas las decisiones estipuladas están sujetas a cambios, el equipo tiene la potestad de cambiar o adaptar el flujo de trabajo según lo considere necesario para mejorar la productividad y la calidad del código. La flexibilidad es clave para encontrar el mejor proceso que se adapte a las necesidades del equipo y del proyecto. Nada está escrito en piedra.

## Reglas Generales

- Todo el código, commits, PRs y documentación deben estar en **español**
- Cada cambio debe ser **pequeño, claro y enfocado en un solo objetivo**
- Nadie hace push directo a `main`
- Todo cambio pasa por **Pull Request + review obligatoria** en GitHub
- El historial de git debe ser **legible y explicativo por sí mismo**

## Conventional Commits

Todos los commits deben seguir el estándar de Conventional Commits.

### Tipos permitidos:

- `feat:` → nueva funcionalidad
- `fix:` → corrección de bug
- `style:` → cambios visuales o formato (sin lógica)
- `docs:` → documentación
- `chore:` → mantenimiento/configuración

### Ejemplos

Correcto:

```
feat: add hero call to action button
```

Incorrecto:

```
add hero call to action button
```

Incorrecto (no atómico):

```
feat: add hero CTA, update layout, fix login error
```

## Atomic Commits

Cada commit debe representar **un solo cambio lógico**.

### Regla práctica:

> Si el mensaje del commit necesita “y”, probablemente está mal.

## Estructura de Ramas

El proyecto usa las siguientes ramas:

- `main` → producción (estable)
- `dev` → integración
- `feat/*` → nuevas funcionalidades
- `fix/*` → corrección de bugs

No usamos:

- `release/*`
- `hotfix/*`
- `support/*`

## Flujo de Trabajo (Paso a Paso)

### 1. Crear rama

Siempre desde `dev`:

```bash
git checkout dev
git pull
git checkout -b feat/feature-name
```

### 2. Desarrollo

- Hacer commits pequeños y claros
- Seguir Conventional + Atomic commits

### 3. Abrir Pull Request

Destino: `dev`

El PR debe incluir:

- Qué se hizo
- Por qué se hizo
- Cómo probarlo

### 4. Revisión (obligatoria)

- Mínimo **1 aprobación**
- El reviewer debe:

  - Entender el cambio
  - Validar que funciona
  - Verificar claridad del código

### 5. Merge

Se hace con **merge commit personalizado**:

```
merge: add hero call to action button from #3
```

No usar:

```
Merge pull request #3
```

## Feature Branches

Las features deben ser **lo suficientemente pequeñas para que 1 sola persona las desarrolle**.

Correcto:

```
feat/hero-image
feat/hero-cta
```

Incorrecto:

```
feat/hero
```

> A menos que una sola persona haga todo el hero

## Fix Branches

Para bugs:

```
fix/login-error
fix/product-validation
```

Siempre se crean desde `dev` y vuelven a `dev`.

## Releases

### Condición

Se hace release cuando `dev` está:

- Estable
- Probado
- Integrado correctamente
- Aprobado por el equipo

### Proceso

1. Crear tag en el último commit de `dev`:

```bash
git tag 2026-04-12
```

2. Abrir PR de `dev` → `main`

3. Merge a `main`

## Versionado (CalVer)

Formato:

```
YYYY-MM-DD
```

Ejemplos:

- `2026-03-05`
- `2026-04-12`

## Responsabilidades del Equipo

- Crear ramas correctamente
- Hacer commits claros y pequeños
- Abrir PRs bien explicados
- Revisar PRs de otros compañeros
- Aprender del feedback

## Filosofía del Equipo

- Preferimos **claridad sobre complejidad**
- Preferimos **progreso constante sobre perfección**
- Preferimos **historial entendible sobre velocidad ciega**

## Anti-patrones (evitar siempre)

- Commits grandes y mezclados
- PRs sin descripción
- Features demasiado grandes
- Push directo a `main`
- “Funciona en mi máquina”
- Merges sin entender el código
