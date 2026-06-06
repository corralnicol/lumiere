# Lumière Beauty

**Lumière Beauty** es un marketplace enfocado en la venta de productos de belleza que priorizan el cuidado de la piel. Nuestra plataforma simplifica la experiencia de compra con una interfaz intuitiva, moderna y responsive. Ve más en nuestro [Behance](https://www.behance.net/gallery/245560359/Lumiere-Beauty-E-commerce-Platform-Design#).

<p align="center">
  <img width="269" height="192" alt="Logo" src="https://github.com/user-attachments/assets/b84ca8fc-e083-417b-9954-3f01c90a5cfd" />
</p>

## Features

- Catálogo de productos con filtros por categoría.
- Requerimientos dermatológicos para cada producto.
- Carrito de compras con resumen dinámico y proceso de checkout simplificado.

## Tech Stack

Lumière está construido con un stack moderno enfocado en rendimiento simplicidad:

- **React**: Construcción de la UI mediante componentes reutilizables y dinámicos.

- **Vite**: Herramienta de build con Hot Module Replacement (HMR) para un desarrollo ágil.

- **Recharts**: Librería de gráficos nativa para React, ideal para visualizar estadísticas de forma interactiva.

- **React Hot Toast**: Notificaciones de eventos como adición al carrito, errores y advertencias.

- **Vercel**: Hosting estático para desplegar la aplicación sin necesidad de backend.

- **EmailJS**: Envío de correos desde el frontend para confirmaciones de registro y notificaciones de compra.

## Confirmación de correo

La app usa Supabase Auth para validar el correo al registrarse. En el dashboard de Supabase debe estar activo `Authentication > Providers > Email > Confirm email`, así Supabase envía el correo y el usuario no puede iniciar sesión hasta confirmarlo.

## Código de Conducta

Para mantener un flujo de trabajo prágmatico y organizado, nuestro equipo seguirá prácticas basadas en Git-flow pero con ajustes orientados a la velocidad, con las siguientes prácticas fundamentales:

- **[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)**
- **[Atomic Commits](https://dev-to.translate.goog/samuelfaure/how-atomic-git-commits-dramatically-increased-my-productivity-and-will-increase-yours-too-4a84?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=tc)**
- **[Feature Branches](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow) pequeñas y específicas**
- **Pull requests con revisión obligatoria**
- **Integración continua en `dev`**
- **Releases desde `main` usando tags ([CalVer](https://calver.org/))**

> Nada está escrito en piedra y si el equipo lo decide, el flujo de trabajo puede ser adaptado para mejorar la productividad y calidad del código.

## Diseño

Todas las pantallas han sido diseñadas para ser **totalmente responsive**, asegurando compatibilidad en diferentes dispositivos incluyendo computadores (desktop) y dispositivos móviles (mobile).

## Sistema de Estilos

Los estilos de la aplicación serán implementados usando **CSS Modules con las [convenciones BEM](https://en.bem.info/methodology/quick-start/)** porque ofrecen una forma clara y estructurada de organizar los estilos, evitando conflictos y mejorando la mantenibilidad a medida que el proyecto crece.

## Resumen de avances del proyecto (30%)

Durante el primer **30% del proyecto Lumière Beauty**, se desarrollaron varias partes clave de la interfaz y la estructura de navegación. El foco de esta etapa fue crear las pantallas principales de la aplicación y establecer el flujo de usuario principal.

### Pantallas Desarrolladas

Las siguientes pantallas han sido implementadas y están completamente funcionales:

* **Landing Page**
* **Products Page**
* **Seller Instructions Page**
* **Login Screen**
* **Sign Up Screen**
* **Product Type Selection Screen**
* **Product Registration Verification Screen**

Estas pantallas forman la base de la experiencia de usuario, permitiendo a los visitantes explorar los productos, entender cómo vender en la plataforma y gestionar su cuenta.
