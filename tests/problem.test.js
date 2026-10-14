import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import connectDb from '../src/config/db.config.js';
import { Problem, Counter } from '../src/models/index.js';
import ProblemRepository from '../src/repositories/problem.repository.js';
import ProblemService from '../src/services/problem.service.js';
import { BadRequestError, ConflictError, NotFoundError } from '../src/errors/index.js';

describe('Problem Topics & Public Problem ID Feature Tests', () => {
    let repository;
    let service;
    const createdIds = [];

    before(async () => {
        await connectDb();
        repository = new ProblemRepository();
        service = new ProblemService(repository);
    });

    after(async () => {
        // Clean up test documents created during testing
        if (createdIds.length > 0) {
            await Problem.deleteMany({ _id: { $in: createdIds } });
        }
        await mongoose.connection.close();
        process.exit(0);
    });

    describe('Feature 1: Topics Validation & Management', () => {
        test('Default to empty array if topics omitted', async () => {
            const problem = await service.createProblem({
                title: 'Test Problem No Topics ' + Date.now(),
                description: 'A test description',
                difficulty: 'easy'
            });
            createdIds.push(problem._id);

            assert.ok(Array.isArray(problem.topics));
            assert.equal(problem.topics.length, 0);
        });

        test('Accept valid topic array and normalize whitespace', async () => {
            const problem = await service.createProblem({
                title: 'Test Problem Normalized Topics ' + Date.now(),
                description: 'A test description',
                difficulty: 'medium',
                topics: ['  Array  ', ' Dynamic Programming ', 'Greedy']
            });
            createdIds.push(problem._id);

            assert.deepEqual(problem.topics, ['Array', 'Dynamic Programming', 'Greedy']);
        });

        test('Deduplicate case-insensitive topics preserving original casing of first occurrence', async () => {
            const problem = await service.createProblem({
                title: 'Test Problem Duplicate Topics ' + Date.now(),
                description: 'A test description',
                difficulty: 'easy',
                topics: ['Array', 'array', 'ARRAY', 'Hash Map']
            });
            createdIds.push(problem._id);

            assert.deepEqual(problem.topics, ['Array', 'Hash Map']);
        });

        test('Reject non-array topics', async () => {
            await assert.rejects(
                async () => {
                    await service.createProblem({
                        title: 'Test Invalid Topics String ' + Date.now(),
                        description: 'Desc',
                        difficulty: 'easy',
                        topics: 'Array, Hash Map'
                    });
                },
                (err) => err instanceof BadRequestError
            );
        });

        test('Reject empty string in topics', async () => {
            await assert.rejects(
                async () => {
                    await service.createProblem({
                        title: 'Test Empty Topic ' + Date.now(),
                        description: 'Desc',
                        difficulty: 'easy',
                        topics: ['Array', '   ']
                    });
                },
                (err) => err instanceof BadRequestError
            );
        });

        test('Update topics: replace topics, clear with empty array, or preserve if omitted', async () => {
            const problem = await service.createProblem({
                title: 'Test Update Topics ' + Date.now(),
                description: 'Initial description',
                difficulty: 'easy',
                topics: ['Tree', 'Binary Search']
            });
            createdIds.push(problem._id);

            // 1. Update topics with new list
            const updated1 = await service.updateProblem(problem.problemId, {
                topics: ['Graph', 'DFS']
            });
            assert.deepEqual(updated1.topics, ['Graph', 'DFS']);

            // 2. Update other field without topics - topics should be preserved
            const updated2 = await service.updateProblem(problem.problemId, {
                description: 'Updated description without touching topics'
            });
            assert.deepEqual(updated2.topics, ['Graph', 'DFS']);

            // 3. Update with empty array - should intentionally clear topics
            const updated3 = await service.updateProblem(problem.problemId, {
                topics: []
            });
            assert.deepEqual(updated3.topics, []);
        });
    });

    describe('Feature 2: Unique Public Problem IDs (problemId)', () => {
        test('Automatically assign ABH-xxxx format problemId', async () => {
            const problem = await service.createProblem({
                title: 'Test Problem Auto ID ' + Date.now(),
                description: 'Testing automatic public ID generation',
                difficulty: 'hard',
                topics: ['Math']
            });
            createdIds.push(problem._id);

            assert.match(problem.problemId, /^ABH-\d{4,}$/);
        });

        test('Ignore client-provided problemId to prevent client spoofing', async () => {
            const problem = await service.createProblem({
                title: 'Test Problem Client Spoofed ID ' + Date.now(),
                description: 'Client tries to pass custom problemId',
                difficulty: 'easy',
                problemId: 'ABH-9999'
            });
            createdIds.push(problem._id);

            assert.notEqual(problem.problemId, 'ABH-9999');
            assert.match(problem.problemId, /^ABH-\d{4,}$/);
        });

        test('problemId remains stable after updates', async () => {
            const problem = await service.createProblem({
                title: 'Test Stable ID ' + Date.now(),
                description: 'Testing ID stability',
                difficulty: 'easy'
            });
            createdIds.push(problem._id);

            const initialId = problem.problemId;
            const updated = await service.updateProblem(initialId, {
                title: 'Test Stable ID Renamed ' + Date.now(),
                difficulty: 'hard'
            });

            assert.equal(updated.problemId, initialId);
        });

        test('Lookup by public problemId (e.g. ABH-0001)', async () => {
            const fetched = await service.getProblem('ABH-0001');
            assert.ok(fetched);
            assert.equal(fetched.problemId, 'ABH-0001');
            assert.equal(fetched.title, 'Two Sum');
        });

        test('Lookup by MongoDB ObjectId', async () => {
            const existing = await repository.getProblemByProblemId('ABH-0001');
            const fetched = await service.getProblem(existing._id.toString());
            assert.ok(fetched);
            assert.equal(fetched.problemId, 'ABH-0001');
        });

        test('Lookup non-existent public ID returns 404 NotFoundError', async () => {
            await assert.rejects(
                async () => {
                    await service.getProblem('ABH-999999');
                },
                (err) => err instanceof NotFoundError
            );
        });

        test('Lookup malformed ID returns 404 NotFoundError without throwing unhandled database error', async () => {
            await assert.rejects(
                async () => {
                    await service.getProblem('invalid-random-id-1234');
                },
                (err) => err instanceof NotFoundError
            );
        });

        test('Search by exact public problemId', async () => {
            const results = await service.getAllProblems('ABH-0001');
            assert.ok(results.length >= 1);
            assert.equal(results[0].problemId, 'ABH-0001');
        });

        test('Search by title substring (case-insensitive)', async () => {
            const results = await service.getAllProblems('two');
            assert.ok(results.length >= 1);
            assert.ok(results.some((p) => p.title.toLowerCase().includes('two')));
        });

        test('Concurrent creation generates unique, non-colliding problem IDs', async () => {
            const count = 5;
            const promises = [];
            const timestamp = Date.now();

            for (let i = 0; i < count; i++) {
                promises.push(
                    service.createProblem({
                        title: `Concurrent Problem ${timestamp}_${i}`,
                        description: `Concurrent problem description ${i}`,
                        difficulty: 'medium',
                        topics: ['Concurrency']
                    })
                );
            }

            const createdProblems = await Promise.all(promises);
            createdProblems.forEach((p) => createdIds.push(p._id));

            const ids = createdProblems.map((p) => p.problemId);
            const uniqueIds = new Set(ids);

            // All IDs must be unique
            assert.equal(uniqueIds.size, count);
            ids.forEach((id) => assert.match(id, /^ABH-\d{4,}$/));
        });
    });
});
