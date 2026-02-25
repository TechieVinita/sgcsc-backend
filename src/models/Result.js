const mongoose = require("mongoose"); 

const resultSchema = new mongoose.Schema(
  {
    rollNumber: { type: String, required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    subjects: [
      {
        name: String,
        objective: Number,
        practical: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema); 
