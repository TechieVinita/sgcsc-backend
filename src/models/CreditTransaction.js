const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema(
  {
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Franchise',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['deduction', 'topup'],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    feature: {
      type: String,
      enum: ['student', 'course', 'subject', 'result', 'certificate'],
    },

    description: {
      type: String,
      trim: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    referenceModel: {
      type: String,
      enum: ['Student', 'Course', 'Subject', 'Result', 'Certificate'],
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);
