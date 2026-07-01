from database import get_connection


def authenticate(username, password):
    """Return the user's role if credentials are valid."""

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT role
        FROM users
        WHERE username = ?
        AND password = ?
    """, (username, password))

    row = cursor.fetchone()
    conn.close()

    return row[0] if row else None


def create_users_table():
    """Create users table if it doesn't exist."""

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT
        )
    """)

    conn.commit()
    conn.close()


def add_admin():
    """Insert default admin if it doesn't exist."""

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT OR IGNORE INTO users
        (username, password, role)
        VALUES
        ('admin', 'admin123', 'Admin')
    """)

    conn.commit()
    conn.close()


def get_all_users():
    """Return all users."""

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users")

    users = cursor.fetchall()

    conn.close()

    return users