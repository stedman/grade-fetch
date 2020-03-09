const student = require('./student');
const period = require('../models/period');

jest.mock('../data/student.json', () => require('../data/mock/student.json'));
jest.mock('../data/grades.json', () => require('../data/mock/grades.json'));

/**
 * Setup Jest mock request.
 */
const mockRequest = () => {
  const req = {};

  req.body = jest.fn().mockReturnValue(req);
  req.params = jest.fn().mockReturnValue(req);
  // req.query = jest.fn().mockReturnValue(req);
  req.query = {};

  return req;
};
/**
 * Setup Jest mock response.
 */
const mockResponse = () => {
  const res = {};

  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};
/**
 * Extract data from response properties--e.g., response.json
 *
 * @param {object} property The response property to parse.
 */
const getData = (property) => {
  return property.mock.calls[0][0];
};

const mockStudent = {
  id: 123456,
  name: 'Amber Lith',
  id_failFormat: 'abc123',
  id_failFind: 111111
};
const mockPeriodIndex = 3;

describe('/controllers/student.js', () => {
  describe('getAll()', () => {
    test('return all student records', async () => {
      const request = mockRequest();
      const response = mockResponse();

      await student.getAll(request, response);

      expect(response.status).toHaveBeenCalledTimes(1);
      expect(getData(response.status)).toEqual(200);
      expect(getData(response.json)).toMatchObject([
        {
          id: mockStudent.id,
          name: mockStudent.name,
          school: 'Big Middle School',
          studentUrl: 'http://localhost:3001/api/v1/students/123456'
        },
        {
          id: 234567,
          name: 'Ruby Lith',
          school: 'Big Elementary School',
          studentUrl: 'http://localhost:3001/api/v1/students/234567'
        }
      ]);
    });
  });

  describe('getStudent()', () => {
    test('return student info', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id;

      await student.getStudent(request, response);

      expect(getData(response.status)).toEqual(200);
      expect(getData(response.json)).toMatchObject({
        id: mockStudent.id,
        name: mockStudent.name,
        classworkUrl: 'http://localhost:3001/api/v1/students/123456/classwork',
        gradesUrl: 'http://localhost:3001/api/v1/students/123456/grades',
        gradesAverageUrl: 'http://localhost:3001/api/v1/students/123456/grades/average'
      });
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id_failFormat;

      await student.getStudent(request, response);

      // TODO: revisit unhappy paths and assign proper status codes: https://httpstatuses.com/
      expect(getData(response.status)).toEqual(400);
    });

    test('return empty object if no record for provided studentId', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id_failFind;

      await student.getStudent(request, response);

      expect(getData(response.status)).toEqual(200);
      expect(getData(response.json)).toMatchObject({});
    });
  });

  describe('getClasswork()', () => {
    test('return all student classwork', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id;
      request.query.all = true;

      await student.getClasswork(request, response);

      expect(getData(response.status)).toEqual(200);
      expect(getData(response.json)).toHaveProperty('studentId', mockStudent.id);
      expect(getData(response.json)).toHaveProperty('studentName', mockStudent.name);
      expect(getData(response.json)).toHaveProperty('interval');
      expect(getData(response.json)).toHaveProperty('interval.start');
      expect(getData(response.json)).toHaveProperty('interval.end');
      expect(getData(response.json)).toHaveProperty('course');
    });

    test('return classwork for specific Marking Period', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id;
      request.query.runId = mockPeriodIndex;

      await student.getClasswork(request, response);

      expect(getData(response.status)).toEqual(200);
      expect(getData(response.json)).toHaveProperty('studentId', mockStudent.id);
      expect(getData(response.json)).toHaveProperty('studentName', mockStudent.name);
      expect(getData(response.json)).toHaveProperty('interval');
      expect(getData(response.json)).toHaveProperty('interval.start');
      expect(getData(response.json)).toHaveProperty('interval.end');
      expect(getData(response.json)).toHaveProperty(
        'interval.gradingPeriod.current',
        mockPeriodIndex
      );
      expect(getData(response.json)).toHaveProperty('course');
    });

    test('return classwork for default Marking Period', async () => {
      jest.mock('../models/period');
      period.getGradingPeriodIndex = () => mockPeriodIndex;

      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id;

      await student.getClasswork(request, response);

      expect(getData(response.status)).toEqual(200);
      expect(getData(response.json)).toHaveProperty('studentId', mockStudent.id);
      expect(getData(response.json)).toHaveProperty('studentName', mockStudent.name);
      expect(getData(response.json)).toHaveProperty('interval');
      expect(getData(response.json)).toHaveProperty('interval.start');
      expect(getData(response.json)).toHaveProperty('interval.end');
      expect(getData(response.json)).toHaveProperty('course');
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id_failFormat;
      request.query.runId = mockPeriodIndex;

      await student.getClasswork(request, response);

      expect(getData(response.status)).toEqual(400);
    });

    test('return empty array if no record for provided studentId', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id_failFind;
      request.query.runId = mockPeriodIndex;

      await student.getClasswork(request, response);

      expect(getData(response.status)).toEqual(200);
    });
  });

  describe('getGrades()', () => {
    const expectedGradesResponse = {
      studentId: mockStudent.id,
      studentName: mockStudent.name,
      courseGrades: { '0123 - 1': {}, '4567 - 1': {} },
      gradesAverageUrl: 'http://localhost:3001/api/v1/students/123456/grades/average'
    };

    test('return student grades for default Marking Period', async () => {
      jest.mock('../models/period');
      period.getGradingPeriodIndex = () => mockPeriodIndex;

      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id;

      await student.getGrades(request, response);

      expect(getData(response.status)).toEqual(200);
      expect(getData(response.json)).toMatchObject(expectedGradesResponse);
    });

    test('return student grades for specific Marking Period', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id;
      request.query.runId = mockPeriodIndex;

      await student.getGrades(request, response);

      // Add the runId to the expected url.
      const expectedClone = { ...expectedGradesResponse };
      expectedClone.gradesAverageUrl += `?runId=${mockPeriodIndex}`;

      expect(getData(response.status)).toEqual(200);
      expect(getData(response.json)).toMatchObject(expectedClone);
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id_failFormat;
      request.query.runId = mockPeriodIndex;

      await student.getGrades(request, response);

      expect(getData(response.status)).toEqual(400);
    });

    test('return empty array if no record for provided studentId', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id_failFind;
      request.query.runId = mockPeriodIndex;

      await student.getGrades(request, response);

      expect(getData(response.status)).toEqual(200);
      expect(Object.keys(getData(response.json).courseGrades)).toHaveLength(0);
    });
  });

  describe('getGradeAverages()', () => {
    test('return average of student course grade averages for default time', async () => {
      // Mock the timeframe so test won't break in future.
      jest.mock('../models/period');
      const mockInterval = {
        start: 1572847200000,
        end: 1576735200000,
        gradingPeriod: { first: 1, prev: 2, current: 3, next: 4, last: 6 }
      };
      period.getGradingPeriodInterval = () => mockInterval;

      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id;

      await student.getGradeAverages(request, response);

      expect(getData(response.status)).toEqual(200);
      expect(getData(response.json)).toHaveProperty('studentId', mockStudent.id);
      expect(getData(response.json)).toHaveProperty('studentName', mockStudent.name);
      expect(getData(response.json)).toHaveProperty('grades');
      expect(getData(response.json).grades).toHaveLength(2);
    });

    test('return average of student course grade averages', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id;
      request.query.runId = mockPeriodIndex;

      await student.getGradeAverages(request, response);

      expect(getData(response.status)).toEqual(200);
      expect(getData(response.json)).toHaveProperty('studentId', mockStudent.id);
      expect(getData(response.json)).toHaveProperty('studentName', mockStudent.name);
      expect(getData(response.json).alerts).toBeUndefined();
      expect(getData(response.json)).toHaveProperty('grades');
      expect(getData(response.json).grades).toHaveLength(2);
    });

    test('return alerts when query param present', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id;
      request.query.all = '';
      request.query.alerts = '';

      await student.getGradeAverages(request, response);

      expect(getData(response.status)).toEqual(200);
      expect(getData(response.json)).toHaveProperty('studentId', mockStudent.id);
      expect(getData(response.json)).toHaveProperty('studentName', mockStudent.name);
      expect(getData(response.json)).toHaveProperty('alerts');
      expect(getData(response.json).alerts).toHaveLength(2);
      expect(getData(response.json)).toHaveProperty('grades');
      expect(getData(response.json).grades).toHaveLength(2);
    });

    test('return lower limit alerts when query param present', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id;
      request.query.runId = mockPeriodIndex;
      request.query.all = '';
      request.query.alertsScore = 90;

      await student.getGradeAverages(request, response);

      expect(getData(response.status)).toEqual(200);
      expect(getData(response.json)).toHaveProperty('studentId', mockStudent.id);
      expect(getData(response.json)).toHaveProperty('studentName', mockStudent.name);
      expect(getData(response.json)).toHaveProperty('alerts');
      expect(getData(response.json).alerts).toHaveLength(3);
      expect(getData(response.json).alerts[2].comment).toBe('[low score]');
      expect(getData(response.json)).toHaveProperty('grades');
      expect(getData(response.json).grades).toHaveLength(2);
    });

    test('return 400 error if invalid studentId format provided', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id_failFormat;
      request.query.runId = mockPeriodIndex;

      await student.getGradeAverages(request, response);

      expect(getData(response.status)).toEqual(400);
    });

    test('return undefined if no record for provided studentId', async () => {
      const request = mockRequest();
      const response = mockResponse();

      request.params.studentId = mockStudent.id_failFind;
      request.query.runId = mockPeriodIndex;

      await student.getGradeAverages(request, response);

      expect(getData(response.status)).toEqual(200);
      expect(getData(response.json)).toHaveProperty('studentId', mockStudent.id_failFind);
      expect(getData(response.json).studentName).toBeUndefined();
    });
  });
});
