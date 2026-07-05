import os
import sqlite3

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

DATABASE_NAME = os.path.join(BASE_DIR, "attendance.db")

def get_connection():

    return sqlite3.connect(DATABASE_NAME)