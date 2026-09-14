import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const relatedProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    url: { type: String, required: true, trim: true, maxlength: 500 },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    problemNumber: { type: String, trim: true, default: '', maxlength: 20 },
  },
  { _id: false }
);

const learningSchema = new mongoose.Schema(
  {
    learningId: {
      type: String,
      unique: true,
      index: true,
      default: () => nanoid(10),
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    content: {
      type: String,
      required: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    relatedProblems: [relatedProblemSchema],
    visibility: {
      type: String,
      enum: ['private', 'unlisted', 'public'],
      default: 'private',
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for title, content, and tags
learningSchema.index({ title: 'text', content: 'text', tags: 'text' });
learningSchema.index({ author: 1, visibility: 1 });

const Learning = mongoose.models.Learning || mongoose.model('Learning', learningSchema);

export default Learning;
