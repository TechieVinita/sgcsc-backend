// server/src/controllers/marksheetController.js
const Handlebars = require('handlebars');
const MarksheetTemplate = require('../models/MarksheetTemplate');
const Student = require('../models/Student');
const Result = require('../models/Result');

exports.generatePdf = async (req, res) => {
  const { templateId, studentId } = req.body;
  const tpl = await MarksheetTemplate.findById(templateId).lean();
  const student = await Student.findById(studentId).lean();
  const results = await Result.find({ student: studentId }).lean();

  const html = Handlebars.compile(tpl.html)({ student, results, date: new Date().toLocaleDateString() });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=marksheet-${student.rollNo || student._id}.pdf`
  });
  res.send(pdfBuffer);
};
