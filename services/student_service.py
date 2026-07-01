import sqlite3
from database import get_connection


def add_student(name, roll_no, branch, semester, email=None):
    """Insert a new student. Returns (success: bool, message: str)."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO students (name, roll_no, branch, semester, email)
            VALUES (?, ?, ?, ?, ?)
        """, (name, roll_no, branch, semester, email))
        conn.commit()
        return True, "Student Registered Successfully"
    except sqlite3.IntegrityError:
        return False, f"Roll Number '{roll_no}' already exists"
    finally:
        conn.close()


def get_student(name):
    """Fetch a single student by name. Returns a dict or None."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, roll_no, branch, semester, email
        FROM students
        WHERE name = ?
    """, (name,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "id": row[0],
        "name": row[1],
        "roll_no": row[2],
        "branch": row[3],
        "semester": row[4],
        "email": row[5],
    }


def get_all_students():
    """Fetch all students. Returns a list of dicts."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, roll_no, branch, semester, email FROM students")
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": r[0], "name": r[1], "roll_no": r[2],
            "branch": r[3], "semester": r[4], "email": r[5],
        }
        for r in rows
    ]


def update_student(name, branch=None, semester=None, email=None):
    """Update branch/semester/email for an existing student."""
    student = get_student(name)
    if not student:
        return False, "Student Not Found"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE students
        SET branch = ?, semester = ?, email = ?
        WHERE name = ?
    """, (
        branch if branch is not None else student["branch"],
        semester if semester is not None else student["semester"],
        email if email is not None else student["email"],
        name,
    ))
    conn.commit()
    conn.close()
    return True, "Student Updated Successfully"


def delete_student(name):
    """Delete a student by name. Returns (success: bool, message: str)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM students WHERE name = ?", (name,))
    deleted = cursor.rowcount
    conn.commit()
    conn.close()

    if deleted == 0:
        return False, "Student Not Found"
    return True, "Student Deleted Successfully"