import mongoose from "mongoose";
const Schema = mongoose.Schema;

let userSchema = new Schema({
    name: { type: String, minlength: 1, maxlength: 256, required: false },
    email: { type: String, minlength: 6, maxlength: 320, trim: true, required: true, unique: true },
    phoneNumber: { type: String, minlength: 6, maxlength: 15, trim: true, required: false },
    password: { type: String, minlength: 6, maxlength: 256, trim: true, required: true },
    bio: { type: String, minlength: 3, maxlength: 255, trim: true, required: false },
}, { timestamps: true });

// exports model
export default mongoose.model('Users', userSchema);
