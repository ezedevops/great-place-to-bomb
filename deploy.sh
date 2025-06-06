#!/bin/bash

echo "🚀 Great Place to Bomb - Deploy Script"
echo "======================================"

# Verificar que estamos en la carpeta correcta
if [ ! -f "server.py" ]; then
    echo "❌ Error: No estás en la carpeta website/"
    echo "   Ejecuta: cd website && ./deploy.sh"
    exit 1
fi

echo "📋 Verificando archivos necesarios..."

# Verificar archivos esenciales
files=("server.py" "requirements.txt" "Procfile" "templates/index.html" "static/app.js")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - FALTA"
        exit 1
    fi
done

echo ""
echo "🎯 Opciones de Deploy:"
echo "1. Railway (Recomendado)"
echo "2. Render" 
echo "3. PythonAnywhere"
echo "4. Solo preparar para GitHub"
echo ""

read -p "Selecciona una opción (1-4): " option

case $option in
    1)
        echo "🚂 Preparando para Railway..."
        echo "📖 Abre esta URL: https://railway.app"
        echo "📖 Sigue la guía en DEPLOYMENT.md"
        ;;
    2)
        echo "🎨 Preparando para Render..."
        echo "📖 Abre esta URL: https://render.com"
        echo "📖 Sigue la guía en DEPLOYMENT.md"
        ;;
    3)
        echo "🐍 Preparando para PythonAnywhere..."
        echo "📖 Abre esta URL: https://pythonanywhere.com"
        echo "📖 Sigue la guía en DEPLOYMENT.md"
        ;;
    4)
        echo "📂 Preparando solo para GitHub..."
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "📦 Preparando archivos para GitHub..."

# Inicializar Git si no existe
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git inicializado"
fi

# Agregar archivos
git add .
git status

echo ""
echo "🎉 ¡Todo listo para deploy!"
echo ""
echo "📝 Próximos pasos:"
echo "1. git commit -m 'Great Place to Bomb - Ready for deploy'"
echo "2. git remote add origin https://github.com/TU_USUARIO/TU_REPO.git"
echo "3. git push -u origin main"
echo "4. Conectar con tu plataforma de hosting elegida"
echo ""
echo "📖 Guía completa en: DEPLOYMENT.md"
echo "🌐 Tu sitio estará en: https://tu-proyecto.plataforma.com" 