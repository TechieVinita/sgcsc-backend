const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    // Student reference and roll number
    student: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Student",
      required: false,
      default: null
    },
    rollNumber: { 
      type: String, 
      required: false,
      index: true 
    },
    
    // Course reference
    course: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Course",
      required: false,
      default: null
    },
    
    // Subject-wise marks with subject reference
    subjects: [
      {
        subject: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Subject",
          required: false 
        },
        subjectName: { 
          type: String, 
          required: false 
        },
        maxMarks: { 
          type: Number, 
          default: 100 
        },
        minMarks: { 
          type: Number, 
          default: 0 
        },
        marksObtained: { 
          type: Number, 
          required: false,
          default: 0 
        },
        practicalMarks: { 
          type: Number, 
          default: 0 
        },
        maxPracticalMarks: { 
          type: Number, 
          default: 0 
        },
        grade: { 
          type: String,
          default: ""
        },
        status: {
          type: String,
          enum: ['pass', 'fail', 'absent'],
          default: 'pass'
        }
      },
    ],
    
    // Overall result summary
    totalMarks: { 
      type: Number, 
      default: 0 
    },
    totalObtained: { 
      type: Number, 
      default: 0 
    },
    percentage: { 
      type: Number, 
      default: 0 
    },
    overallGrade: { 
      type: String,
      default: ""
    },
    resultStatus: {
      type: String,
      enum: ['pass', 'fail', 'pending'],
      default: 'pending'
    },
    
    // Exam session info
    examSession: { 
      type: String,
      default: ""
    },
    examDate: { 
      type: Date 
    },
    
    // Remarks
    remarks: { 
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// Index for faster queries
resultSchema.index({ student: 1, course: 1 });
resultSchema.index({ rollNumber: 1, course: 1 });

module.exports = mongoose.model("Result", resultSchema); 
