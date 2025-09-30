# Student File Upload Format

## Supported Formats

- Excel: `.xlsx` or `.xls`
- CSV: `.csv`

## Required Columns

Your file must contain the following columns in the **first row** (header row):

| Column Name   | Description                    | Example              |
|---------------|--------------------------------|----------------------|
| `name`        | Full name of the student       | John Doe             |
| `id`          | Student ID number              | 12345678             |
| `email`       | Student email address          | john.doe@example.com |
| `phoneNumber` | Student phone number           | +1234567890          |
| `department`  | Department name                | Computer Science     |

## Example File Structure

### Excel (.xlsx, .xls)
```
| name        | id       | email                    | phoneNumber  | department         |
|-------------|----------|--------------------------|--------------|--------------------|
| John Doe    | 12345678 | john.doe@example.com     | +1234567890  | Computer Science   |
| Jane Smith  | 87654321 | jane.smith@example.com   | +9876543210  | Engineering        |
| Bob Johnson | 11223344 | bob.johnson@example.com  | +5555555555  | Mathematics        |
```

### CSV (.csv)
```csv
name,id,email,phoneNumber,department
John Doe,12345678,john.doe@example.com,+1234567890,Computer Science
Jane Smith,87654321,jane.smith@example.com,+9876543210,Engineering
Bob Johnson,11223344,bob.johnson@example.com,+5555555555,Mathematics
```

## Important Notes

1. **Column names must match exactly** (case-sensitive)
2. **First row must be the header row** with column names
3. **All columns are required** for each student
4. **Student IDs must be unique** - duplicate IDs will be rejected
5. **File format** must be `.xlsx`, `.xls`, or `.csv`
6. **CSV format**: Use commas as delimiters, no special formatting needed
7. Only **SuperAdmin users** can upload student files

## What Happens During Upload

- The system will create user accounts automatically for each student
- Usernames and passwords are auto-generated based on student names
- Students will receive login credentials via email (if valid email provided)
- If a student ID already exists, it will be skipped and reported as an error
- You'll see a success message with any student IDs that failed to import

## Testing the Upload

1. Create a file (Excel or CSV) with the columns above
2. Add a few test students
3. Save the file as `.xlsx`, `.xls`, or `.csv` format
4. Log in as SuperAdmin
5. Navigate to Admin → Processes
6. Click "📥 Download Sample Template" to get a sample CSV file (optional)
7. Click "Choose File (Excel or CSV)" and select your file
8. Click "Upload Students"
9. Check the results - successful uploads will show a success message, errors will be listed
