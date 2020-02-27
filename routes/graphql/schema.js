const graphql = require('graphql');

const { buildSchema } = graphql;

const schema = buildSchema(`
  type Student {
    id: Int,
    name: String
  },

  type Assignment {
    dateDue: String,
    dateDueMs: Float,
    dateAssigned: String,
    assignment: String,
    category: String,
    score: Float,
    weightedScore: String,
    weightedTotalPoints: Float,
    comment: String
  },

  type Classwork {
    courseId: String,
    courseName: String,
    assignments: [Assignment]
  },

  type Grade {
    courseId: String,
    courseName: String,
    average: Float
  },

  type Interval {
    start: Float,
    end: Float,
    gradingPeriod: GradingPeriod
  },

  type GradingPeriod {
    first: Int,
    prev: Int,
    current: Int,
    next: Int,
    last: Int
  },

  type Query {
    students: [Student],
    student(id: Int): Student,
    classwork(studentId: Int!, runId: Int, runDate: String, all: Boolean): [Classwork],
    gradeAverage(studentId: Int!, runId: Int, runDate: String, all: Boolean): [Grade]
  }
`);

module.exports = schema;
