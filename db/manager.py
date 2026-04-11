import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "supply_chain.db")

def create_user_table():
    # Connect to the database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create the table
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
    print("SQLite data created successfully.")

if __name__ == "__main__":
    create_user_table()