const graphql = require('graphql');

const { buildSchema } = graphql;

const schema = buildSchema(`
  type Student {
    id: Int,
    name: String
  },
  type Assignment {
    due: String,
    dueMs: Float,
    courseId: String,
    description: String,
    category: String,
    score: String,
    catWeight: Float,
    comment: String
  },
  type Grade {
    courseId: String,
    courseName: String,
    average: String
  },
  type Query {
    students: [Student],
    student(id: Int): Student,
    assignments(studentId: Int!, runId: Int): [Assignment],
    grade_average(studentId: Int!, runId: Int): [Grade]
  }
`);

module.exports = schema;
