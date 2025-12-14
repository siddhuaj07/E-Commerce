import mongoose from 'mongoose';
const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    plusCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
      validate: {
        validator: function(v) {
          const plusCodePattern = /^[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,4}$/i;
          const cleanedCode = v.replace(/\s/g, '');
          return plusCodePattern.test(cleanedCode);
        },
        message: 'Please enter a valid Google Plus Code (e.g., 57FC+4XH, 8F6C+2XH, etc.)'
      }
    }
  },
  status: {
    type: String,
    enum: ['order_placed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'order_placed'
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });
export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
