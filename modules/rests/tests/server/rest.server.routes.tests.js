'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Rest = mongoose.model('Rest'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  rest;

/**
 * Rest routes tests
 */
describe('Rest CRUD tests', function () {

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

    // Save a user to the test db and create new Rest
    user.save(function () {
      rest = {
        name: 'Rest name'
      };

      done();
    });
  });

  it('should be able to save a Rest if logged in', function (done) {
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

        // Save a new Rest
        agent.post('/api/rests')
          .send(rest)
          .expect(200)
          .end(function (restSaveErr, restSaveRes) {
            // Handle Rest save error
            if (restSaveErr) {
              return done(restSaveErr);
            }

            // Get a list of Rests
            agent.get('/api/rests')
              .end(function (restsGetErr, restsGetRes) {
                // Handle Rests save error
                if (restsGetErr) {
                  return done(restsGetErr);
                }

                // Get Rests list
                var rests = restsGetRes.body;

                // Set assertions
                (rests[0].user._id).should.equal(userId);
                (rests[0].name).should.match('Rest name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Rest if not logged in', function (done) {
    agent.post('/api/rests')
      .send(rest)
      .expect(403)
      .end(function (restSaveErr, restSaveRes) {
        // Call the assertion callback
        done(restSaveErr);
      });
  });

  it('should not be able to save an Rest if no name is provided', function (done) {
    // Invalidate name field
    rest.name = '';

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

        // Save a new Rest
        agent.post('/api/rests')
          .send(rest)
          .expect(400)
          .end(function (restSaveErr, restSaveRes) {
            // Set message assertion
            (restSaveRes.body.message).should.match('Please fill Rest name');

            // Handle Rest save error
            done(restSaveErr);
          });
      });
  });

  it('should be able to update an Rest if signed in', function (done) {
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

        // Save a new Rest
        agent.post('/api/rests')
          .send(rest)
          .expect(200)
          .end(function (restSaveErr, restSaveRes) {
            // Handle Rest save error
            if (restSaveErr) {
              return done(restSaveErr);
            }

            // Update Rest name
            rest.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Rest
            agent.put('/api/rests/' + restSaveRes.body._id)
              .send(rest)
              .expect(200)
              .end(function (restUpdateErr, restUpdateRes) {
                // Handle Rest update error
                if (restUpdateErr) {
                  return done(restUpdateErr);
                }

                // Set assertions
                (restUpdateRes.body._id).should.equal(restSaveRes.body._id);
                (restUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Rests if not signed in', function (done) {
    // Create new Rest model instance
    var restObj = new Rest(rest);

    // Save the rest
    restObj.save(function () {
      // Request Rests
      request(app).get('/api/rests')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Rest if not signed in', function (done) {
    // Create new Rest model instance
    var restObj = new Rest(rest);

    // Save the Rest
    restObj.save(function () {
      request(app).get('/api/rests/' + restObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', rest.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Rest with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/rests/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Rest is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Rest which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Rest
    request(app).get('/api/rests/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Rest with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Rest if signed in', function (done) {
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

        // Save a new Rest
        agent.post('/api/rests')
          .send(rest)
          .expect(200)
          .end(function (restSaveErr, restSaveRes) {
            // Handle Rest save error
            if (restSaveErr) {
              return done(restSaveErr);
            }

            // Delete an existing Rest
            agent.delete('/api/rests/' + restSaveRes.body._id)
              .send(rest)
              .expect(200)
              .end(function (restDeleteErr, restDeleteRes) {
                // Handle rest error error
                if (restDeleteErr) {
                  return done(restDeleteErr);
                }

                // Set assertions
                (restDeleteRes.body._id).should.equal(restSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Rest if not signed in', function (done) {
    // Set Rest user
    rest.user = user;

    // Create new Rest model instance
    var restObj = new Rest(rest);

    // Save the Rest
    restObj.save(function () {
      // Try deleting Rest
      request(app).delete('/api/rests/' + restObj._id)
        .expect(403)
        .end(function (restDeleteErr, restDeleteRes) {
          // Set message assertion
          (restDeleteRes.body.message).should.match('User is not authorized');

          // Handle Rest error error
          done(restDeleteErr);
        });

    });
  });

  it('should be able to get a single Rest that has an orphaned user reference', function (done) {
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

          // Save a new Rest
          agent.post('/api/rests')
            .send(rest)
            .expect(200)
            .end(function (restSaveErr, restSaveRes) {
              // Handle Rest save error
              if (restSaveErr) {
                return done(restSaveErr);
              }

              // Set assertions on new Rest
              (restSaveRes.body.name).should.equal(rest.name);
              should.exist(restSaveRes.body.user);
              should.equal(restSaveRes.body.user._id, orphanId);

              // force the Rest to have an orphaned user reference
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

                    // Get the Rest
                    agent.get('/api/rests/' + restSaveRes.body._id)
                      .expect(200)
                      .end(function (restInfoErr, restInfoRes) {
                        // Handle Rest error
                        if (restInfoErr) {
                          return done(restInfoErr);
                        }

                        // Set assertions
                        (restInfoRes.body._id).should.equal(restSaveRes.body._id);
                        (restInfoRes.body.name).should.equal(rest.name);
                        should.equal(restInfoRes.body.user, undefined);

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
      Rest.remove().exec(done);
    });
  });
});
