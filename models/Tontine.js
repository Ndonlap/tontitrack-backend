const mongoose = require('mongoose')
const Schema = mongoose.Schema

const contributionSechema = new Schema([{
    amount: { type: Number, require: true },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
}, { _id: false }]);
const sanctionSechema = new Schema([{
    amount: { type: Number, require: true },
    reason: { type: String, require: true },
    done: { type: Boolean, default: false },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
}, { _id: false }]);

const tontineSchema = new Schema({
    name: { type: String, require: true },
    description: { type: String, require: true },
    contributionAmount: { type: Number, require: true },
    paymentSchedule: { type: String, require: true },
    referencialCode: { type: String, require: true },
    presidentId: {
        _id: mongoose.Schema.Types.ObjectId,
        _ref: String
    },
    secretaryId: {
        _id: mongoose.Schema.Types.ObjectId,
        _ref: String
    },
    members: [{
        _id: mongoose.Schema.Types.ObjectId,
        _ref: String
    }],
    payoutIndex: { type: Number, require: true, default: 0 },
    balance: { type: Number, require: true, default: 0 },
    contributionsList: { type: [contributionSechema], require: true },
    sanctionsList: { type: [sanctionSechema], require: true },

});

const TontineModel = mongoose.model('TontineModel', tontineSchema);
module.exports = TontineModel