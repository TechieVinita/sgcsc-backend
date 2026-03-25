// server/src/controllers/idCardController.js
const IDCard = require('../models/IDCard');

/**
 * POST /api/id-cards — Create a new ID card
 */
exports.createIDCard = async (req, res) => {
  try {
    const body = req.body || {};

    const {
      studentName,
      fatherName,
      motherName,
      enrollmentNo,
      dateOfBirth,
      contactNo,
      address,
      mobileNo,
      centerMobileNo,
      courseName,
      centerName,
      sessionFrom,
      sessionTo,
      photo,
      student
    } = body;

    // Validation
    if (!studentName || !studentName.trim()) {
      return res.status(400).json({ success: false, message: 'Student name is required' });
    }
    if (!fatherName || !fatherName.trim()) {
      return res.status(400).json({ success: false, message: 'Father name is required' });
    }
    if (!motherName || !motherName.trim()) {
      return res.status(400).json({ success: false, message: 'Mother name is required' });
    }
    if (!enrollmentNo || !enrollmentNo.trim()) {
      return res.status(400).json({ success: false, message: 'Enrollment number is required' });
    }
    if (!dateOfBirth) {
      return res.status(400).json({ success: false, message: 'Date of birth is required' });
    }

    const idCard = await IDCard.create({
      studentName: studentName.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      enrollmentNo: enrollmentNo.trim(),
      dateOfBirth,
      contactNo: contactNo?.trim() || '',
      address: address?.trim() || '',
      mobileNo: mobileNo?.trim() || '',
      centerMobileNo: centerMobileNo?.trim() || '',
      courseName: courseName?.trim() || '',
      centerName: centerName?.trim() || '',
      sessionFrom: sessionFrom?.trim() || '',
      sessionTo: sessionTo?.trim() || '',
      photo: photo?.trim() || '',
      student
    });

    return res.status(201).json({ success: true, data: idCard });
  } catch (err) {
    console.error('createIDCard error:', err);
    return res.status(500).json({ success: false, message: 'Server error while creating ID card' });
  }
};

/**
 * GET /api/id-cards — List ID cards (with optional ?search=…)
 */
exports.getIDCards = async (req, res) => {
  try {
    const { search } = req.query || {};
    const filter = {};

    if (search && search.trim()) {
      const rx = new RegExp(search.trim(), 'i');
      filter.$or = [
        { studentName: rx },
        { enrollmentNo: rx },
        { courseName: rx },
        { centerName: rx },
      ];
    }

    const cards = await IDCard.find(filter)
      .sort({ createdAt: -1 })
      .populate('student', 'name photo enrollmentNo rollNumber')
      .lean();

    return res.json({ success: true, data: cards });
  } catch (err) {
    console.error('getIDCards error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching ID cards' });
  }
};

/**
 * GET /api/id-cards/:id — Get single ID card by ID
 */
exports.getIDCardById = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await IDCard.findById(id).lean();

    if (!card) {
      return res.status(404).json({ success: false, message: 'ID card not found' });
    }

    return res.json({ success: true, data: card });
  } catch (err) {
    console.error('getIDCardById error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching ID card' });
  }
};

/**
 * PUT /api/id-cards/:id — Update an ID card
 */
exports.updateIDCard = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const {
      studentName,
      fatherName,
      motherName,
      enrollmentNo,
      dateOfBirth,
      contactNo,
      address,
      mobileNo,
      centerMobileNo,
      courseName,
      centerName,
      sessionFrom,
      sessionTo,
      photo
    } = body;

    const card = await IDCard.findById(id);

    if (!card) {
      return res.status(404).json({ success: false, message: 'ID card not found' });
    }

    // Update fields
    if (studentName !== undefined) card.studentName = studentName.trim();
    if (fatherName !== undefined) card.fatherName = fatherName.trim();
    if (motherName !== undefined) card.motherName = motherName.trim();
    if (enrollmentNo !== undefined) card.enrollmentNo = enrollmentNo.trim();
    if (dateOfBirth !== undefined) card.dateOfBirth = dateOfBirth;
    if (contactNo !== undefined) card.contactNo = contactNo.trim();
    if (address !== undefined) card.address = address.trim();
    if (mobileNo !== undefined) card.mobileNo = mobileNo.trim();
    if (centerMobileNo !== undefined) card.centerMobileNo = centerMobileNo.trim();
    if (courseName !== undefined) card.courseName = courseName.trim();
    if (centerName !== undefined) card.centerName = centerName.trim();
    if (sessionFrom !== undefined) card.sessionFrom = sessionFrom.trim();
    if (sessionTo !== undefined) card.sessionTo = sessionTo.trim();
    if (photo !== undefined) card.photo = photo.trim();

    await card.save();

    return res.json({ success: true, data: card });
  } catch (err) {
    console.error('updateIDCard error:', err);
    return res.status(500).json({ success: false, message: 'Server error while updating ID card' });
  }
};

/**
 * DELETE /api/id-cards/:id — Delete an ID card
 */
exports.deleteIDCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await IDCard.findById(id);

    if (!card) {
      return res.status(404).json({ success: false, message: 'ID card not found' });
    }

    await card.deleteOne();

    return res.json({ success: true, message: 'ID card deleted successfully' });
  } catch (err) {
    console.error('deleteIDCard error:', err);
    return res.status(500).json({ success: false, message: 'Server error while deleting ID card' });
  }
};