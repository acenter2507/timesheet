'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Workdate = mongoose.model('Workdate'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  workdate;

/**
 * Workdate routes tests
 */
describe('Workdate CRUD tests', function () {

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

    // Save a user to the test db and create new Workdate
    user.save(function () {
      workdate = {
        name: 'Workdate name'
      };

      done();
    });
  });

  it('should be able to save a Workdate if logged in', function (done) {
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

        // Save a new Workdate
        agent.post('/api/workdates')
          .send(workdate)
          .expect(200)
          .end(function (workdateSaveErr, workdateSaveRes) {
            // Handle Workdate save error
            if (workdateSaveErr) {
              return done(workdateSaveErr);
            }

            // Get a list of Workdates
            agent.get('/api/workdates')
              .end(function (workdatesGetErr, workdatesGetRes) {
                // Handle Workdates save error
                if (workdatesGetErr) {
                  return done(workdatesGetErr);
                }

                // Get Workdates list
                var workdates = workdatesGetRes.body;

                // Set assertions
                (workdates[0].user._id).should.equal(userId);
                (workdates[0].name).should.match('Workdate name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Workdate if not logged in', function (done) {
    agent.post('/api/workdates')
      .send(workdate)
      .expect(403)
      .end(function (workdateSaveErr, workdateSaveRes) {
        // Call the assertion callback
        done(workdateSaveErr);
      });
  });

  it('should not be able to save an Workdate if no name is provided', function (done) {
    // Invalidate name field
    workdate.name = '';

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

        // Save a new Workdate
        agent.post('/api/workdates')
          .send(workdate)
          .expect(400)
          .end(function (workdateSaveErr, workdateSaveRes) {
            // Set message assertion
            (workdateSaveRes.body.message).should.match('Please fill Workdate name');

            // Handle Workdate save error
            done(workdateSaveErr);
          });
      });
  });

  it('should be able to update an Workdate if signed in', function (done) {
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

        // Save a new Workdate
        agent.post('/api/workdates')
          .send(workdate)
          .expect(200)
          .end(function (workdateSaveErr, workdateSaveRes) {
            // Handle Workdate save error
            if (workdateSaveErr) {
              return done(workdateSaveErr);
            }

            // Update Workdate name
            workdate.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Workdate
            agent.put('/api/workdates/' + workdateSaveRes.body._id)
              .send(workdate)
              .expect(200)
              .end(function (workdateUpdateErr, workdateUpdateRes) {
                // Handle Workdate update error
                if (workdateUpdateErr) {
                  return done(workdateUpdateErr);
                }

                // Set assertions
                (workdateUpdateRes.body._id).should.equal(workdateSaveRes.body._id);
                (workdateUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Workdates if not signed in', function (done) {
    // Create new Workdate model instance
    var workdateObj = new Workdate(workdate);

    // Save the workdate
    workdateObj.save(function () {
      // Request Workdates
      request(app).get('/api/workdates')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Workdate if not signed in', function (done) {
    // Create new Workdate model instance
    var workdateObj = new Workdate(workdate);

    // Save the Workdate
    workdateObj.save(function () {
      request(app).get('/api/workdates/' + workdateObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', workdate.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Workdate with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/workdates/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Workdate is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Workdate which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Workdate
    request(app).get('/api/workdates/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Workdate with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Workdate if signed in', function (done) {
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

        // Save a new Workdate
        agent.post('/api/workdates')
          .send(workdate)
          .expect(200)
          .end(function (workdateSaveErr, workdateSaveRes) {
            // Handle Workdate save error
            if (workdateSaveErr) {
              return done(workdateSaveErr);
            }

            // Delete an existing Workdate
            agent.delete('/api/workdates/' + workdateSaveRes.body._id)
              .send(workdate)
              .expect(200)
              .end(function (workdateDeleteErr, workdateDeleteRes) {
                // Handle workdate error error
                if (workdateDeleteErr) {
                  return done(workdateDeleteErr);
                }

                // Set assertions
                (workdateDeleteRes.body._id).should.equal(workdateSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Workdate if not signed in', function (done) {
    // Set Workdate user
    workdate.user = user;

    // Create new Workdate model instance
    var workdateObj = new Workdate(workdate);

    // Save the Workdate
    workdateObj.save(function () {
      // Try deleting Workdate
      request(app).delete('/api/workdates/' + workdateObj._id)
        .expect(403)
        .end(function (workdateDeleteErr, workdateDeleteRes) {
          // Set message assertion
          (workdateDeleteRes.body.message).should.match('User is not authorized');

          // Handle Workdate error error
          done(workdateDeleteErr);
        });

    });
  });

  it('should be able to get a single Workdate that has an orphaned user reference', function (done) {
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

          // Save a new Workdate
          agent.post('/api/workdates')
            .send(workdate)
            .expect(200)
            .end(function (workdateSaveErr, workdateSaveRes) {
              // Handle Workdate save error
              if (workdateSaveErr) {
                return done(workdateSaveErr);
              }

              // Set assertions on new Workdate
              (workdateSaveRes.body.name).should.equal(workdate.name);
              should.exist(workdateSaveRes.body.user);
              should.equal(workdateSaveRes.body.user._id, orphanId);

              // force the Workdate to have an orphaned user reference
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

                    // Get the Workdate
                    agent.get('/api/workdates/' + workdateSaveRes.body._id)
                      .expect(200)
                      .end(function (workdateInfoErr, workdateInfoRes) {
                        // Handle Workdate error
                        if (workdateInfoErr) {
                          return done(workdateInfoErr);
                        }

                        // Set assertions
                        (workdateInfoRes.body._id).should.equal(workdateSaveRes.body._id);
                        (workdateInfoRes.body.name).should.equal(workdate.name);
                        should.equal(workdateInfoRes.body.user, undefined);

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
      Workdate.remove().exec(done);
    });
  });
});
