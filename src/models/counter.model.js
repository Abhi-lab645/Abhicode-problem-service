import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    seq: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false
});

/**
 * Atomically generates the next sequence number for a given counter key.
 * Uses findOneAndUpdate with $inc and upsert to ensure concurrent-safe increments.
 *
 * @param {string} sequenceName - Identifier for the counter (e.g. 'problemId')
 * @returns {Promise<number>} - The new sequence number
 */
counterSchema.statics.getNextSequence = async function (sequenceName) {
    const counter = await this.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: 'after' }
    );
    return counter.seq;
};

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;
