import mongoose from 'mongoose';
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    required: false,
    default: 'General'
  }
}, {
  timestamps: true
});
export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
