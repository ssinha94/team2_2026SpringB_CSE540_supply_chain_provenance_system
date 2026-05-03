import sqlite3
import os
import bcrypt

DB_PATH = os.path.join(os.path.dirname(__file__), "supply_chain.db")

def init_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    
    raw_users = [
        ('superuser', 'superuser'),
        ('ssinha94', 'manufacturer'),
        ('josh', 'distributor'),
        ('zensparx', 'retailer'),
        ('nicolette', 'auditor')
    ]
    
    # Default password 'abcd1234' hardcode <bgood!!>
    password = "abcd1234".encode('utf-8')
    hashed = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')

    formatted_users = [(u, r, hashed) for u, r in raw_users]
    
    cursor.executemany('INSERT OR IGNORE INTO users (username, role, password_hash) VALUES (?, ?, ?)', formatted_users)
    conn.commit()
    conn.close()
    #print("Database seeded with ssinha94, josh, zensparx, and nicolette.")
    
def verify_user(username, password):
    print(f"\n[DEBUG] Checking database for user: {username}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT role, password_hash FROM users WHERE username = ?', (username,))
    result = cursor.fetchone()
    conn.close()
    
    if result:
        role, stored_hash = result
        print(f"[DEBUG] User found! Stored Hash: {stored_hash}") 
        
        match = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
        print(f"[DEBUG] Password match: {match}") 
        
        if match:
            return role
    else:
        print(f"[DEBUG] User '{username}' not found in database.") # New debug line
        
    return None

if __name__ == "__main__":
    init_db()