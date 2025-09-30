import express, { Response, NextFunction } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import studentController from "../controllers/StudentController"
import { StudentRequestBody } from '../types';
import verifyAccessToken from '../middlewares/verifyAccessToken';
import verifyRoles from '../middlewares/verifyRole';
import { UserRoleEnum } from '../enums';
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Protect upload endpoint with SuperAdmin role
router.post('/upload', verifyAccessToken, verifyRoles([UserRoleEnum.SUPER_ADMIN]), upload.single('file'), async (req: StudentRequestBody, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = `uploads/${file.filename}`;
    const data: Record<string, unknown>[] = [];

    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv',
      'text/plain' // some systems send CSV as text/plain
    ];

    if (validMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      // Parse Excel or CSV file using xlsx library (supports both)
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

      // Debug: Log the headers
      console.log('Excel headers:', jsonData[0]);

      jsonData.forEach((row: unknown[]) => {
        const parsedRow: Record<string, unknown> = {};
        row.forEach((cell, index) => {
          const headerCell = jsonData[0][index] as string;
          // Trim whitespace and normalize column names
          const normalizedHeader = headerCell?.toString().trim();
          parsedRow[normalizedHeader] = cell;
        });
        data.push(parsedRow);
      });
      
      // Debug: Log first few data rows
      console.log('Parsed data sample:', data.slice(0, 3));
      let flag: string | undefined = "ok";
      const ids: string[] = [];
      for (let i = 1; i < data.length; i++) {
        if (Object.keys(data[i]).length === 0)
          continue;
        req.body.name = data[i].name as string;
        req.body.id = data[i].id as string;
        req.body.email = data[i].email as string;
        req.body.phoneNumber = data[i].phoneNumber as string;
        req.body.department = data[i].department as string;
        
        // Debug logging
        console.log(`Processing row ${i}:`, {
          name: req.body.name,
          id: req.body.id,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
          department: req.body.department,
          rawData: data[i]
        });
        
        flag = await studentController.addStudent(req, res, next);
        console.log(flag);
        if (flag && flag !== "ok") {
          ids.push(flag);
        }
      }
      if (ids.length != 0)
        return res.json({
          success: true,
          status: res.statusCode,
          message: "error in adding students",
          data: ids
        });
      else
        return res.json({
          success: true,
          status: res.statusCode,
          message: "success adding students",
        });

    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file' 
      });
    }
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to process file. Please check the file format and try again.',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

export default router;
