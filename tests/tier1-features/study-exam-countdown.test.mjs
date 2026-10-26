// ============================================================================
// Tier 1: Study & Growth - Exam Countdown & Syllabus Revision Tracker
// ============================================================================

import { describe, it, assert, setTestTier } from '../test-framework.mjs';
import { createSimulatorStore } from '../fixtures/reference-engine.mjs';

setTestTier('Tier 1');

describe('Tier 1: Study & Growth - Exam Countdown & Revision', () => {
  it('should maintain course code, location, and syllabus topics per exam', () => {
    const store = createSimulatorStore();
    const exam = store.state.exams[0];

    assert.strictEqual(exam.courseCode, 'CS301');
    assert.strictEqual(exam.courseTitle, 'Operating Systems & Concurrency');
    assert.ok(exam.topics.length >= 3);
    assert.ok(exam.roomLocation.includes('LH-102'));
  });

  it('should toggle roommate completion status on individual syllabus topics', () => {
    const store = createSimulatorStore();
    const exam = store.state.exams[0];
    const topic = exam.topics[0];

    assert.isFalse(topic.completedBy.dev); // initially false in seed
    store.setPersona('dev');
    store.toggleExamTopic(exam.id, topic.id);

    assert.isTrue(topic.completedBy.dev);

    // Toggle off
    store.toggleExamTopic(exam.id, topic.id);
    assert.isFalse(topic.completedBy.dev);
  });

  it('should calculate group overall syllabus completion percentage', () => {
    const store = createSimulatorStore();
    const exam = store.state.exams[0];
    const progress = store.getSyllabusProgress(exam.id);

    assert.ok(progress.groupPercent >= 0 && progress.groupPercent <= 100);
    assert.ok(typeof progress.groupPercent === 'number');
  });

  it('should calculate individual revision progress percentages per persona', () => {
    const store = createSimulatorStore();
    const exam = store.state.exams[0];
    const progress = store.getSyllabusProgress(exam.id);

    // In seed: Rhea has completed all 3 topics (100%)
    assert.strictEqual(progress.personaPercents.rhea, 100);
    // Dev has completed 0 topics (0%)
    assert.strictEqual(progress.personaPercents.dev, 0);
    // Aman has completed 2 topics (67%)
    assert.strictEqual(progress.personaPercents.aman, 67);
  });

  it('should calculate future exam countdown difference in milliseconds', () => {
    const store = createSimulatorStore();
    const exam = store.state.exams[0];
    const examDateMs = new Date(exam.examDate).getTime();
    const nowMs = Date.now();

    assert.ok(examDateMs > nowMs, 'Exam date should be in the future');
    const daysRemaining = (examDateMs - nowMs) / (1000 * 60 * 60 * 24);
    assert.isAtLeast(daysRemaining, 1);
  });
});
