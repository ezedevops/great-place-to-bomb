from flask import Flask, render_template, request, jsonify, send_from_directory
import sqlite3
import json
from datetime import datetime
import os

app = Flask(__name__)

# Configuración
DATABASE = 'bomb_reviews.db'
app.config['SECRET_KEY'] = 'great-place-to-bomb-secret-key'

def init_db():
    """Inicializar la base de datos"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Tabla de reviews
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id INTEGER NOT NULL,
            company_name TEXT NOT NULL,
            rating_general INTEGER DEFAULT 0,
            rating_management INTEGER DEFAULT 0,
            rating_salary INTEGER DEFAULT 0,
            rating_environment INTEGER DEFAULT 0,
            average_rating REAL NOT NULL,
            comment TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT
        )
    ''')
    
    # Tabla de empresas (cache)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS companies (
            id INTEGER PRIMARY KEY,
            short_name TEXT NOT NULL,
            overall_rating REAL,
            page_found INTEGER
        )
    ''')
    
    conn.commit()
    conn.close()

def load_companies_data():
    """Cargar empresas desde JSON a la base de datos"""
    json_file = 'glassdoor_companies_20_pages.json'
    if os.path.exists(json_file):
        with open(json_file, 'r', encoding='utf-8') as f:
            companies = json.load(f)
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Limpiar tabla anterior
        cursor.execute('DELETE FROM companies')
        
        # Insertar empresas
        for company in companies:
            cursor.execute('''
                INSERT INTO companies (id, short_name, overall_rating, page_found)
                VALUES (?, ?, ?, ?)
            ''', (company['id'], company['shortName'], company.get('overallRating'), company.get('page_found', 1)))
        
        conn.commit()
        conn.close()
        print(f"✅ Cargadas {len(companies)} empresas en la base de datos")

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')

@app.route('/api/companies/search')
def search_companies():
    """Buscar empresas"""
    query = request.args.get('q', '').strip()
    
    if len(query) < 2:
        return jsonify([])
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, short_name, overall_rating 
        FROM companies 
        WHERE short_name LIKE ? 
        ORDER BY short_name
        LIMIT 10
    ''', (f'%{query}%',))
    
    companies = []
    for row in cursor.fetchall():
        companies.append({
            'id': row[0],
            'shortName': row[1],
            'overallRating': row[2]
        })
    
    conn.close()
    return jsonify(companies)

@app.route('/api/reviews', methods=['POST'])
def submit_review():
    """Enviar review"""
    try:
        data = request.json
        
        # Validar datos
        if not data.get('company') or not data.get('comment'):
            return jsonify({'error': 'Datos incompletos'}), 400
        
        # Calcular promedio
        ratings = data.get('ratings', {})
        valid_ratings = [v for v in ratings.values() if v > 0]
        avg_rating = sum(valid_ratings) / len(valid_ratings) if valid_ratings else 0
        
        # Insertar en base de datos
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO reviews (
                company_id, company_name, rating_general, rating_management,
                rating_salary, rating_environment, average_rating, comment, ip_address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['company']['id'],
            data['company']['name'],
            ratings.get('general', 0),
            ratings.get('management', 0),
            ratings.get('salary', 0),
            ratings.get('environment', 0),
            avg_rating,
            data['comment'],
            request.remote_addr
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Review enviado correctamente'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reviews/recent')
def get_recent_reviews():
    """Obtener reviews recientes"""
    limit = request.args.get('limit', 5, type=int)
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT company_name, average_rating, comment, timestamp, 
               rating_general, rating_management, rating_salary, rating_environment
        FROM reviews 
        ORDER BY timestamp DESC 
        LIMIT ?
    ''', (limit,))
    
    reviews = []
    for row in cursor.fetchall():
        reviews.append({
            'company_name': row[0],
            'average_rating': row[1],
            'comment': row[2],
            'timestamp': row[3],
            'ratings': {
                'general': row[4],
                'management': row[5],
                'salary': row[6],
                'environment': row[7]
            }
        })
    
    conn.close()
    return jsonify(reviews)

@app.route('/api/ranking/worst')
def get_worst_companies():
    """Obtener ranking de peores empresas"""
    limit = request.args.get('limit', 10, type=int)
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT 
            company_name,
            AVG(average_rating) as avg_score,
            COUNT(*) as review_count,
            MAX(comment) as latest_comment,
            AVG(rating_general) as avg_general,
            AVG(rating_management) as avg_management,
            AVG(rating_salary) as avg_salary,
            AVG(rating_environment) as avg_environment
        FROM reviews 
        GROUP BY company_id, company_name
        HAVING review_count >= 1
        ORDER BY avg_score DESC, review_count DESC
        LIMIT ?
    ''', (limit,))
    
    ranking = []
    for i, row in enumerate(cursor.fetchall(), 1):
        ranking.append({
            'position': i,
            'company_name': row[0],
            'average_score': round(row[1], 1),
            'review_count': row[2],
            'latest_comment': row[3],
            'avg_ratings': {
                'general': round(row[4], 1) if row[4] else 0,
                'management': round(row[5], 1) if row[5] else 0,
                'salary': round(row[6], 1) if row[6] else 0,
                'environment': round(row[7], 1) if row[7] else 0
            }
        })
    
    conn.close()
    return jsonify(ranking)

@app.route('/api/reviews/company/<int:company_id>')
def get_company_reviews(company_id):
    """Obtener todos los reviews de una empresa específica"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT company_name, average_rating, comment, timestamp, 
               rating_general, rating_management, rating_salary, rating_environment,
               ip_address
        FROM reviews 
        WHERE company_id = ?
        ORDER BY timestamp DESC
    ''', (company_id,))
    
    reviews = []
    for row in cursor.fetchall():
        reviews.append({
            'company_name': row[0],
            'average_rating': row[1],
            'comment': row[2],
            'timestamp': row[3],
            'ratings': {
                'general': row[4],
                'management': row[5],
                'salary': row[6],
                'environment': row[7]
            },
            'ip_address': row[8][:8] + "..." if row[8] else "Anónimo"  # Solo mostrar parte de la IP
        })
    
    conn.close()
    return jsonify(reviews)

@app.route('/api/companies', methods=['POST'])
def add_company():
    """Agregar nueva empresa"""
    try:
        data = request.json
        
        # Validar datos
        if not data.get('name'):
            return jsonify({'error': 'El nombre de la empresa es requerido'}), 400
        
        company_name = data['name'].strip()
        industry = data.get('industry', '').strip()
        location = data.get('location', '').strip()
        description = data.get('description', '').strip()
        
        # Verificar si la empresa ya existe
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute('SELECT id FROM companies WHERE LOWER(short_name) = LOWER(?)', (company_name,))
        existing = cursor.fetchone()
        
        if existing:
            conn.close()
            return jsonify({'error': 'Esta empresa ya existe en nuestra base de datos'}), 400
        
        # Generar nuevo ID (usar el máximo + 1)
        cursor.execute('SELECT MAX(id) FROM companies')
        max_id = cursor.fetchone()[0] or 0
        new_id = max_id + 1
        
        # Insertar nueva empresa
        cursor.execute('''
            INSERT INTO companies (id, short_name, overall_rating, page_found)
            VALUES (?, ?, ?, ?)
        ''', (new_id, company_name, 0.0, 0))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'company': {
                'id': new_id,
                'shortName': company_name,
                'overallRating': 0.0
            },
            'message': f'Empresa "{company_name}" agregada exitosamente'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats')
def get_stats():
    """Estadísticas generales"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM reviews')
    total_reviews = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(DISTINCT company_id) FROM reviews')
    total_companies = cursor.fetchone()[0]
    
    cursor.execute('SELECT AVG(average_rating) FROM reviews')
    avg_rating = cursor.fetchone()[0] or 0
    
    conn.close()
    
    return jsonify({
        'total_reviews': total_reviews,
        'total_companies': total_companies,
        'average_rating': round(avg_rating, 1)
    })

# Inicializar al arrancar
if __name__ == '__main__':
    print("🚀 Iniciando Great Place to Bomb Server...")
    init_db()
    load_companies_data()
    
    # Cargar reviews argentinos automáticamente
    from generate_funny_reviews import insert_reviews
    try:
        insert_reviews()
        print("✅ Reviews argentinos cargados!")
    except Exception as e:
        print(f"⚠️ Error cargando reviews: {e}")
    
    # Ejecutar en todas las interfaces para que otros puedan conectarse
    app.run(debug=True, host='0.0.0.0', port=5000) 