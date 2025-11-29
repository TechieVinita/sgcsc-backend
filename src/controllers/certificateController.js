// server/src/controllers/certificateController.js
const Certificate = require('../models/Certificate');

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * POST /api/certificates
 * Body: { enrollmentNumber, issueDate }
 */
exports.createCertificate = async (req, res) => {
  try {
    const { enrollmentNumber, issueDate } = req.body || {};

    if (!enrollmentNumber || !issueDate) {
      return res.status(400).json({
        success: false,
        message: 'enrollmentNumber and issueDate are required',
      });
    }

    const parsedDate = parseDate(issueDate);
    if (!parsedDate) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid issueDate format' });
    }

    const cert = await Certificate.create({
      enrollmentNumber: String(enrollmentNumber).trim(),
      issueDate: parsedDate,
    });

    return res.status(201).json({ success: true, data: cert });
  } catch (err) {
    console.error('createCertificate error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while creating certificate' });
  }
};

/**
 * GET /api/certificates
 * Optional query: search (by enrollmentNumber)
 */
exports.getCertificates = async (req, res) => {
  try {
    const { search } = req.query || {};
    const filter = {};

    if (search && search.trim()) {
      const rx = new RegExp(search.trim(), 'i');
      filter.enrollmentNumber = rx;
    }

    const certs = await Certificate.find(filter)
      .sort({ issueDate: -1, createdAt: -1 })
      .lean();

    return res.json({ success: true, data: certs });
  } catch (err) {
    console.error('getCertificates error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while fetching certificates' });
  }
};

/**
 * GET /api/certificates/:id
 */
exports.getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await Certificate.findById(id).lean();
    if (!cert) {
      return res
        .status(404)
        .json({ success: false, message: 'Certificate not found' });
    }
    return res.json({ success: true, data: cert });
  } catch (err) {
    console.error('getCertificateById error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while fetching certificate' });
  }
};

/**
 * PUT /api/certificates/:id
 * Body: { enrollmentNumber?, issueDate? }
 */
exports.updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { enrollmentNumber, issueDate } = req.body || {};

    const update = {};

    if (enrollmentNumber != null) {
      update.enrollmentNumber = String(enrollmentNumber).trim();
    }

    if (issueDate != null) {
      const parsedDate = parseDate(issueDate);
      if (!parsedDate) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid issueDate format' });
      }
      update.issueDate = parsedDate;
    }

    const cert = await Certificate.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!cert) {
      return res
        .status(404)
        .json({ success: false, message: 'Certificate not found' });
    }

    return res.json({ success: true, data: cert });
  } catch (err) {
    console.error('updateCertificate error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while updating certificate' });
  }
};

/**
 * DELETE /api/certificates/:id
 */
exports.deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await Certificate.findByIdAndDelete(id);
    if (!cert) {
      return res
        .status(404)
        .json({ success: false, message: 'Certificate not found' });
    }
    return res.json({ success: true, message: 'Certificate deleted' });
  } catch (err) {
    console.error('deleteCertificate error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while deleting certificate' });
  }
};
