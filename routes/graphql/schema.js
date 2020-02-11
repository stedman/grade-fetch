const graphql = require('graphql');

const { buildSchema } = graphql;

const schema = buildSchema(`
  type Student {
    id: Int,
    name: String
  },
  type Classwork {
    due: String,
    dueMs: Float,
    assigned: String,
    courseId: String,
    courseName: String,
    assignment: String,
    category: String,
    score: Float,
    catWeight: Float,
    comment: String
  },
  type Grade {
    courseId: String,
    courseName: String,
    average: Float
  },
  type Query {
    students: [Student],
    student(id: Int): Student,
    classwork(studentId: Int!, mp: Int): [Classwork],
    gradeAverage(studentId: Int!, mp: Int): [Grade]
  }
`);

module.exports = schema;
