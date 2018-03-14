'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Workmonth = mongoose.model('Workmonth'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  workmonth;

/**
 * Workmonth routes tests
 */
describe('Workmonth CRUD tests', function () {

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

    // Save a user to the test db and create new Workmonth
    user.save(function () {
      workmonth = {
        name: 'Workmonth name'
      };

      done();
    });
  });

  it('should be able to save a Workmonth if logged in', function (done) {
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

        // Save a new Workmonth
        agent.post('/api/workmonths')
          .send(workmonth)
          .expect(200)
          .end(function (workmonthSaveErr, workmonthSaveRes) {
            // Handle Workmonth save error
            if (workmonthSaveErr) {
              return done(workmonthSaveErr);
            }

            // Get a list of Workmonths
            agent.get('/api/workmonths')
              .end(function (workmonthsGetErr, workmonthsGetRes) {
                // Handle Workmonths save error
                if (workmonthsGetErr) {
                  return done(workmonthsGetErr);
                }

                // Get Workmonths list
                var workmonths = workmonthsGetRes.body;

                // Set assertions
                (workmonths[0].user._id).should.equal(userId);
                (workmonths[0].name).should.match('Workmonth name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Workmonth if not logged in', function (done) {
    agent.post('/api/workmonths')
      .send(workmonth)
      .expect(403)
      .end(function (workmonthSaveErr, workmonthSaveRes) {
        // Call the assertion callback
        done(workmonthSaveErr);
      });
  });

  it('should not be able to save an Workmonth if no name is provided', function (done) {
    // Invalidate name field
    workmonth.name = '';

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

        // Save a new Workmonth
        agent.post('/api/workmonths')
          .send(workmonth)
          .expect(400)
          .end(function (workmonthSaveErr, workmonthSaveRes) {
            // Set message assertion
            (workmonthSaveRes.body.message).should.match('Please fill Workmonth name');

            // Handle Workmonth save error
            done(workmonthSaveErr);
          });
      });
  });

  it('should be able to update an Workmonth if signed in', function (done) {
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

        // Save a new Workmonth
        agent.post('/api/workmonths')
          .send(workmonth)
          .expect(200)
          .end(function (workmonthSaveErr, workmonthSaveRes) {
            // Handle Workmonth save error
            if (workmonthSaveErr) {
              return done(workmonthSaveErr);
            }

            // Update Workmonth name
            workmonth.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Workmonth
            agent.put('/api/workmonths/' + workmonthSaveRes.body._id)
              .send(workmonth)
              .expect(200)
              .end(function (workmonthUpdateErr, workmonthUpdateRes) {
                // Handle Workmonth update error
                if (workmonthUpdateErr) {
                  return done(workmonthUpdateErr);
                }

                // Set assertions
                (workmonthUpdateRes.body._id).should.equal(workmonthSaveRes.body._id);
                (workmonthUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Workmonths if not signed in', function (done) {
    // Create new Workmonth model instance
    var workmonthObj = new Workmonth(workmonth);

    // Save the workmonth
    workmonthObj.save(function () {
      // Request Workmonths
      request(app).get('/api/workmonths')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Workmonth if not signed in', function (done) {
    // Create new Workmonth model instance
    var workmonthObj = new Workmonth(workmonth);

    // Save the Workmonth
    workmonthObj.save(function () {
      request(app).get('/api/workmonths/' + workmonthObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', workmonth.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Workmonth with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/workmonths/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Workmonth is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Workmonth which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Workmonth
    request(app).get('/api/workmonths/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Workmonth with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Workmonth if signed in', function (done) {
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

        // Save a new Workmonth
        agent.post('/api/workmonths')
          .send(workmonth)
          .expect(200)
          .end(function (workmonthSaveErr, workmonthSaveRes) {
            // Handle Workmonth save error
            if (workmonthSaveErr) {
              return done(workmonthSaveErr);
            }

            // Delete an existing Workmonth
            agent.delete('/api/workmonths/' + workmonthSaveRes.body._id)
              .send(workmonth)
              .expect(200)
              .end(function (workmonthDeleteErr, workmonthDeleteRes) {
                // Handle workmonth error error
                if (workmonthDeleteErr) {
                  return done(workmonthDeleteErr);
                }

                // Set assertions
                (workmonthDeleteRes.body._id).should.equal(workmonthSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Workmonth if not signed in', function (done) {
    // Set Workmonth user
    workmonth.user = user;

    // Create new Workmonth model instance
    var workmonthObj = new Workmonth(workmonth);

    // Save the Workmonth
    workmonthObj.save(function () {
      // Try deleting Workmonth
      request(app).delete('/api/workmonths/' + workmonthObj._id)
        .expect(403)
        .end(function (workmonthDeleteErr, workmonthDeleteRes) {
          // Set message assertion
          (workmonthDeleteRes.body.message).should.match('User is not authorized');

          // Handle Workmonth error error
          done(workmonthDeleteErr);
        });

    });
  });

  it('should be able to get a single Workmonth that has an orphaned user reference', function (done) {
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

          // Save a new Workmonth
          agent.post('/api/workmonths')
            .send(workmonth)
            .expect(200)
            .end(function (workmonthSaveErr, workmonthSaveRes) {
              // Handle Workmonth save error
              if (workmonthSaveErr) {
                return done(workmonthSaveErr);
              }

              // Set assertions on new Workmonth
              (workmonthSaveRes.body.name).should.equal(workmonth.name);
              should.exist(workmonthSaveRes.body.user);
              should.equal(workmonthSaveRes.body.user._id, orphanId);

              // force the Workmonth to have an orphaned user reference
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

                    // Get the Workmonth
                    agent.get('/api/workmonths/' + workmonthSaveRes.body._id)
                      .expect(200)
                      .end(function (workmonthInfoErr, workmonthInfoRes) {
                        // Handle Workmonth error
                        if (workmonthInfoErr) {
                          return done(workmonthInfoErr);
                        }

                        // Set assertions
                        (workmonthInfoRes.body._id).should.equal(workmonthSaveRes.body._id);
                        (workmonthInfoRes.body.name).should.equal(workmonth.name);
                        should.equal(workmonthInfoRes.body.user, undefined);

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
      Workmonth.remove().exec(done);
    });
  });
});
