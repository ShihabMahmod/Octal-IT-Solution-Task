const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  type: {
    type: String,
    enum: ['blog', 'comment'],
    required: true
  }
}, {
  timestamps: true
});


likeSchema.index({ user: 1, blog: 1 }, { unique: true, sparse: true });
likeSchema.index({ user: 1, comment: 1 }, { unique: true, sparse: true });


likeSchema.post('save', async function() {
  if (this.type === 'blog' && this.blog) {
    const Blog = mongoose.model('Blog');
    await Blog.findByIdAndUpdate(this.blog, {
      $inc: { likesCount: 1 }
    });
  } else if (this.type === 'comment' && this.comment) {
    const Comment = mongoose.model('Comment');
    await Comment.findByIdAndUpdate(this.comment, {
      $inc: { likesCount: 1 },
      $addToSet: { likes: this.user }
    });
  }
});

likeSchema.post('remove', async function() {
  if (this.type === 'blog' && this.blog) {
    const Blog = mongoose.model('Blog');
    await Blog.findByIdAndUpdate(this.blog, {
      $inc: { likesCount: -1 }
    });
  } else if (this.type === 'comment' && this.comment) {
    const Comment = mongoose.model('Comment');
    await Comment.findByIdAndUpdate(this.comment, {
      $inc: { likesCount: -1 },
      $pull: { likes: this.user }
    });
  }
});

module.exports = mongoose.model('Like', likeSchema);