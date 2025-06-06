# Great Place to Bomb 💣 - Servidor Flask

¡La parodia de Glassdoor donde las verdades explotan!

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 2. Ejecutar el servidor
```bash
python server.py
```

### 3. Abrir en el navegador
- **Local**: http://localhost:5000
- **Para que otros accedan**: http://TU_IP:5000

## 🌐 Acceso desde Otros Dispositivos

El servidor está configurado para aceptar conexiones desde cualquier IP. 

**Para encontrar tu IP:**
- Windows: `ipconfig`
- Linux/Mac: `ifconfig`

Luego comparte: `http://TU_IP:5000`

## 🗄️ Base de Datos

- **SQLite**: `bomb_reviews.db` (se crea automáticamente)
- **Empresas**: Carga automática desde `glassdoor_companies_20_pages.json`

## 📡 API Endpoints

- `GET /api/companies/search?q=nombre` - Buscar empresas
- `POST /api/reviews` - Enviar review
- `GET /api/reviews/recent?limit=5` - Reviews recientes
- `GET /api/ranking/worst?limit=10` - Ranking peores empresas
- `GET /api/stats` - Estadísticas generales

## 💣 Características

- ✅ **Reviews compartidos** - Todos ven los mismos datos
- ✅ **Ranking en tiempo real** - Las peores empresas
- ✅ **Búsqueda de empresas** - 200 empresas de Glassdoor
- ✅ **Sistema de rating** - 4 categorías explosivas
- ✅ **Efectos visuales** - Explosiones y animaciones
- ✅ **Easter eggs** - Código Konami incluido

## 🎯 Para Producción

Para usar en internet, puedes subir a:
- **Heroku** (gratis)
- **PythonAnywhere** (gratis)
- **Railway** (gratis)
- **Vercel** (gratis)

---

**¡A bombardear empresas! 💥** 