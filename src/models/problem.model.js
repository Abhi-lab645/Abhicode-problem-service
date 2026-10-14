import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
    problemId: {
        type: String,
        required: [true, 'Problem ID cannot be empty'],
        unique: true,
        trim: true
    },

    title: {
        type: String,
        required: [true, 'Title cannot be empty'],
        trim: true
    },

    description: {
        type: String,
        required: [true, 'Description cannot be empty']
    },

    difficulty: {
        type: String,
        required: [true, 'Difficulty cannot be empty'],
        enum: ['easy', 'medium', 'hard'],
        default: 'easy'
    },

    topics: {
        type: [String],
        default: [],
        validate: [
            {
                validator: function (topics) {
                    if (!Array.isArray(topics)) return false;
                    if (topics.length > 20) return false;
                    const seen = new Set();
                    for (const topic of topics) {
                        if (typeof topic !== 'string') return false;
                        const trimmed = topic.trim();
                        if (trimmed.length === 0 || trimmed.length > 50) return false;
                        const lower = trimmed.toLowerCase();
                        if (seen.has(lower)) return false;
                        seen.add(lower);
                    }
                    return true;
                },
                message: 'Topics must be an array of up to 20 unique non-empty strings (max 50 chars each)'
            }
        ]
    },

    testCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            }
        }
    ],

    editorial: {
        type: String
    }
}, {
    timestamps: true
});

// Unique index is defined on problemId field above
const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
