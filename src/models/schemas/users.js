
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        match: /^[a-z0-9_]+$/,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
    },
});

const User = mongoose.model('User', userSchema);

export default User;
