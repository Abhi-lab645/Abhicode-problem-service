import mongoose from "mongoose";
import connectDb from "../src/config/db.config.js";
import { Problem, Counter } from "../src/models/index.js";
import { formatProblemId } from "../src/utils/index.js";

// Evidence-based topics for standard known seed problems
const KNOWN_PROBLEM_TOPICS = {
    'Two Sum': ['Array', 'Hash Map'],
    'Palindrome Number Checker': ['Math', 'Numbers'],
    'Longest Substring Without Repeating Characters': ['Sliding Window', 'String', 'Hash Set'],
    'Merge k Sorted Lists': ['Linked List', 'Heap', 'Divide and Conquer'],
    'Valid Parentheses': ['Stack', 'String']
};

/**
 * Migration Script: Problem Topics & Unique Public Problem IDs
 *
 * Backfills permanent public IDs (ABH-0001, ABH-0002, etc.) and topics
 * for legacy problem records. Idempotent and safe to run multiple times.
 */
async function runMigration() {
    console.log("=================================================");
    console.log("🚀 Starting Migration: Problem Metadata Backfill");
    console.log("=================================================");

    try {
        await connectDb();
        console.log("✅ Database Connected Successfully\n");

        // 1. Fetch all problems sorted predictably by creation order / _id
        const allProblems = await Problem.find({}).sort({ createdAt: 1, _id: 1 });
        console.log(`📊 Total problem documents in database: ${allProblems.length}`);

        // 2. Identify highest existing problemId sequence if any
        let maxExistingSeq = 0;
        const problemIdRegex = /^ABH-(\d+)$/i;

        for (const problem of allProblems) {
            if (problem.problemId) {
                const match = problem.problemId.match(problemIdRegex);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxExistingSeq) {
                        maxExistingSeq = num;
                    }
                }
            }
        }

        // 3. Reconcile Counter document
        let counterDoc = await Counter.findById('problemId');
        if (!counterDoc) {
            counterDoc = await Counter.create({ _id: 'problemId', seq: maxExistingSeq });
            console.log(`🔢 Initialized problemId counter with sequence: ${maxExistingSeq}`);
        } else if (counterDoc.seq < maxExistingSeq) {
            counterDoc.seq = maxExistingSeq;
            await counterDoc.save();
            console.log(`🔢 Reconciled problemId counter to maximum existing sequence: ${maxExistingSeq}`);
        } else {
            console.log(`🔢 Current problemId counter sequence: ${counterDoc.seq}`);
        }

        // 4. Backfill missing problemIds and topics
        let updatedCount = 0;
        let alreadyValidCount = 0;

        for (const problem of allProblems) {
            const updates = {};
            let isModified = false;

            // Backfill problemId if missing
            if (!problem.problemId) {
                const newSeq = await Counter.getNextSequence('problemId');
                updates.problemId = formatProblemId(newSeq);
                isModified = true;
            }

            // Backfill topics if missing or not an array
            if (!Array.isArray(problem.topics) || problem.topics.length === 0) {
                // If evidence exists for this problem title, assign topics; else empty array
                const evidenceTopics = KNOWN_PROBLEM_TOPICS[problem.title] || [];
                if (evidenceTopics.length > 0 || !Array.isArray(problem.topics)) {
                    updates.topics = evidenceTopics;
                    isModified = true;
                }
            }

            if (isModified) {
                await Problem.updateOne({ _id: problem._id }, { $set: updates });
                const assignedId = updates.problemId || problem.problemId;
                const assignedTopics = updates.topics || problem.topics || [];
                console.log(`  ✓ Updated "${problem.title}" -> ID: ${assignedId}, Topics: [${assignedTopics.join(', ')}]`);
                updatedCount++;
            } else {
                alreadyValidCount++;
            }
        }

        // 5. Create or verify unique index on problemId
        console.log("\n🔒 Ensuring unique index on problemId field...");
        await Problem.collection.createIndex({ problemId: 1 }, { unique: true });
        console.log("✅ Unique index on problemId verified");

        // 6. Summary Report
        console.log("\n=================================================");
        console.log("🎉 Migration Completed Successfully");
        console.log("=================================================");
        console.log(`Total Problems Scanned : ${allProblems.length}`);
        console.log(`Documents Updated       : ${updatedCount}`);
        console.log(`Already Up to Date      : ${alreadyValidCount}`);
        const finalCounter = await Counter.findById('problemId');
        console.log(`Final Counter Sequence  : ${finalCounter?.seq || 0}`);
        console.log("=================================================\n");

    } catch (error) {
        console.error("❌ Migration failed with error:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Database connection closed");
    }
}

runMigration();
