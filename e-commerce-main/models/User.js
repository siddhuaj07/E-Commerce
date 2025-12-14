import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 15
  },
  plusCode: {
    type: String,
    trim: true,
    maxlength: 20,
    validate: {
      validator: function(v) {
        if (!v) return true;
        const plusCodePattern = /^[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,4}$/i;
        const cleanedCode = v.replace(/\s/g, '');
        return plusCodePattern.test(cleanedCode);
      },
      message: 'Please enter a valid Google Plus Code (e.g., 57FC+4XH, 8F6C+2XH, etc.)'
    }
  }
}, {
  timestamps: true
});
export default mongoose.models.User || mongoose.model('User', UserSchema);
