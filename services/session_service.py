from datetime import datetime
from database import get_connection


def start_session(subject, faculty="Admin"):
    """Start a new attendance session."""

    conn = get_connection()
    cursor = conn.cursor()

    today = datetime.now().strftime("%d-%m-%Y")
    now = datetime.now().strftime("%H:%M:%S")

    # Close any active session
    cursor.execute("""
        UPDATE sessions
        SET
            status='CLOSED',
            end_time=?
        WHERE status='ACTIVE'
    """, (now,))

    # Start new session
    cursor.execute("""
        INSERT INTO sessions
        (
            subject,
            faculty,
            date,
            start_time,
            status
        )
        VALUES (?,?,?,?,?)
    """, (
        subject,
        faculty,
        today,
        now,
        "ACTIVE"
    ))

    conn.commit()

    session_id = cursor.lastrowid

    conn.close()

    return session_id


def get_current_session():
    """Return the active session."""

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            session_id,
            subject,
            faculty,
            date,
            start_time
        FROM sessions
        WHERE status='ACTIVE'
        LIMIT 1
    """)

    session = cursor.fetchone()

    conn.close()

    return session


def end_session():
    """End the active session."""

    conn = get_connection()
    cursor = conn.cursor()

    now = datetime.now().strftime("%H:%M:%S")

    cursor.execute("""
        UPDATE sessions
        SET
            status='CLOSED',
            end_time=?
        WHERE status='ACTIVE'
    """, (now,))

    conn.commit()

    conn.close()


def is_session_active():
    """Return True if a session is active."""

    return get_current_session() is not None