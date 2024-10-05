const mongoose = require('mongoose')
const Schema = mongoose.Schema

const transactionSechema = new Schema([{
    amount: { type: Number, require: true },
    type: { type: String, require: true, enum: ['CashIn', 'CashOut'] },
    createdDate: {
        type: Date,
        default: Date.now,
    },
}, { _id: false }]);
const notificationSechema = new Schema([{
    message: { type: String, require: true },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    senderId: {
        type: Object,
    },
}, { _id: false }])
const contributionsPerMonthSechema = new Schema([{
    month: { type: String, require: true },
    contribution: { type: Number, require: true, default: 0 },
}, { _id: false }])
const sanctionsPerMonthSechema = new Schema([{
    month: { type: String, require: true },
    contribution: { type: Number, require: true, default: 0 },
}, { _id: false }])
const userSchema = new Schema({
    name: { type: String, require: true },
    email: {
        type: String,
        require: true,
        match: /.+\@.+\..+/, // Simple regex for email validation
        unique: true
    },
    phone: { type: String, require: true },
    token: { type: String, require: true },
    dob: { type: Date, require: true },
    password: {
        type: String,
        default: null
    },
    gender: { type: String, require: true },
    accountType: {
        type: String, require: true, enum: ['User', 'Admin'],
        default: "User"
    },
    balance: { type: Number, require: true, default: 0 },
    tontineNumber: { type: Number, require: true, default: 0 },
    contribution: { type: Number, require: true, default: 0 },
    contributionsPerMonth: { type: [contributionsPerMonthSechema], require: true, default: 0 },
    sanctions: { type: Number, require: true, default: 0 },
    sanctionsPerMonth: { type: [sanctionsPerMonthSechema], require: true, default: 0 },
    payouts: { type: Number, require: true, default: 0 },
    payoutsPerMonth: { type: [sanctionsPerMonthSechema], require: true, default: 0 },
    transactions: { type: [transactionSechema], require: true },
    notifications: { type: [notificationSechema], require: true },
});

const UserModel = mongoose.model('UserModel', userSchema);
module.exports = UserModel