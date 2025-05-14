const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const Test = require('../models/Test');

// Upload Test Excel
exports.uploadTest = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const filePath = path.join(__dirname, '..', 'uploads', 'tests', file.filename);

    // Parse Excel
const workbook = xlsx.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// ✅ First two values from first row
const meta = xlsx.utils.sheet_to_json(sheet, { header: 1 })[1]; // first row

const duration = parseInt(meta[6]); // G column
const totalQuestionCount = parseInt(meta[7]); // I column
const randomizedQuestionCount = parseInt(meta[8]); // H column

// ✅ Read questions starting from row 3
const questions = xlsx.utils.sheet_to_json(sheet, {
  header: ['Question', 'A', 'B', 'C', 'D', 'Answer'],
  range: 2, // means start from row index 3 (0-based)
});

    // Save test
    const test = new Test({
        title: file.originalname.split('.')[0],
        filePath: '/uploads/tests/' + file.filename,
        duration,
        randomizedQuestionCount,
        totalQuestionCount,
        questions,
      });
      

    await test.save();

    res.status(201).json({ message: 'Test uploaded', test });
  } catch (err) {
    console.error('Error uploading test:', err);
    res.status(500).json({ message: 'Error uploading test', error: err.message });
  }
};

// Get all tests
exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.find();
    
    res.status(200).json(tests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tests', error: err.message });
  }
};


// DELETE a test by ID + remove Excel file
exports.deleteTest = async (req, res) => {
    try {
      const testId = req.params.id;
  
      const test = await Test.findById(testId);
      if (!test) return res.status(404).json({ message: 'Test not found' });
  
      // ✅ Delete associated Excel file from filesystem
      const fullPath = path.join(__dirname, '..', test.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
  
      // ✅ Delete test document from DB
      await Test.findByIdAndDelete(testId);
  
      res.status(200).json({ message: 'Test and file deleted successfully' });
    } catch (err) {
      console.error("Error deleting test:", err);
      res.status(500).json({ message: 'Failed to delete test', error: err.message });
    }
  };

  // GET: Preview test content (parse Excel to JSON)
exports.previewTest = async (req, res) => {
    try {
      const testId = req.params.id;
      const test = await Test.findById(testId);
  
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
  
      const filePath = path.join(__dirname, '..', test.filePath);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Excel file not found" });
      }
  
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const questions = xlsx.utils.sheet_to_json(sheet, {
        header: ['Question', 'A', 'B', 'C', 'D', 'Answer'],
        range: 1,
      });
  
      res.status(200).json({ testTitle: test.title, questions });
    } catch (err) {
      console.error("Error previewing test:", err);
      res.status(500).json({ message: "Failed to preview test", error: err.message });
    }
  };


  // GET /api/admin/test/:id/download
exports.downloadTestFile = async (req, res) => {
    try {
      const test = await Test.findById(req.params.id);
      if (!test) return res.status(404).json({ message: "Test not found" });
  
      const filePath = path.join(__dirname, '..', test.filePath);
      res.download(filePath, `${test.title}.xlsx`);
    } catch (err) {
      console.error("Download error:", err);
      res.status(500).json({ message: "Failed to download file" });
    }
  };
  
