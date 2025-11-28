// server/src/controllers/courseController.js
const Course = require('../models/Course');

// helper: safely convert to number or undefined
function toNumberOrUndefined(v) {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

/**
 * POST /api/courses   (Admin) – create course
 * IMPORTANT: we MUST set `title` because schema requires it.
 */
exports.addCourse = async (req, res, next) => {
  try {
    const {
      title,
      name,          // accept both for backwards compatibility
      description,
      duration,
      type,
      price,
      active,
      isActive
    } = req.body;

    const finalTitle = (title || name || '').trim();

    if (!finalTitle) {
      return res
        .status(400)
        .json({ success: false, message: 'Course title is required' });
    }

    const image = req.file ? req.file.filename : undefined;

    const course = await Course.create({
      title: finalTitle,
      description: description || '',
      duration: duration || '',
      image,
      type: type || 'long',
      price: toNumberOrUndefined(price) ?? 0,
      active:
        active !== undefined
          ? !!active
          : isActive !== undefined
          ? !!isActive
          : true,
    });

    return res.status(201).json({ success: true, data: course });
  } catch (err) {
    console.error('addCourse error:', err);
    return next(err);
  }
};

/**
 * GET /api/courses   – list
 */
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: courses });
  } catch (err) {
    console.error('getCourses error:', err);
    return next(err);
  }
};

/**
 * GET /api/courses/:id   – single
 */
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }
    return res.json({ success: true, data: course });
  } catch (err) {
    console.error('getCourse error:', err);
    return next(err);
  }
};

/**
 * PUT /api/courses/:id   – update
 */
exports.updateCourse = async (req, res, next) => {
  try {
    const {
      title,
      name,
      description,
      duration,
      type,
      price,
      active,
      isActive,
    } = req.body;

    const update = {};

    // title
    if (title !== undefined || name !== undefined) {
      const finalTitle = (title || name || '').trim();
      if (!finalTitle) {
        return res.status(400).json({
          success: false,
          message: 'Course title cannot be empty',
        });
      }
      update.title = finalTitle;
    }

    if (description !== undefined) update.description = description;
    if (duration !== undefined) update.duration = duration;
    if (type !== undefined) update.type = type;

    const numPrice = toNumberOrUndefined(price);
    if (numPrice !== undefined) update.price = numPrice;

    if (active !== undefined || isActive !== undefined) {
      update.active =
        active !== undefined ? !!active : isActive !== undefined ? !!isActive : undefined;
    }

    if (req.file) {
      update.image = req.file.filename;
    }

    // strip undefined keys
    Object.keys(update).forEach(
      (k) => update[k] === undefined && delete update[k]
    );

    const course = await Course.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }

    return res.json({ success: true, data: course });
  } catch (err) {
    console.error('updateCourse error:', err);
    return next(err);
  }
};

/**
 * DELETE /api/courses/:id
 */
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }
    return res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    console.error('deleteCourse error:', err);
    return next(err);
  }
};
