## Importing the MySQL schema (local MySQL 8)

1) Create the database (if it does not exist):
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS columbia_help_out CHARACTER SET utf8mb4;"
```

2) Import the schema file `sql/taskall.sql`:
```bash
mysql -u root -p columbia_help_out < sql/taskall.sql
```

Notes:
- Replace `-u root` with your MySQL username.
- `-p` will prompt for your password.
- `columbia_help_out` is the target database name—ensure it exists before importing.
- `sql/taskall.sql` is the schema file path; use an absolute path if you are not running the command from the project root.


