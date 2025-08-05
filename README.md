# 🎸 Festival&Friends

La red social definitiva para rockeros. Conecta con tus amigos, descubre festivales épicos y vive la experiencia musical como nunca antes.

## ✨ Características

- **🎪 Gestión de Festivales**: Crea, descubre y gestiona festivales de rock
- **👥 Red Social**: Conecta con otros rockeros y amigos
- **🎫 Estados de Asistencia**: Indica si vas, te lo estás pensando o no vas
- **🔔 Notificaciones**: Recibe avisos de nuevos festivales y cambios de asistencia
- **📱 Responsive**: Diseño adaptativo para móviles y escritorio
- **🌙 Tema Oscuro**: Diseño moderno con glassmorphism sutil
- **📋 Encuestas Post-Festival**: Recopila estadísticas después de cada evento

## 🛠️ Tecnologías

- **Frontend**: Astro + React + JavaScript (puro, sin TypeScript)
- **Estilos**: Tailwind CSS v3 con tema personalizado
- **Estado**: Zustand para gestión de estado global
- **Backend**: Supabase (Base de datos + Autenticación + Storage)
- **Iconos**: Heroicons
- **Componentes**: Headless UI

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (ya configurada)

### Configuración

1. **Clonar el repositorio**:
```bash
git clone <tu-repo>
cd festival-friends
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar Supabase**:
   - El proyecto ya está configurado con Supabase
   - Proyecto ID: `mvlrmnxatfpfjnrwzukz`
   - URL: `https://mvlrmnxatfpfjnrwzukz.supabase.co`
   - La base de datos ya tiene todas las tablas configuradas

4. **Ejecutar en desarrollo**:
```bash
npm run dev
```

5. **Abrir en el navegador**:
   - La aplicación estará disponible en `http://localhost:4321`

## 📊 Estructura de la Base de Datos

### Tablas Principales

- **`users`**: Perfiles de usuario con información personal y social
- **`festivals`**: Información de festivales (cartel, fechas, ubicación)
- **`festival_attendances`**: Estados de asistencia de usuarios a festivales
- **`notifications`**: Sistema de notificaciones
- **`festival_surveys`**: Encuestas post-festival
- **`survey_responses`**: Respuestas a las encuestas

### Estados de Asistencia

- `have_ticket`: "Tengo la entrada" 🎫
- `thinking_about_it`: "Me lo estoy pensando" 🤔  
- `not_going`: "No voy" ❌

## 🎨 Diseño

### Tema Visual
- **Colores principales**: Azules (primary) y grises oscuros (rock)
- **Efecto glassmorphism**: Fondos translúcidos con blur
- **Animaciones**: Transiciones suaves y efectos hover
- **Responsive**: Adaptado para móviles, tablets y escritorio

### Componentes Clave
- `Header`: Navegación, autenticación y notificaciones
- `LoginModal`: Modal de inicio de sesión/registro
- `FestivalCard`: Tarjeta de festival con gestión de asistencia
- `NotificationPanel`: Panel deslizante de notificaciones
- `FriendsList`: Lista de usuarios con búsqueda

## 📱 Funcionalidades

### Autenticación
- Registro con email y contraseña
- Inicio de sesión
- Perfiles de usuario completos

### Festivales
- ✅ Listar festivales existentes
- ✅ Buscar por nombre y ubicación
- ✅ Gestionar estado de asistencia
- ✅ Ver estadísticas de asistencia
- 🔄 Crear nuevos festivales (próximamente)
- 🔄 Subir carteles e imágenes (próximamente)

### Social
- ✅ Ver perfiles de otros usuarios
- ✅ Buscar usuarios por nombre, nickname o ciudad
- ✅ Información de contacto y redes sociales
- ✅ Sistema de "persona nexo" para conexiones

### Notificaciones
- ✅ Notificaciones de nuevos festivales
- ✅ Avisos de cambios de asistencia
- ✅ Marcar como leídas
- 🔄 Notificaciones push (próximamente)

## 🚧 Próximas Funcionalidades

- **Creación de Festivales**: Modal para crear nuevos festivales
- **Subida de Imágenes**: Integración con Supabase Storage
- **Encuestas Post-Festival**: Sistema completo de encuestas
- **Chat Privado**: Mensajería entre usuarios
- **Galería de Fotos**: Carrusel de imágenes de festivales pasados
- **Notificaciones Push**: Avisos en tiempo real
- **Filtros Avanzados**: Por fecha, género musical, ubicación
- **Mapa de Festivales**: Visualización geográfica
- **Grupos/Crews**: Crear grupos de amigos para festivales

## 🛡️ Seguridad

- **RLS (Row Level Security)**: Políticas de seguridad a nivel de fila
- **Autenticación JWT**: Tokens seguros con Supabase Auth
- **Validación de datos**: Validación tanto frontend como backend
- **HTTPS**: Comunicación segura

## 🎯 Casos de Uso

### Para Usuarios
1. **Descubrir Festivales**: Busca festivales de rock cerca de ti
2. **Coordinar con Amigos**: Ve quién más va y planifica juntos
3. **Gestionar Asistencias**: Mantén actualizado tu estado
4. **Conectar**: Encuentra otros rockeros en tu ciudad

### Para Organizadores
1. **Promocionar Eventos**: Publica tu festival en la plataforma
2. **Ver Interés**: Monitorea cuánta gente está interesada
3. **Recopilar Feedback**: Usa encuestas post-evento

## 🐛 Problemas Conocidos

- La autenticación en páginas privadas usa un método simple (se mejorará)
- Algunas funcionalidades están pendientes de implementación
- La subida de imágenes aún no está integrada

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🎸 ¡Rock On!

Hecho con ❤️ para la comunidad rockera. ¡Que viva el rock!

---

**Festival&Friends Team** 🤘 