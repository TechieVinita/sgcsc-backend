const Course = require('../models/Course');

// Add new course (Admin only)
exports.addCourse = async (req, res) => {
  try {
    const { title, description, duration } = req.body;
    const image = req.file ? req.file.filename : null;

    const newCourse = new Course({ title, description, duration, image });
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding course' });
  }
};

// Get all courses (public)
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

// Delete a course (Admin only)
exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting course' });
  }
};
