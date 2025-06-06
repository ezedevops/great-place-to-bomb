// Great Place to Bomb - JavaScript para servidor Flask

let selectedCompany = null;
let ratings = {
    general: 0,
    management: 0,
    salary: 0,
    environment: 0
};

// Cargar estadísticas generales
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        document.getElementById('statsInfo').innerHTML = 
            `📊 ${stats.total_reviews} reviews | 🏢 ${stats.total_companies} empresas bombardeadas | 💥 Promedio: ${stats.average_rating}/5`;
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        document.getElementById('statsInfo').innerHTML = '📊 Great Place to Bomb - Servidor en línea';
    }
}

// Búsqueda de empresas
function setupSearch() {
    setupCompanySearch('companySearch', 'suggestions', selectCompany);
    setupCompanySearch('companyFilter', 'filterSuggestions', selectCompanyForFilter);
}

function setupCompanySearch(inputId, suggestionsId, callback) {
    const searchInput = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);

    if (!searchInput || !suggestions) {
        console.warn(`Elementos no encontrados: ${inputId}, ${suggestionsId}`);
        return;
    }

    let searchTimeout;

    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        if (query.length < 2) {
            suggestions.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`/api/companies/search?q=${encodeURIComponent(query)}`);
                const companies = await response.json();

                if (companies.length > 0) {
                    const callbackName = callback === selectCompany ? 'selectCompany' : 'selectCompanyForFilter';
                    suggestions.innerHTML = companies.map(company => 
                        `<div class="suggestion-item" onclick="${callbackName}(${company.id}, '${company.shortName.replace(/'/g, "\\'")}')">
                            <strong>${company.shortName}</strong>
                            <small style="color: #666; margin-left: 10px;">
                                Rating original: ${company.overallRating || 'N/A'}
                            </small>
                        </div>`
                    ).join('');
                    suggestions.style.display = 'block';
                } else {
                    suggestions.innerHTML = '<div class="suggestion-item">No se encontraron empresas</div>';
                    suggestions.style.display = 'block';
                }
            } catch (error) {
                console.error('Error buscando empresas:', error);
                suggestions.innerHTML = '<div class="suggestion-item">Error de conexión</div>';
                suggestions.style.display = 'block';
            }
        }, 300);
    });

    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container') && !e.target.closest('.filter-container')) {
            suggestions.style.display = 'none';
        }
    });
}

// Seleccionar empresa para votar
function selectCompany(id, name) {
    selectedCompany = { id, name };
    document.getElementById('companySearch').value = name;
    document.getElementById('suggestions').style.display = 'none';
    document.getElementById('selectedCompanyName').textContent = name;
    document.getElementById('voteSection').style.display = 'block';
    
    // Scroll suave hacia la sección de votación
    document.getElementById('voteSection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });

    // Limpiar ratings previos
    resetRatings();
}

// Seleccionar empresa para filtrar reviews
function selectCompanyForFilter(id, name) {
    document.getElementById('companyFilter').value = name;
    document.getElementById('filterSuggestions').style.display = 'none';
    
    // Cargar todos los reviews de esta empresa
    loadCompanyReviews(id, name);
}

// Cargar todos los reviews de una empresa
async function loadCompanyReviews(companyId, companyName) {
    try {
        const response = await fetch(`/api/reviews/company/${companyId}`);
        const reviews = await response.json();
        
        const companyReviewsSection = document.getElementById('companyReviews');
        const headerContainer = document.getElementById('companyReviewsHeader');
        const reviewsContainer = document.getElementById('companyReviewsList');
        
        if (reviews.length === 0) {
            headerContainer.innerHTML = `
                <div class="company-reviews-header">
                    <h3>${companyName}</h3>
                    <p>Esta empresa aún no tiene reviews. ¡Sé el primero en bombardearla!</p>
                </div>
            `;
            reviewsContainer.innerHTML = '';
            companyReviewsSection.style.display = 'block';
            return;
        }

        // Calcular estadísticas
        const totalReviews = reviews.length;
        const avgRating = (reviews.reduce((sum, review) => sum + review.average_rating, 0) / totalReviews).toFixed(1);
        const explosionLevel = getExplosionLevel(avgRating);

        // Header con estadísticas
        headerContainer.innerHTML = `
            <div class="company-reviews-header">
                <h3>${companyName} ${explosionLevel.emoji}</h3>
                <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 1rem;">
                    <div><strong>${totalReviews}</strong> Reviews</div>
                    <div><strong>${avgRating}/5</strong> Promedio</div>
                    <div><strong>${explosionLevel.text}</strong></div>
                </div>
            </div>
        `;

        // Lista de reviews individuales
        const reviewsHTML = reviews.map((review, index) => {
            const timeAgo = getTimeAgo(review.timestamp);
            const explosionLevel = getExplosionLevel(review.average_rating);
            const ratingsDetail = createRatingsDetail(review.ratings);

            return `
                <div class="company-review-item">
                    <div class="review-header">
                        <div>
                            <span class="review-user">👤 Usuario ${review.ip_address}</span>
                            <span class="review-date">${timeAgo}</span>
                        </div>
                        <div style="text-align: right;">
                            <div class="review-score">${review.average_rating}/5 ${explosionLevel.emoji}</div>
                            <div style="font-size: 0.8rem; color: #666;">${explosionLevel.text}</div>
                        </div>
                    </div>
                    
                    ${ratingsDetail}
                    
                    <div class="review-comment">
                        💬 "${review.comment}"
                    </div>
                </div>
            `;
        }).join('');

        reviewsContainer.innerHTML = reviewsHTML;
        companyReviewsSection.style.display = 'block';

        // Scroll suave hacia la sección
        companyReviewsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });

    } catch (error) {
        console.error('Error cargando reviews de empresa:', error);
        showToast('Error cargando reviews de la empresa', 'error');
    }
}

// Sistema de rating con estrellas
function setupRatingSystem() {
    console.log('Configurando sistema de rating...');
    document.querySelectorAll('.stars').forEach(starsContainer => {
        const category = starsContainer.dataset.category;
        const stars = starsContainer.querySelectorAll('.star');
        console.log(`Configurando ${stars.length} estrellas para ${category}`);

        stars.forEach((star, index) => {
            star.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const rating = parseInt(this.dataset.rating);
                ratings[category] = rating;
                console.log(`Rating ${category}: ${rating}`);

                // Actualizar visualización de estrellas
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });

                // Efecto de explosión
                createExplosionEffect(this);
            });

            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.dataset.rating);
                stars.forEach((s, i) => {
                    s.style.color = i < rating ? '#ff4757' : '#ddd';
                    s.style.transform = i < rating ? 'scale(1.15)' : 'scale(1)';
                });
            });

            star.addEventListener('mouseleave', function() {
                // Restaurar visualización basada en rating actual
                const currentRating = ratings[category];
                stars.forEach((s, i) => {
                    s.style.color = i < currentRating ? '#ff4757' : '#ddd';
                    s.style.transform = i < currentRating ? 'scale(1.1)' : 'scale(1)';
                });
            });
            
            // Añadir clase de hover para mejorar UX
            star.addEventListener('mouseenter', function() {
                this.style.cursor = 'pointer';
            });
        });
    });
}

// Efecto de explosión
function createExplosionEffect(element) {
    const explosion = document.createElement('div');
    explosion.innerHTML = '💥';
    explosion.style.cssText = `
        position: absolute;
        font-size: 2rem;
        pointer-events: none;
        animation: explode 0.8s ease-out forwards;
        z-index: 1000;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes explode {
            0% { transform: scale(0) rotate(0deg); opacity: 1; }
            50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
            100% { transform: scale(2) rotate(360deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    const rect = element.getBoundingClientRect();
    explosion.style.left = rect.left + rect.width/2 + 'px';
    explosion.style.top = rect.top + rect.height/2 + 'px';

    document.body.appendChild(explosion);

    setTimeout(() => {
        document.body.removeChild(explosion);
        document.head.removeChild(style);
    }, 800);
}

// Enviar review
async function submitReview() {
    if (!selectedCompany) {
        showToast('¡Primero selecciona una empresa!', 'error');
        return;
    }

    const comment = document.getElementById('commentText').value.trim();
    const totalRatings = Object.values(ratings).filter(r => r > 0).length;

    if (totalRatings === 0) {
        showToast('¡Dale al menos una estrella de explosión!', 'error');
        return;
    }

    if (comment.length < 10) {
        showToast('¡Cuenta un poco más tu experiencia explosiva! (mínimo 10 caracteres)', 'error');
        return;
    }

    // Validar límite máximo de caracteres
    if (comment.length > 800) {
        showToast('El comentario no puede superar los 800 caracteres. ¡Resumí un poco!', 'error');
        return;
    }

    // Validar captcha
    if (!validateCaptcha()) {
        showToast('🤖 Respuesta del captcha incorrecta. ¡Inténtalo de nuevo!', 'error');
        generateCaptcha(); // Generar nuevo captcha
        document.getElementById('captchaAnswer').value = '';
        return;
    }

    // Mostrar loading
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Enviando...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                company: selectedCompany,
                ratings: ratings,
                comment: comment
            })
        });

        const result = await response.json();

        if (response.ok) {
            showToast('¡Review enviado! Gracias por tu explosiva honestidad.', 'success');
            
            // Actualizar estadísticas y listas
            loadStats();
            updateRecentBombs();
            updateWorstCompaniesRanking();
            
            // Si hay una empresa filtrada visible, actualizarla
            const companyReviewsSection = document.getElementById('companyReviews');
            if (companyReviewsSection.style.display !== 'none') {
                const companyFilterInput = document.getElementById('companyFilter');
                if (companyFilterInput.value && selectedCompany && 
                    companyFilterInput.value === selectedCompany.name) {
                    // Recargar los reviews de la empresa filtrada
                    loadCompanyReviews(selectedCompany.id, selectedCompany.name);
                }
            }
            
            resetForm();
        } else {
            showToast(result.error || 'Error enviando review', 'error');
        }
    } catch (error) {
        console.error('Error enviando review:', error);
        showToast('Error de conexión. Inténtalo de nuevo.', 'error');
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Mostrar toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const messageSpan = document.getElementById('toastMessage');
    
    messageSpan.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Resetear formulario
function resetForm() {
    document.getElementById('commentText').value = '';
    resetRatings();
    selectedCompany = null;
    document.getElementById('voteSection').style.display = 'none';
    document.getElementById('companySearch').value = '';
    
    // Resetear captcha y contador
    generateCaptcha();
    document.getElementById('captchaAnswer').value = '';
    const counter = document.getElementById('charCounter');
    if (counter) counter.textContent = '0/800 caracteres';
    
    // Scroll hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Resetear ratings
function resetRatings() {
    ratings = { general: 0, management: 0, salary: 0, environment: 0 };
    document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('active');
    });
}

// Variables para paginación de reviews recientes
let currentReviewsLimit = 5;
let allReviewsLoaded = false;

// Actualizar reviews recientes
async function updateRecentBombs(limit = 5) {
    try {
        console.log(`Cargando reviews recientes (limit: ${limit})...`);
        const response = await fetch(`/api/reviews/recent?limit=${limit}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const reviews = await response.json();
        const recentBombsContainer = document.getElementById('recentBombs');
        
        if (!recentBombsContainer) {
            console.error('Contenedor recentBombs no encontrado');
            return;
        }
        
        console.log(`${reviews.length} reviews recientes encontrados`);
        
        if (reviews.length === 0) {
            recentBombsContainer.innerHTML = `
                <div style="text-align: center; color: #666; padding: 2rem;">
                    <i class="fas fa-bomb" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Aún no hay explosiones... ¡Sé el primero en bombardear!</p>
                </div>
            `;
            return;
        }

        const recentReviews = reviews.map(review => {
            const timeAgo = getTimeAgo(review.timestamp);
            const explosionLevel = getExplosionLevel(review.average_rating);
            
            // Crear detalle de ratings individuales
            const ratingsDetail = createRatingsDetail(review.ratings);
            
            return `
                <div class="bomb-item">
                    <div style="flex: 1;">
                        <div class="bomb-company">${review.company_name}</div>
                        <div class="bomb-comment">
                            "${review.comment}"
                        </div>
                        ${ratingsDetail}
                        <div style="color: #999; font-size: 0.8rem; margin-top: 0.5rem;">
                            ${timeAgo}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="bomb-rating">${explosionLevel.emoji}</div>
                        <div style="color: #ff4757; font-weight: bold;">${review.average_rating}/5</div>
                        <div style="color: #666; font-size: 0.8rem;">${explosionLevel.text}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Verificar si hay más reviews para cargar
        allReviewsLoaded = reviews.length < limit;
        
        // Agregar botón "Ver más" si no están todos cargados
        const showMoreButton = !allReviewsLoaded ? `
            <div style="text-align: center; margin-top: 1.5rem;">
                <button onclick="loadMoreReviews()" class="show-more-btn">
                    <i class="fas fa-plus-circle"></i> Ver más explosiones
                </button>
            </div>
        ` : `
            <div style="text-align: center; margin-top: 1rem; color: #666; font-style: italic;">
                <i class="fas fa-check-circle"></i> No hay más explosiones por ahora
            </div>
        `;

        recentBombsContainer.innerHTML = recentReviews + showMoreButton;
    } catch (error) {
        console.error('Error cargando reviews recientes:', error);
        const recentBombsContainer = document.getElementById('recentBombs');
        if (recentBombsContainer) {
            recentBombsContainer.innerHTML = `
                <div style="text-align: center; color: #ff4757; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Error cargando reviews recientes. Recarga la página.</p>
                </div>
            `;
        }
    }
}

// Cargar más reviews
function loadMoreReviews() {
    currentReviewsLimit += 5;
    updateRecentBombs(currentReviewsLimit);
}

// Actualizar ranking de peores empresas
async function updateWorstCompaniesRanking() {
    try {
        console.log('Cargando ranking de peores empresas...');
        const response = await fetch('/api/ranking/worst?limit=10');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const ranking = await response.json();
        const rankingContainer = document.getElementById('worstCompaniesRanking');
        
        if (!rankingContainer) {
            console.error('Contenedor worstCompaniesRanking no encontrado');
            return;
        }
        
        console.log(`${ranking.length} empresas en ranking encontradas`);
        
        if (ranking.length === 0) {
            rankingContainer.innerHTML = `
                <div style="text-align: center; color: #666; padding: 2rem;">
                    <i class="fas fa-trophy" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Aún no hay ranking... ¡Empieza a bombardear empresas!</p>
                </div>
            `;
            return;
        }

        const rankingHTML = ranking.map(item => {
            const positionClass = item.position <= 3 ? ['first', 'second', 'third'][item.position - 1] : '';
            const topClass = item.position <= 3 ? 'top-3' : '';
            const medal = item.position <= 3 ? ['🥇', '🥈', '🥉'][item.position - 1] : '';
            const explosionLevel = getExplosionLevel(item.average_score);
            
            // Crear detalle de ratings promedio
            const avgRatingsDetail = createRatingsDetail(item.avg_ratings, true);

            return `
                <div class="ranking-item ${topClass}">
                    ${medal ? `<div class="ranking-medal">${medal}</div>` : ''}
                    <div class="ranking-position ${positionClass}">#${item.position}</div>
                    <div class="ranking-company-info">
                        <div class="ranking-company-name">${item.company_name}</div>
                        <div class="ranking-stats">
                            <span>📊 ${item.review_count} review${item.review_count > 1 ? 's' : ''}</span>
                        </div>
                        ${avgRatingsDetail}
                        <div class="ranking-comment">"${item.latest_comment}"</div>
                    </div>
                    <div class="ranking-rating">
                        <div class="ranking-score">${item.average_score}</div>
                        <div class="ranking-level">${explosionLevel.emoji}</div>
                        <div class="ranking-level-text">${explosionLevel.text}</div>
                    </div>
                </div>
            `;
        }).join('');

        rankingContainer.innerHTML = rankingHTML;
    } catch (error) {
        console.error('Error cargando ranking:', error);
        const rankingContainer = document.getElementById('worstCompaniesRanking');
        if (rankingContainer) {
            rankingContainer.innerHTML = `
                <div style="text-align: center; color: #ff4757; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Error cargando ranking. Recarga la página.</p>
                </div>
            `;
        }
    }
}

// Crear detalle de ratings individuales
function createRatingsDetail(ratings, isAverage = false) {
    const categories = [
        { key: 'general', icon: '💥', name: 'General' },
        { key: 'management', icon: '🤡', name: 'Management' },
        { key: 'salary', icon: '💸', name: 'Salario' },
        { key: 'environment', icon: '🔥', name: 'Ambiente' }
    ];
    
    const ratingsHtml = categories
        .filter(cat => ratings[cat.key] > 0)
        .map(cat => {
            const rating = ratings[cat.key];
            const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
            return `<span class="rating-item">
                        ${cat.icon} ${cat.name}: <strong>${rating}/5</strong>
                    </span>`;
        })
        .join('');
    
    if (ratingsHtml) {
        const label = isAverage ? '📊 Promedio por categoría:' : '⭐ Ratings dados:';
        return `<div class="ratings-detail">
                    <div style="font-weight: bold; margin-bottom: 0.4rem; color: #333;">${label}</div>
                    <div>${ratingsHtml}</div>
                </div>`;
    }
    return '';
}

// Nivel de explosión
function getExplosionLevel(rating) {
    if (rating >= 4.5) return { emoji: '💀', text: 'RIP' };
    if (rating >= 4.0) return { emoji: '☢️', text: 'Tóxico' };
    if (rating >= 3.5) return { emoji: '💥', text: 'Bomba' };
    if (rating >= 3.0) return { emoji: '🔥', text: 'Caliente' };
    if (rating >= 2.0) return { emoji: '⚠️', text: 'Riesgo' };
    return { emoji: '😇', text: 'Ángel' };
}

// Tiempo transcurrido
function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays}d`;
}

// Efectos adicionales y easter eggs
function addEasterEggs() {
    // Efecto de cursor explosivo ocasional
    let clickCount = 0;
    document.addEventListener('click', function(e) {
        clickCount++;
        if (clickCount % 15 === 0) {
            createRandomExplosion(e.clientX, e.clientY);
        }
    });

    // Konami code para modo ultra bomb
    let konamiCode = [];
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.keyCode);
        konamiCode = konamiCode.slice(-10);
        
        if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
            activateUltraBombMode();
        }
    });
}

// Explosión aleatoria
function createRandomExplosion(x, y) {
    const explosions = ['💥', '💣', '🔥', '☢️', '⚡'];
    const explosion = document.createElement('div');
    explosion.innerHTML = explosions[Math.floor(Math.random() * explosions.length)];
    explosion.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        font-size: 2rem;
        pointer-events: none;
        animation: randomExplode 1s ease-out forwards;
        z-index: 9999;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes randomExplode {
            0% { transform: scale(0) rotate(0deg); opacity: 1; }
            50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
            100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(explosion);

    setTimeout(() => {
        document.body.removeChild(explosion);
        document.head.removeChild(style);
    }, 1000);
}

// Modo Ultra Bomb (Easter Egg)
function activateUltraBombMode() {
    document.body.style.animation = 'shake 0.5s infinite';
    document.querySelector('.hero h1').innerHTML = '💀 ULTRA BOMB MODE ACTIVATED! 💀';
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
        }
    `;
    document.head.appendChild(style);

    // Crear múltiples explosiones
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createRandomExplosion(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight
            );
        }, i * 100);
    }

    setTimeout(() => {
        document.body.style.animation = '';
        document.querySelector('.hero h1').innerHTML = '¿Tu empresa es una bomba? 💥';
        document.head.removeChild(style);
    }, 5000);
}

// Variables para captcha
let captchaAnswer = 0;

// Contador de caracteres
function setupCharCounter() {
    const textarea = document.getElementById('commentText');
    const counter = document.getElementById('charCounter');
    
    if (!textarea || !counter) return;
    
    textarea.addEventListener('input', function() {
        const current = this.value.length;
        const max = 800;
        
        counter.textContent = `${current}/${max} caracteres`;
        
        // Cambiar color según el límite
        counter.className = 'char-counter';
        if (current > max * 0.8) {
            counter.classList.add('warning');
        }
        if (current > max * 0.95) {
            counter.classList.add('danger');
        }
    });
}

// Generar captcha matemático
function generateCaptcha() {
    const question = document.getElementById('captchaQuestion');
    if (!question) return;
    
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let result;
    let questionText;
    
    switch(operation) {
        case '+':
            result = num1 + num2;
            questionText = `¿Cuánto es ${num1} + ${num2}?`;
            break;
        case '-':
            result = Math.max(num1, num2) - Math.min(num1, num2);
            questionText = `¿Cuánto es ${Math.max(num1, num2)} - ${Math.min(num1, num2)}?`;
            break;
        case '*':
            const smallNum1 = Math.floor(Math.random() * 10) + 1;
            const smallNum2 = Math.floor(Math.random() * 10) + 1;
            result = smallNum1 * smallNum2;
            questionText = `¿Cuánto es ${smallNum1} × ${smallNum2}?`;
            break;
    }
    
    captchaAnswer = result;
    question.textContent = questionText;
}

// Validar captcha
function validateCaptcha() {
    const userAnswer = parseInt(document.getElementById('captchaAnswer').value);
    return userAnswer === captchaAnswer;
}

// Inicialización

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Great Place to Bomb...');
    
    try {
        loadStats();
        setupSearch();
        setupRatingSystem();
        setupCharCounter();
        generateCaptcha();
        updateRecentBombs();
        updateWorstCompaniesRanking();
        addEasterEggs();
        
        console.log('💣 Great Place to Bomb iniciado correctamente con servidor Flask!');
    } catch (error) {
        console.error('Error en inicialización:', error);
    }
});

// Mostrar formulario para agregar empresa
function showAddCompanyForm() {
    document.getElementById('addCompanyModal').style.display = 'flex';
    document.getElementById('newCompanyName').focus();
}

// Ocultar formulario para agregar empresa
function hideAddCompanyForm() {
    document.getElementById('addCompanyModal').style.display = 'none';
    document.getElementById('addCompanyForm').reset();
}

// Enviar nueva empresa
async function submitNewCompany(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('newCompanyName').value.trim(),
        industry: document.getElementById('newCompanyIndustry').value.trim(),
        location: document.getElementById('newCompanyLocation').value.trim(),
        description: document.getElementById('newCompanyDescription').value.trim()
    };
    
    if (!formData.name) {
        showToast('El nombre de la empresa es requerido', 'error');
        return;
    }
    
    // Mostrar loading
    const submitBtn = document.querySelector('.form-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Creando empresa...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast(`¡Empresa "${formData.name}" creada exitosamente!`, 'success');
            hideAddCompanyForm();
            
            // Actualizar estadísticas
            loadStats();
            
            // Seleccionar automáticamente la nueva empresa para votar
            selectCompany(result.company.id, result.company.shortName);
            
            // Scroll hacia la sección de votación
            setTimeout(() => {
                document.getElementById('voteSection').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 500);
            
        } else {
            showToast(result.error || 'Error creando empresa', 'error');
        }
    } catch (error) {
        console.error('Error creando empresa:', error);
        showToast('Error de conexión. Inténtalo de nuevo.', 'error');
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(e) {
    const modal = document.getElementById('addCompanyModal');
    if (e.target === modal) {
        hideAddCompanyForm();
    }
});

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideAddCompanyForm();
    }
});

// Funciones globales para HTML
window.selectCompany = selectCompany;
window.selectCompanyForFilter = selectCompanyForFilter;
window.submitReview = submitReview;
window.showAddCompanyForm = showAddCompanyForm;
window.hideAddCompanyForm = hideAddCompanyForm;
window.submitNewCompany = submitNewCompany; 