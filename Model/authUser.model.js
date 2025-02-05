import mongoose from 'mongoose';

const authUserSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: String,
  profilePicture: String,
});

const AuthUser = mongoose.model('AuthUser', authUserSchema);

export default AuthUser;
