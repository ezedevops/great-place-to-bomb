#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Actualizar ratings de reviews existentes con valores random
"""

import sqlite3
import random

def update_existing_ratings():
    """Actualizar ratings de reviews existentes con valores más realistas y random"""
    
    conn = sqlite3.connect('bomb_reviews.db')
    cursor = conn.cursor()
    
    # Obtener todos los reviews existentes
    cursor.execute('SELECT id, company_name FROM reviews')
    reviews = cursor.fetchall()
    
    print(f"🔄 Actualizando {len(reviews)} reviews con ratings random...")
    
    updated_count = 0
    
    for review_id, company_name in reviews:
        # Generar ratings random más realistas (más variedad en rangos bajos)
        ratings = {
            'general': random.choices([1, 2, 3, 4, 5], weights=[40, 30, 15, 10, 5])[0],
            'management': random.choices([1, 2, 3, 4, 5], weights=[45, 25, 15, 10, 5])[0], 
            'salary': random.choices([1, 2, 3, 4, 5], weights=[35, 25, 20, 15, 5])[0],
            'environment': random.choices([1, 2, 3, 4, 5], weights=[40, 25, 20, 10, 5])[0]
        }
        
        # Calcular promedio
        valid_ratings = [v for v in ratings.values() if v > 0]
        avg_rating = sum(valid_ratings) / len(valid_ratings) if valid_ratings else 0
        
        # Actualizar el review
        cursor.execute('''
            UPDATE reviews 
            SET rating_general = ?, rating_management = ?, 
                rating_salary = ?, rating_environment = ?, 
                average_rating = ?
            WHERE id = ?
        ''', (
            ratings['general'], ratings['management'],
            ratings['salary'], ratings['environment'],
            avg_rating, review_id
        ))
        
        updated_count += 1
        print(f"✅ {company_name}: {ratings['general']}/{ratings['management']}/{ratings['salary']}/{ratings['environment']} (avg: {avg_rating:.1f})")
    
    conn.commit()
    conn.close()
    
    print(f"\n🎉 ¡{updated_count} reviews actualizados con ratings random!")
    print("🎲 Ahora cada empresa tiene ratings únicos y variados!")

if __name__ == "__main__":
    update_existing_ratings() 