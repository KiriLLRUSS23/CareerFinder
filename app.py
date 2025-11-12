"""
CareerFinder - основное приложение Flask для карьерного тестирования
Главный модуль, содержащий маршруты и логику приложения
"""

from flask import Flask, render_template, request, redirect, url_for, session
import sqlite3
import os

# Инициализация Flask приложения
app = Flask(__name__)
app.secret_key = 'career-finder-secret-key-2023'  # Секретный ключ для сессий

# Конфигурация базы данных
DATABASE = 'database.db'

def get_db_connection():
    """
    Установка соединения с базой данных SQLite
    Returns:
        conn: объект соединения с базой данных
    """
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Доступ к колонкам по имени
    return conn

def init_db():
    """
    Инициализация базы данных и создание таблиц при необходимости
    """
    # Проверяем существование базы данных
    if not os.path.exists(DATABASE):
        conn = get_db_connection()
        # Создаем таблицу профессий если её нет
        conn.execute('''
            CREATE TABLE IF NOT EXISTS careers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT
            )
        ''')
        
        # Добавляем тестовые данные если таблица пустая
        existing_careers = conn.execute('SELECT COUNT(*) FROM careers').fetchone()[0]
        if existing_careers == 0:
            sample_careers = [
                ('Разработчик ПО', 'Создание программного обеспечения и приложений', 'IT'),
                ('Аналитик данных', 'Анализ и интерпретация больших данных', 'IT'),
                ('Веб-дизайнер', 'Создание дизайна для веб-сайтов', 'Design'),
                ('Маркетолог', 'Продвижение продуктов и услуг', 'Marketing')
            ]
            conn.executemany('INSERT INTO careers (name, description, category) VALUES (?, ?, ?)', sample_careers)
            conn.commit()
        
        conn.close()
        print("База данных инициализирована")

@app.route('/')
def index():
    """
    Главная страница приложения
    Returns:
        rendered template: HTML шаблон главной страницы
    """
    return render_template('index.html')

@app.route('/test')
def test():
    """
    Страница с карьерным тестом
    Returns:
        rendered template: HTML шаблон страницы тестирования
    """
    # Вопросы для теста
    questions = [
        "Вам нравится работать с технологиями и компьютерами?",
        "Вы предпочитаете творческую работу?",
        "Вам нравится анализировать данные и числа?",
        "Вы любите общаться с людьми?",
        "Вам нравится решать сложные задачи?"
    ]
    return render_template('test.html', questions=questions)

@app.route('/submit_test', methods=['POST'])
def submit_test():
    """
    Обработка результатов тестирования
    Returns:
        redirect: перенаправление на страницу результатов
    """
    try:
        # Получаем данные из формы
        answers = request.form.to_dict()
        
        # Простая логика определения подходящих профессий
        tech_score = int(answers.get('q1', 0))
        creative_score = int(answers.get('q2', 0))
        analytic_score = int(answers.get('q3', 0))
        social_score = int(answers.get('q4', 0))
        problem_score = int(answers.get('q5', 0))
        
        # Сохраняем результаты в сессии
        session['test_results'] = {
            'tech_score': tech_score,
            'creative_score': creative_score,
            'analytic_score': analytic_score,
            'social_score': social_score,
            'problem_score': problem_score
        }
        
        # Перенаправляем на страницу результатов
        return redirect(url_for('results'))
    
    except Exception as e:
        # Обработка ошибок
        print(f"Ошибка при обработке теста: {e}")
        return redirect(url_for('error'))

@app.route('/results')
def results():
    """
    Страница с результатами тестирования
    Returns:
        rendered template: HTML шаблон результатов
    """
    # Получаем результаты из сессии
    test_results = session.get('test_results', {})
    
    # Определяем подходящие профессии на основе результатов
    conn = get_db_connection()
    recommended_careers = []
    
    tech_score = test_results.get('tech_score', 0)
    creative_score = test_results.get('creative_score', 0)
    analytic_score = test_results.get('analytic_score', 0)
    
    if tech_score >= 3:
        recommended_careers.extend(conn.execute('SELECT * FROM careers WHERE category = "IT"').fetchall())
    if creative_score >= 3:
        recommended_careers.extend(conn.execute('SELECT * FROM careers WHERE category = "Design"').fetchall())
    if analytic_score >= 3:
        recommended_careers.extend(conn.execute('SELECT * FROM careers WHERE category = "Marketing"').fetchall())
    
    # Убираем дубликаты
    seen = set()
    unique_careers = []
    for career in recommended_careers:
        if career['id'] not in seen:
            seen.add(career['id'])
            unique_careers.append(career)
    
    conn.close()
    
    return render_template('results.html', 
                         careers=unique_careers, 
                         results=test_results)

@app.route('/careers')
def careers_list():
    """
    Страница со списком всех карьерных направлений
    Returns:
        rendered template: HTML шаблон списка профессий
    """
    try:
        conn = get_db_connection()
        # Получаем все профессии из базы данных
        careers = conn.execute('SELECT * FROM careers').fetchall()
        conn.close()
        
        return render_template('careers.html', careers=careers)
    
    except Exception as e:
        print(f"Ошибка при загрузке профессий: {e}")
        return render_template('careers.html', careers=[])

@app.route('/career/<int:career_id>')
def career_detail(career_id):
    """
    Страница с детальной информацией о конкретной профессии
    Args:
        career_id: ID профессии в базе данных
    Returns:
        rendered template: HTML шаблон деталей профессии
    """
    try:
        conn = get_db_connection()
        career = conn.execute('SELECT * FROM careers WHERE id = ?', 
                            (career_id,)).fetchone()
        conn.close()
        
        if career:
            return render_template('career_detail.html', career=career)
        else:
            return redirect(url_for('careers_list'))
    
    except Exception as e:
        print(f"Ошибка при загрузке профессии: {e}")
        return redirect(url_for('careers_list'))

@app.route('/error')
def error():
    """
    Страница отображения ошибок
    Returns:
        rendered template: HTML шаблон страницы ошибки
    """
    return render_template('error.html')

# Инициализация базы данных при запуске приложения
@app.before_first_request
def before_first_request():
    """
    Функция, выполняемая перед первым запросом к приложению
    """
    init_db()

if __name__ == '__main__':
    """
    Точка входа при запуске приложения напрямую
    """
    # Запуск Flask приложения в режиме отладки
    app.run(debug=True, host='0.0.0.0', port=5000)