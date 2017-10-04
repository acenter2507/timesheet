'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Department = mongoose.model('Department'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  department;

/**
 * Department routes tests
 */
describe('Department CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Department
    user.save(function () {
      department = {
        name: 'Department name'
      };

      done();
    });
  });

  it('should be able to save a Department if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Department
        agent.post('/api/departments')
          .send(department)
          .expect(200)
          .end(function (departmentSaveErr, departmentSaveRes) {
            // Handle Department save error
            if (departmentSaveErr) {
              return done(departmentSaveErr);
            }

            // Get a list of Departments
            agent.get('/api/departments')
              .end(function (departmentsGetErr, departmentsGetRes) {
                // Handle Departments save error
                if (departmentsGetErr) {
                  return done(departmentsGetErr);
                }

                // Get Departments list
                var departments = departmentsGetRes.body;

                // Set assertions
                (departments[0].user._id).should.equal(userId);
                (departments[0].name).should.match('Department name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Department if not logged in', function (done) {
    agent.post('/api/departments')
      .send(department)
      .expect(403)
      .end(function (departmentSaveErr, departmentSaveRes) {
        // Call the assertion callback
        done(departmentSaveErr);
      });
  });

  it('should not be able to save an Department if no name is provided', function (done) {
    // Invalidate name field
    department.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Department
        agent.post('/api/departments')
          .send(department)
          .expect(400)
          .end(function (departmentSaveErr, departmentSaveRes) {
            // Set message assertion
            (departmentSaveRes.body.message).should.match('Please fill Department name');

            // Handle Department save error
            done(departmentSaveErr);
          });
      });
  });

  it('should be able to update an Department if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Department
        agent.post('/api/departments')
          .send(department)
          .expect(200)
          .end(function (departmentSaveErr, departmentSaveRes) {
            // Handle Department save error
            if (departmentSaveErr) {
              return done(departmentSaveErr);
            }

            // Update Department name
            department.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Department
            agent.put('/api/departments/' + departmentSaveRes.body._id)
              .send(department)
              .expect(200)
              .end(function (departmentUpdateErr, departmentUpdateRes) {
                // Handle Department update error
                if (departmentUpdateErr) {
                  return done(departmentUpdateErr);
                }

                // Set assertions
                (departmentUpdateRes.body._id).should.equal(departmentSaveRes.body._id);
                (departmentUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Departments if not signed in', function (done) {
    // Create new Department model instance
    var departmentObj = new Department(department);

    // Save the department
    departmentObj.save(function () {
      // Request Departments
      request(app).get('/api/departments')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Department if not signed in', function (done) {
    // Create new Department model instance
    var departmentObj = new Department(department);

    // Save the Department
    departmentObj.save(function () {
      request(app).get('/api/departments/' + departmentObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', department.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Department with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/departments/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Department is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Department which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Department
    request(app).get('/api/departments/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Department with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Department if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Department
        agent.post('/api/departments')
          .send(department)
          .expect(200)
          .end(function (departmentSaveErr, departmentSaveRes) {
            // Handle Department save error
            if (departmentSaveErr) {
              return done(departmentSaveErr);
            }

            // Delete an existing Department
            agent.delete('/api/departments/' + departmentSaveRes.body._id)
              .send(department)
              .expect(200)
              .end(function (departmentDeleteErr, departmentDeleteRes) {
                // Handle department error error
                if (departmentDeleteErr) {
                  return done(departmentDeleteErr);
                }

                // Set assertions
                (departmentDeleteRes.body._id).should.equal(departmentSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Department if not signed in', function (done) {
    // Set Department user
    department.user = user;

    // Create new Department model instance
    var departmentObj = new Department(department);

    // Save the Department
    departmentObj.save(function () {
      // Try deleting Department
      request(app).delete('/api/departments/' + departmentObj._id)
        .expect(403)
        .end(function (departmentDeleteErr, departmentDeleteRes) {
          // Set message assertion
          (departmentDeleteRes.body.message).should.match('User is not authorized');

          // Handle Department error error
          done(departmentDeleteErr);
        });

    });
  });

  it('should be able to get a single Department that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Department
          agent.post('/api/departments')
            .send(department)
            .expect(200)
            .end(function (departmentSaveErr, departmentSaveRes) {
              // Handle Department save error
              if (departmentSaveErr) {
                return done(departmentSaveErr);
              }

              // Set assertions on new Department
              (departmentSaveRes.body.name).should.equal(department.name);
              should.exist(departmentSaveRes.body.user);
              should.equal(departmentSaveRes.body.user._id, orphanId);

              // force the Department to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Department
                    agent.get('/api/departments/' + departmentSaveRes.body._id)
                      .expect(200)
                      .end(function (departmentInfoErr, departmentInfoRes) {
                        // Handle Department error
                        if (departmentInfoErr) {
                          return done(departmentInfoErr);
                        }

                        // Set assertions
                        (departmentInfoRes.body._id).should.equal(departmentSaveRes.body._id);
                        (departmentInfoRes.body.name).should.equal(department.name);
                        should.equal(departmentInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Department.remove().exec(done);
    });
  });
});
