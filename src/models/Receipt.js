// src/models/Receipt.js
const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  enrollmentNo: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  sessionStart: {
    type: String,
    required: true,
    trim: true
  },
  sessionEnd: {
    type: String,
    required: true,
    trim: true
  },
  monthlyFee: {
    type: Number,
    required: true,
    default: 600
  },
  dueAmount: {
    type: Number,
    default: 0
  },
  totalPaid: {
    type: Number,
    required: true
  },
  totalDue: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Online', 'Cheque', 'Bank Transfer'],
    default: 'Cash'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  whatsappNumber: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  // Monthly breakdown
  monthlyPayments: [{
    month: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    paid: {
      type: Number,
      default: 0
    },
    due: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Partial'],
      default: 'Paid'
    }
  }],
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  }
}, {
  timestamps: true
});

// Index for faster queries
receiptSchema.index({ receiptNo: 1 });
receiptSchema.index({ student: 1 });
receiptSchema.index({ enrollmentNo: 1 });
receiptSchema.index({ createdAt: -1 });

// Pre-save middleware to generate receipt number if not provided
receiptSchema.pre('save', async function(next) {
  if (!this.receiptNo) {
    // Generate receipt number: RECPT-YYYY-NNNN
    const year = new Date().getFullYear();
    const count = await mongoose.model('Receipt').countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.receiptNo = `RECPT-${year}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Receipt', receiptSchema);