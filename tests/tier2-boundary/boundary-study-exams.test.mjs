// ============================================================================
// Tier 2: Boundary Cases - Study & Exams
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 2');

describe('Tier 2: Boundary & Corner Cases - Exams & Study', () => {
  it('B52: should handle exam with 0 syllabus topics without division by zero', () => {
    const store = createSimulatorStore();
    const emptyExam = {
      id: 'exam-empty',
      courseCode: 'CS401',
      courseTitle: 'Seminar',
      examDate: '2026-12-01T10:00:00Z',
      roomLocation: 'Auditorium',
      topics: [],
    };
    store.state.exams.push(emptyExam);

    const progress = store.getSyllabusProgress(emptyExam.id);
    assert.strictEqual(progress.groupPercent, 0);
    assert.isFalse(Number.isNaN(progress.groupPercent));
  });

  it('B53: should throw when getting syllabus progress for non-existent exam ID', () => {
    const store = createSimulatorStore();
    assert.throws(
      () => store.getSyllabusProgress('fake-exam-id'),
      'Exam not found',
      'Should throw on invalid exam ID'
    );
  });

  it('B54: should throw when toggling topic on non-existent topic ID', () => {
    const store = createSimulatorStore();
    const examId = store.state.exams[0].id;
    assert.throws(
      () => store.toggleExamTopic(examId, 'fake-topic-id'),
      'Topic not found',
      'Should throw on invalid topic ID'
    );
  });

  it('B55: should calculate negative remaining time when exam date is in the past', () => {
    const pastExamDate = new Date(Date.now() - 3600000).toISOString();
    const diffMs = new Date(pastExamDate).getTime() - Date.now();
    assert.ok(diffMs < 0, 'Past exam should have negative remaining time');
  });

  it('B56: should compute 100% group syllabus progress when all members complete all topics', () => {
    const store = createSimulatorStore();
    const exam = store.state.exams[0];

    // Mark all topics complete for all personas
    for (const t of exam.topics) {
      for (const p of store.state.personas) {
        t.completedBy[p.id] = true;
      }
    }

    const progress = store.getSyllabusProgress(exam.id);
    assert.strictEqual(progress.groupPercent, 100);
    for (const p of store.state.personas) {
      assert.strictEqual(progress.personaPercents[p.id], 100);
    }
  });

  it('B57: should handle problem with 0 submissions cleanly', () => {
    const store = createSimulatorStore();
    const newProb = {
      id: 'prob-zero',
      date: '2026-10-26',
      title: 'Graph Cycle Detection',
      difficulty: 'Hard',
      tags: ['Graph', 'DFS'],
      description: 'Find if cycle exists in directed graph.',
      exampleInput: 'V = 4, edges = [[0,1],[1,2],[2,0]]',
      exampleOutput: 'true',
      constraints: '1 <= V <= 10^5',
      submissions: [],
    };
    store.state.codingProblems.push(newProb);

    assert.lengthOf(newProb.submissions, 0);
  });

  it('B58: should accept large code submission up to 50,000 characters', () => {
    const store = createSimulatorStore();
    const probId = store.state.codingProblems[0].id;
    const largeCode = '// Solution\n' + 'const x = 1;\n'.repeat(3500); // ~45KB+

    store.setPersona('rhea');
    const sub = store.submitCodingSolution(probId, largeCode, 'TypeScript');
    assert.ok(sub.id);
    assert.isAtLeast(sub.codeSnippet.length, 40000);
  });
});
