import sqlite3
import os
import bcrypt

# Locate db roles from text. 
DB_PATH = os.path.join(os.path.dirname(__file__), "supply_chain.db")
ROLES_FILE = os.path.join(os.path.dirname(__file__), "..", "loginGui", "roles.txt")

def init_db():
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
    conn.commit()
    conn.close()
    print("Database initialized.")

def migrate_from_text_file():
    if not os.path.exists(ROLES_FILE):
        print(f"Error: {ROLES_FILE} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Default password for everyone being moved from the text file
    default_password = "password123".encode('utf-8')
    hashed = bcrypt.hashpw(default_password, bcrypt.gensalt()).decode('utf-8')

    with open(ROLES_FILE, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or "," not in line:
                continue
            
            username, role = [item.strip() for item in line.split(",")]
            
            try:
                cursor.execute(
                    "INSERT INTO users (username, role, password_hash) VALUES (?, ?, ?)",
                    (username, role, hashed)
                )
                print(f"Migrated user: {username} ({role})")
            except sqlite3.IntegrityError:
                print(f"User {username} already exists, skipping.")

    conn.commit()
    conn.close()
    print("completed migration.")

if __name__ == "__main__":
    init_db()
    migrate_from_text_file()