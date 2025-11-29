// server/src/controllers/resultController.js
const Result = require('../models/Result');

/**
 * Validate payload for create/update
 */
function validatePayload(body = {}) {
  const errors = [];

  if (!body.enrollmentNumber || !String(body.enrollmentNumber).trim()) {
    errors.push('Enrollment Number is required');
  }
  if (!body.rollNo || !String(body.rollNo).trim()) {
    errors.push('Roll No is required');
  }
  if (!body.course || !String(body.course).trim()) {
    errors.push('Course is required');
  }

  return errors;
}

/**
 * POST /api/results
 * Create a new result
 * Body: { enrollmentNumber, rollNo, course, declared?, notes? }
 */
exports.addResult = async (req, res) => {
  try {
    const errors = validatePayload(req.body || {});
    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
      });
    }

    const { enrollmentNumber, rollNo, course, declared, notes } = req.body;

    const doc = await Result.create({
      enrollmentNumber: String(enrollmentNumber).trim(),
      rollNo: String(rollNo).trim(),
      course: String(course).trim(),
      declared: typeof declared === 'boolean' ? declared : false,
      notes: notes || '',
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error('addResult error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while adding result' });
  }
};

/**
 * GET /api/results
 * Optional query params: search (matches enrollmentNumber / rollNo / course)
 */
exports.getResults = async (req, res) => {
  try {
    const { search } = req.query || {};
    const filter = {};

    if (search && String(search).trim()) {
      const regex = new RegExp(String(search).trim(), 'i');
      filter.$or = [
        { enrollmentNumber: regex },
        { rollNo: regex },
        { course: regex },
      ];
    }

    const results = await Result.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: results });
  } catch (err) {
    console.error('getResults error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while fetching results' });
  }
};

/**
 * GET /api/results/:id
 */
exports.getResult = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid id' });
    }

    const doc = await Result.findById(id).lean();
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: 'Result not found' });
    }

    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('getResult error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /api/results/:id
 * Body: { enrollmentNumber?, rollNo?, course?, declared?, notes? }
 */
exports.updateResult = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid id' });
    }

    const update = {};
    const body = req.body || {};

    if (body.enrollmentNumber !== undefined) {
      update.enrollmentNumber = String(body.enrollmentNumber).trim();
    }
    if (body.rollNo !== undefined) {
      update.rollNo = String(body.rollNo).trim();
    }
    if (body.course !== undefined) {
      update.course = String(body.course).trim();
    }
    if (body.declared !== undefined) {
      update.declared = !!body.declared;
    }
    if (body.notes !== undefined) {
      update.notes = body.notes;
    }

    const errors = validatePayload({
      enrollmentNumber:
        update.enrollmentNumber !== undefined
          ? update.enrollmentNumber
          : body.enrollmentNumber,
      rollNo:
        update.rollNo !== undefined ? update.rollNo : body.rollNo,
      course: update.course !== undefined ? update.course : body.course,
    }).filter(Boolean);

    if (errors.length) {
      return res
        .status(400)
        .json({ success: false, message: errors.join(', ') });
    }

    const doc = await Result.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: 'Result not found' });
    }

    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('updateResult error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while updating result' });
  }
};

/**
 * DELETE /api/results/:id
 */
exports.deleteResult = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid id' });
    }

    const doc = await Result.findByIdAndDelete(id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: 'Result not found' });
    }

    return res.json({ success: true, message: 'Result deleted' });
  } catch (err) {
    console.error('deleteResult error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error while deleting result' });
  }
};
