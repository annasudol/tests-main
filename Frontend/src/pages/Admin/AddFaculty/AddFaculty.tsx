/* eslint-disable react/no-unescaped-entities */
import * as React from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Alert } from "@mui/material";
import { Form, FormikProvider } from "formik";
import { LoadingButton } from "@mui/lab";
import useAddFacultyController from "./hooks/useAddFacultyController";
import TextFieldWrapper from "src/components/FormsUI/TextField";
import { useState } from "react";
import "./AddFaculty.css";
import useSnackbar from "src/hooks/useSnackbar";
import { uploadExcelFile } from "./api";

const AddFaculty: React.FC = () => {
  const { formikProps, isLoading } = useAddFacultyController();
  const { isValid } = formikProps;
  const { showSnackbar } = useSnackbar();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [isFileValid, setIsFileValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>("");

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateFileContent = async (file: File): Promise<{ valid: boolean; message: string }> => {
    const requiredColumns = ['name', 'id', 'email', 'phoneNumber', 'department'];
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          if (!text) {
            resolve({ valid: false, message: "File is empty" });
            return;
          }

          // Parse first two lines (header + at least one data row)
          const lines = text.split('\n').filter(line => line.trim() !== '');
          
          if (lines.length < 2) {
            resolve({ 
              valid: false, 
              message: "File must contain a header row and at least one data row" 
            });
            return;
          }

          // Check header row for required columns
          const headerLine = lines[0].trim();
          const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
          
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          
          if (missingColumns.length > 0) {
            resolve({ 
              valid: false, 
              message: `Missing required columns: ${missingColumns.join(', ')}` 
            });
            return;
          }

          // Check if columns are in correct order (optional but helpful)
          const hasAllColumns = requiredColumns.every(col => headers.includes(col));
          
          if (!hasAllColumns) {
            resolve({ 
              valid: false, 
              message: `File must contain all required columns: ${requiredColumns.join(', ')}` 
            });
            return;
          }

          // Validate email format in data rows
          const emailIndex = headers.indexOf('email');
          const invalidEmails: string[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
            const email = row[emailIndex];
            
            if (email && !isValidEmail(email)) {
              invalidEmails.push(`Row ${i + 1}: "${email}"`);
            }
          }

          if (invalidEmails.length > 0) {
            const errorMsg = invalidEmails.length > 3 
              ? `Invalid email format in ${invalidEmails.length} rows. First 3: ${invalidEmails.slice(0, 3).join(', ')}`
              : `Invalid email format: ${invalidEmails.join(', ')}`;
            
            resolve({ 
              valid: false, 
              message: errorMsg
            });
            return;
          }

          resolve({ 
            valid: true, 
            message: `✓ Valid file with ${lines.length - 1} student(s)` 
          });
        } catch (error) {
          resolve({ 
            valid: false, 
            message: "Failed to parse file. Please check the format." 
          });
        }
      };

      reader.onerror = () => {
        resolve({ 
          valid: false, 
          message: "Failed to read file" 
        });
      };

      // Read as text for CSV validation
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    // Reset validation state
    setIsFileValid(false);
    setValidationMessage("");
    setSelectedFile(null);
    
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv', // .csv
        'application/csv',
        'text/plain'
      ];
      
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        setValidationMessage("Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file");
        showSnackbar({
          severity: "error",
          message: "Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file",
        });
        return;
      }

      // For CSV files, validate content
      if (file.name.match(/\.csv$/i) || file.type.includes('csv') || file.type === 'text/plain') {
        const validation = await validateFileContent(file);
        setValidationMessage(validation.message);
        setIsFileValid(validation.valid);
        
        if (validation.valid) {
          setSelectedFile(file);
          showSnackbar({
            severity: "success",
            message: validation.message,
          });
        } else {
          showSnackbar({
            severity: "error",
            message: validation.message,
          });
        }
      } else {
        // For Excel files, we can't easily validate without a library, so just accept them
        setSelectedFile(file);
        setIsFileValid(true);
        setValidationMessage(`✓ Excel file selected: ${file.name}`);
        showSnackbar({
          severity: "info",
          message: "Excel file selected. Column validation will occur during upload.",
        });
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      showSnackbar({
        severity: "error",
        message: "Please select a file to upload",
      });
      return;
    }

    setIsUploadLoading(true);
    setErrorMessage([]);

    try {
      const res = await uploadExcelFile(selectedFile);
      
      if (res.message === "error in adding students") {
        setErrorMessage(res.data || ["Unknown error occurred"]);
        handleShowErrorDialog();
        showSnackbar({
          severity: "warning",
          message: `Some students could not be added. ${res.data?.length || 0} errors found.`,
        });
      } else if (res.success === true) {
        showSnackbar({
          severity: "success",
          message: res.message || "Students added successfully!",
        });
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        showSnackbar({
          severity: "error",
          message: res.message || "Failed to upload file",
        });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      showSnackbar({
        severity: "error",
        message: error?.response?.data?.message || "Failed to upload file. Please try again.",
      });
    } finally {
      setIsUploadLoading(false);
    }
  };
  const handleShowErrorDialog = () => {
    setShowErrorMessage(true);
  };
  const handleCancelShowErrorDialog = () => {
    setShowErrorMessage(false);
  };

  const downloadTemplate = () => {
    // Create sample CSV content that can be opened in Excel
    const csvContent = `name,id,email,phoneNumber,department
John Zoe,934556,john.doe@example.com,+1234567890,Computer Science
Jane Smith,9234557,jane.smith@example.com,+9876543210,Engineering
Bob Jon,9233353,bob.johnson@example.com,+5555555555,Mathematics`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <>
      <>
        <Grid
          container
          spacing={2}
          gap={2}
          sx={{
            py: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column", // Add this line
          }}
        >
          <Paper
            elevation={10}
            sx={{
              justifyContent: "center",
              alignItems: "center",
              p: 4,
              minWidth: { xs: "90%", sm: "60%", md: "30%" },
            }}
          >
            <FormikProvider value={formikProps}>
              <Form>
                <Stack gap={2} alignItems="center">
                  <Typography component="h1" variant="h5">
                    Add New Faculty
                  </Typography>

                  <TextFieldWrapper label="Faculty Name" name="name" />

                  <TextFieldWrapper label="Faculty Email" name="email" />
                  <LoadingButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={!isValid}
                    loading={isLoading}
                  >
                    Add
                  </LoadingButton>
                </Stack>
              </Form>
            </FormikProvider>
          </Paper>
          <Paper elevation={10} sx={{ p: 4, minWidth: { xs: "90%", sm: "60%", md: "30%" } }}>
            <Stack spacing={2} gap={2} alignItems="center">
              <Typography component="h3" variant="h5">
                Add New Students
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Upload an Excel (.xlsx, .xls) or CSV (.csv) file with the following columns:
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                name | id | email | phoneNumber | department
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={downloadTemplate}
                sx={{ textTransform: 'none', mb: 1 }}
              >
                📥 Download Sample Template
              </Button>
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <Stack spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ textTransform: 'none' }}
                  >
                    {selectedFile ? selectedFile.name : "Choose File (Excel or CSV)"}
                    <input 
                      type="file" 
                      name="file" 
                      accept=".xlsx, .xls, .csv" 
                      onChange={handleFileChange}
                      hidden
                    />
                  </Button>
                  {validationMessage && (
                    <Alert 
                      severity={isFileValid ? "success" : "error"} 
                      sx={{ width: '100%' }}
                    >
                      {validationMessage}
                    </Alert>
                  )}
                  <LoadingButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={!selectedFile || !isFileValid}
                    loading={isUploadLoading}
                  >
                    Upload Students
                  </LoadingButton>
                </Stack>
              </form>
            </Stack>
          </Paper>
        </Grid>
      </>
      <Dialog open={showErrorMessage} onClose={handleCancelShowErrorDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          Upload Errors
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            The following student IDs could not be added (they may already exist):
          </Typography>
          <Stack spacing={1} sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
            {errorMessage.map((error, index) => (
              <Typography 
                key={index} 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace', 
                  bgcolor: 'grey.100', 
                  p: 1, 
                  borderRadius: 1 
                }}
              >
                • {error}
              </Typography>
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Total errors: {errorMessage.length}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelShowErrorDialog} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default AddFaculty;
