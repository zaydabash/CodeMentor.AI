from flask import Flask, request
import sqlite3

app = Flask(__name__)

@app.route('/user/<user_id>')
def get_user(user_id):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)
    user = cursor.fetchone()
    return {'user': user}

@app.route('/process')
async def process_data():
    result = expensive_operation()
    return {'result': result}

def expensive_operation():
    try:
        return 1 / 0
    except:
        return None

