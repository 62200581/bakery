import sqlite3

conn = sqlite3.connect('bakery.db')
cursor = conn.cursor()

print("=== FEEDBACK TABLE STRUCTURE ===")
cursor.execute("PRAGMA table_info(bakery_feedback)")
for row in cursor.fetchall():
    print(f"Column: {row[1]} ({row[2]})")

print("\n=== SAMPLE FEEDBACK DATA ===")
cursor.execute("SELECT * FROM bakery_feedback LIMIT 5")
for row in cursor.fetchall():
    print(row)

print("\n=== FEEDBACK COUNT ===")
cursor.execute("SELECT COUNT(*) FROM bakery_feedback")
count = cursor.fetchone()[0]
print(f"Total feedback records: {count}")

if count > 0:
    print("\n=== RATING DISTRIBUTION ===")
    cursor.execute("SELECT rating, COUNT(*) FROM bakery_feedback GROUP BY rating ORDER BY rating")
    for row in cursor.fetchall():
        print(f"Rating {row[0]}: {row[1]} records")

conn.close() 