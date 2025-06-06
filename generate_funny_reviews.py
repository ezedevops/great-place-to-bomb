#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de reviews cómicos argentinos para Great Place to Bomb
"""

import sqlite3
import json
import random
from datetime import datetime, timedelta

def load_companies():
    """Cargar empresas desde JSON"""
    with open('glassdoor_companies_20_pages.json', 'r', encoding='utf-8') as f:
        companies = json.load(f)
    return companies

def get_funny_reviews():
    """25 reviews únicos con diferentes tonos y estilos argentinos"""
    
    reviews = [
        {
            "company_name": "McDonald's",
            "ratings": {"general": 1, "management": 1, "salary": 2, "environment": 1},
            "comment": "Che, para mi cumpleaños me regalaron una hamburguesa simple. UNA HAMBURGUESA SIMPLE. Ni queso le pusieron. Trabajé 8 meses y el gerente se parece a Susana Giménez pero con bigotes. Las freidoras más sucias que el Riachuelo y me hacían limpiar baños con el delantal. Un desastre total."
        },
        {
            "company_name": "Microsoft", 
            "ratings": {"general": 2, "management": 1, "salary": 3, "environment": 2},
            "comment": "Estimados, trabajé en soporte técnico dos años. Experiencia lamentable. Nos obligaban a usar Windows Vista en 2024. VISTA, hermano. El jefe tenía personalidad de NPC y cada vez que se colgaba el sistema me echaba la culpa. Los updates me arruinaron más días que las películas de Adam Sandler."
        },
        {
            "company_name": "Google",
            "ratings": {"general": 2, "management": 3, "salary": 2, "environment": 1},
            "comment": "GOOGLE = GULAG. Me tenían programando 16 horas diarias y después decían que no era 'innovador'. Si me daban computadora del año del pedo. El CEO debe ser pariente de Menem porque promete todo y no cumple nada. Ah, y el café era instantáneo. EN GOOGLE. Instantáneo."
        },
        {
            "company_name": "Amazon",
            "ratings": {"general": 1, "management": 1, "salary": 2, "environment": 1}, 
            "comment": "Trabajaba en logística, era como Takeshi's Castle sin diversión. Me cronometraban hasta para ir al baño. El supervisor parecía Darth Vader pero más forro. Las cajas pesaban más que Pavarotti y me descontaban si no cumplía meta. Bezos chupame la media, me fui a un kiosco y soy más feliz."
        },
        {
            "company_name": "Starbucks",
            "ratings": {"general": 2, "management": 2, "salary": 1, "environment": 2},
            "comment": "Tres meses haciendo cafés para hipsters. El entrenamiento duró más que novela de Corín Tellado. Me enseñaron 47 formas de hacer café con leche pero me pagaban con monedas de chocolate. La gerenta más amarga que café sin azúcar y más tóxica que el amor de Wanda Nara."
        },
        {
            "company_name": "IBM",
            "ratings": {"general": 2, "management": 1, "salary": 3, "environment": 2},
            "comment": "International Business Mierda. Las computadoras tenían más años que Mirtha Legrand y funcionaban peor que el subte en hora pico. El jefe era fan de PowerPoint, hacía presentaciones hasta para avisar que se había quemado el café. Ambiente muy formal, parecía un velorio pero menos divertido."
        },
        {
            "company_name": "Accenture",
            "ratings": {"general": 1, "management": 1, "salary": 2, "environment": 1},
            "comment": "CONSULTORA = CON-CHORRERA. Te venden humo más que un asado argentino. Me pusieron en un proyecto que cambiaba de scope cada 5 minutos. El cliente era más indeciso que Hamlet y el PM más perdido que turista en La Boca. Trabajé 6 meses y nunca supe qué carajo estaba haciendo. Un circo sin payasos."
        },
        {
            "company_name": "Walmart",
            "ratings": {"general": 1, "management": 2, "salary": 1, "environment": 1},
            "comment": "Repositor de góndolas durante 4 meses. El uniforme parecía disfraz de Buzz Lightyear pero más feo. La gerencia más desorganizada que los Simpsons. Me hacían trabajar en Nochebuena y me pagaban con vales de descuento. El scanner funcionaba cuando quería, como el gobierno. Experiencia: 0/10, no recomiendo."
        },
        {
            "company_name": "Oracle",
            "ratings": {"general": 2, "management": 1, "salary": 3, "environment": 2},
            "comment": "Base de datos y base de problemas. Laburé como DBA junior y el senior tenía más ego que Maradona en el '86. Las queries tardaban más en ejecutarse que una película de Bergman. El jefe técnico explicaba todo como si fuéramos de jardín de infantes. SQL Server > Oracle, fight me."
        },
        {
            "company_name": "Salesforce",
            "ratings": {"general": 2, "management": 2, "salary": 2, "environment": 1},
            "comment": "Sales FARCE más bien. CRM del orto que se colgaba más que un mono. Cada update rompía algo nuevo. El equipo de desarrollo programaba con los pies y después culpaban a los usuarios. La documentación estaba más desactualizada que el mapa de Menem. Cambié de laburo y mi presión arterial bajó 20 puntos."
        },
        {
            "company_name": "Burger King",
            "ratings": {"general": 1, "management": 1, "salary": 1, "environment": 2},
            "comment": "El rey de la explotación. Hamburguesas más secas que el humor de Pergolini y jefes más pesados que tango de Piazzolla en loop. Me hacían cerrar solo los sábados a la noche. Solo. Con todos los borrachos de Palermo. El uniforme olía a aceite quemado y desesperanza. Renuncié por WhatsApp y bloqueé a todos."
        },
        {
            "company_name": "Deloitte",
            "ratings": {"general": 2, "management": 1, "salary": 3, "environment": 2},
            "comment": "Auditoria = Auditoría del infierno. Excel sheets más largas que la cola del banco. El senior partner tenía menos personalidad que una pared y más exigencias que Susana en sus programas. Revisaba estados financieros hasta en mis pesadillas. Good bye Deloitte, hello salud mental."
        },
        {
            "company_name": "KPMG",
            "ratings": {"general": 2, "management": 2, "salary": 2, "environment": 1},
            "comment": "Consulting de cuarta. Vendían proyectos de 6 meses que duraban 2 años. El engagement manager era más cambiante que el clima porteño. Una semana querían metodología ágil, la siguiente waterfall, después no sabían ni qué metodología era. Cobraban fortuna y entregaban planillas de Excel glorificadas."
        },
        {
            "company_name": "EY",
            "ratings": {"general": 1, "management": 1, "salary": 2, "environment": 1},
            "comment": "Ernst & Young & Depresión. Trabajaba en tax y mi alma se murió en el proceso. Códigos fiscales más complicados que entender a las mujeres (perdón ladies). El manager era más denso que dulce de leche Tregar y menos útil que un chocolate tetera. Renuncié y ahora vendo empanadas, soy más feliz."
        },
        {
            "company_name": "PwC",
            "ratings": {"general": 2, "management": 1, "salary": 3, "environment": 2},
            "comment": "PricewaterhouseCoopers & Sufrimiento. Auditoría de sistemas bancarios durante un año. Los bancos tenían sistemas más viejos que Carlitos Balá y más inestables que relación de famosos. El socio principal nunca sabía de qué proyecto hablábamos. Facturaban como si fuesen dioses pero trabajaban como amateurs."
        },
        {
            "company_name": "Capgemini",
            "ratings": {"general": 1, "management": 2, "salary": 2, "environment": 1},
            "comment": "Cap-gemelos del mal. Outsourcing de desarrollo para Europa. Me tocó proyecto en francés y yo hablo francés como Minguito habla inglés. El cliente cambiaba requirements más seguido que Tinelli de pareja. Code reviews más largas que discurso de Perón. No recomiendo ni para el peor enemigo."
        },
        {
            "company_name": "Dell Technologies",
            "ratings": {"general": 2, "management": 2, "salary": 2, "environment": 2},
            "comment": "Soporte técnico para servers corporativos. Las máquinas se rompían más que promesas de campaña. Los manuales estaban en chino básico y el helpdesk interno no ayudaba ni para hacer agua. El jefe de área tenía menos idea que Fantino de fútbol. Ambiente cordial pero trabajo frustrante."
        },
        {
            "company_name": "SAP",
            "ratings": {"general": 2, "management": 1, "salary": 3, "environment": 2},
            "comment": "Systems, Applications & Problems. Implementación de ERP que tardó más que las obras del subte. Los módulos de SAP son más complicados que declaración de impuestos y menos intuitivos que VHS. El functional analyst era más perdido que Marito Baracus sin su equipo. Buen sueldo, pero a qué costo..."
        },
        {
            "company_name": "Globant",
            "ratings": {"general": 1, "management": 1, "salary": 2, "environment": 1},
            "comment": "Glo-BANT en el sentido más literal. Desarrollo mobile para clientes yankees. Sprints más largos que novela turca y daily meetings más frecuentes que cortes de luz. El Scrum Master tenía menos idea de metodologías ágiles que yo de ballet. Pizza parties cada 6 meses para compensar el burnout diario."
        },
        {
            "company_name": "Cognizant Technology Solutions",
            "ratings": {"general": 1, "management": 1, "salary": 2, "environment": 1},
            "comment": "Cognizant = Cognoscente de la explotación. QA testing para aplicaciones bancarias yanquis. Testing manual más repetitivo que remix de La Mona Jiménez. Los casos de prueba tenían más pasos que coreografía de Flor de la Ve. Manager indio que no entendía español ni inglés, solo lenguaje corporal del sufrimiento."
        },
        {
            "company_name": "AT&T",
            "ratings": {"general": 2, "management": 2, "salary": 2, "environment": 1},
            "comment": "American Telephone & Telegraph & Torture. Call center en español para latinos en EEUU. Los scripts eran más rígidos que actuación de Keanu Reeves. Clientes más agresivos que hincha de River en clásico y sistema telefónico más inestable que gobierno de turno. Tres meses y salí corriendo."
        },
        {
            "company_name": "HSBC",
            "ratings": {"general": 2, "management": 1, "salary": 3, "environment": 2},
            "comment": "Hong Kong & Shanghai Banking Corporation of Stress. Analista de riesgos por 8 meses. Riesgo más grande era mi salud mental trabajando ahí. Los procesos bancarios tenían más burocracia que trámite de AFIP. El compliance officer era más estricto que monja de convento y menos divertido que velorio."
        },
        {
            "company_name": "J.P. Morgan",
            "ratings": {"general": 2, "management": 2, "salary": 4, "environment": 2},
            "comment": "Investment banking con horarios de preso político. Buena guita pero a costa de tu alma. Presentaciones de PowerPoint más largas que los créditos de película de Marvel. El MD era más exigente que Moria Casán en el Bailando. Work-life balance inexistente, como gobierno eficiente en Argentina."
        },
        {
            "company_name": "Unilever",
            "ratings": {"general": 2, "management": 2, "salary": 3, "environment": 2},
            "comment": "Marketing de productos de limpieza. Irónicamente, el ambiente laboral estaba más sucio que cocina de restaurant trucho. Las campañas publicitarias las cambiaban más seguido que pañales de bebé. Brand manager con menos creatividad que programa de Chiche Gelblung. Productos buenos, gestión cuestionable."
        },
        {
            "company_name": "Carrefour",
            "ratings": {"general": 1, "management": 1, "salary": 1, "environment": 2},
            "comment": "Carrefour = Carretera hacia la depresión. Cajero durante temporada navideña. Clientes más pesados que bolsa de papas y sistema de cobro más lento que internet de ARNET en 2001. Los supervisores gritaban más que Maradona en cancha. Black Friday fue más negro que mi estado de ánimo después."
        }
    ]
    
    return reviews

def insert_reviews():
    """Insertar reviews en la base de datos"""
    
    companies = load_companies()
    company_dict = {comp['shortName']: comp['id'] for comp in companies}
    
    reviews = get_funny_reviews()
    
    conn = sqlite3.connect('bomb_reviews.db')
    cursor = conn.cursor()
    
    inserted_count = 0
    
    for review in reviews:
        company_name = review['company_name']
        company_id = company_dict.get(company_name)
        
        if not company_id:
            print(f"❌ Empresa '{company_name}' no encontrada")
            continue
        
        ratings = review['ratings']
        valid_ratings = [v for v in ratings.values() if v > 0]
        avg_rating = sum(valid_ratings) / len(valid_ratings) if valid_ratings else 0
        
        days_ago = random.randint(1, 180)
        review_date = datetime.now() - timedelta(days=days_ago)
        
        try:
            cursor.execute('''
                INSERT INTO reviews (
                    company_id, company_name, rating_general, rating_management,
                    rating_salary, rating_environment, average_rating, comment, 
                    timestamp, ip_address
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                company_id, company_name,
                ratings['general'], ratings['management'], 
                ratings['salary'], ratings['environment'],
                avg_rating, review['comment'],
                review_date.isoformat(),
                f"192.168.{random.randint(1,255)}.{random.randint(1,255)}"
            ))
            
            inserted_count += 1
            print(f"✅ Review para {company_name} insertado")
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    conn.commit()
    conn.close()
    
    print(f"\n🎉 ¡{inserted_count} reviews argentos insertados!")

if __name__ == "__main__":
    insert_reviews() 