const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Name is required'],
		trim: true,
		minlength: [2, 'Name must be at least 2 characters long'],
		maxlength: [50, 'Name cannot exceed 50 characters']
	},
	email: {
		type: String,
		required: [true, 'Email is required'],
		unique: true,
		trim: true,
		lowercase: true,
		match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
	},
	password: {
		type: String,
		required: [true, 'Password is required'],
		minlength: [6, 'Password must be at least 6 characters long']
	},
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user'
	},
	profileImage: {
		type: String,
		default: 'default-profile.png'
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	lastLogin: {
		type: Date
	},
	isActive: {
		type: Boolean,
		default: true
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date
}, {
	timestamps: true
});

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

userSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');
	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');
	this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
	return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;