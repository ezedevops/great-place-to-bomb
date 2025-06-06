# 🚀 Guía de Deployment - Great Place to Bomb

## 📋 Archivos listos para deploy:
- ✅ `server.py` - Aplicación Flask principal
- ✅ `requirements.txt` - Dependencias
- ✅ `Procfile` - Comando de inicio
- ✅ `runtime.txt` - Versión de Python
- ✅ `templates/` y `static/` - Frontend
- ✅ `glassdoor_companies_20_pages.json` - Base de datos inicial

---

## 🌟 OPCIÓN 1: Railway (RECOMENDADO)

### ¿Por qué Railway?
- 🆓 **Completamente gratis** hasta 500 horas/mes
- ⚡ **Deploy súper rápido** (2 minutos)
- 🔄 **Auto-deploy** cuando hagas cambios
- 🌐 **Dominio automático** incluido

### 📝 Pasos:

1. **Sube a GitHub:**
   ```bash
   cd website
   git init
   git add .
   git commit -m "Great Place to Bomb - Ready for deploy"
   # Sube a tu GitHub
   ```

2. **Deploy en Railway:**
   - Ve a [railway.app](https://railway.app)
   - Login con GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Selecciona tu repositorio
   - ¡Railway detecta automáticamente que es Flask!
   - Click "Deploy" 

3. **¡LISTO! Tu URL será:**
   `https://tu-proyecto.up.railway.app`

---

## 🌟 OPCIÓN 2: Render

### 📝 Pasos:

1. **Sube a GitHub** (mismo proceso)

2. **Deploy en Render:**
   - Ve a [render.com](https://render.com)
   - Login con GitHub
   - "New" → "Web Service"
   - Conecta tu repo
   - **Configuración:**
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `gunicorn server:app`
     - Environment: `Python 3`

3. **¡Deploy automático!**

---

## 🌟 OPCIÓN 3: PythonAnywhere

### 📝 Pasos:

1. **Cuenta gratuita:**
   - Regístrate en [pythonanywhere.com](https://pythonanywhere.com)

2. **Sube archivos:**
   - Usa el File Browser web
   - Sube toda la carpeta `website/`

3. **Configura Web App:**
   - "Web" tab → "Add new web app"
   - Python 3.11 → Flask
   - Apunta a tu `server.py`

---

## 🌟 OPCIÓN 4: Vercel (Alternativa)

Aunque Vercel es más para frontend, puedes usar Vercel + Supabase:

1. **Frontend en Vercel** (gratis)
2. **Base de datos en Supabase** (gratis)
3. **Mismo código**, diferente arquitectura

---

## 🔧 Variables de Entorno (si las necesitas)

Para production, puedes agregar:
```env
FLASK_ENV=production
DATABASE_URL=sqlite:///bomb_reviews.db
```

---

## 🎯 URL Final

Tu sitio estará disponible en:
- **Railway**: `https://tu-proyecto.up.railway.app`
- **Render**: `https://tu-proyecto.onrender.com`
- **PythonAnywhere**: `https://tu-usuario.pythonanywhere.com`

---

## 💡 Tips Post-Deploy:

1. **Comparte la URL** con amigos/colegas
2. **Monitorea el uso** en el dashboard
3. **Haz backup** de la base de datos ocasionalmente
4. **Agrega Google Analytics** si quieres ver estadísticas

---

**¡Tu "Great Place to Bomb" estará disponible 24/7 para que todo el mundo bombardee empresas! 💣🌍** 