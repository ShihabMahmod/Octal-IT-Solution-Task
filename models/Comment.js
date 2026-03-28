const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment must be at least 1 character'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isApproved: {
    type: Boolean,
    default: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});


commentSchema.post('save', async function() {
  if (!this.parentComment) {
    const Blog = mongoose.model('Blog');
    await Blog.findByIdAndUpdate(this.blog, {
      $inc: { commentsCount: 1 }
    });
  }
});

commentSchema.post('save', async function() {
  if (this.parentComment) {
    const Comment = mongoose.model('Comment');
    await Comment.findByIdAndUpdate(this.parentComment, {
      $addToSet: { replies: this._id }
    });
  }
});

module.exports = mongoose.model('Comment', commentSchema);