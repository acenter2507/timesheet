'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Workrest = mongoose.model('Workrest'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  workrest;

/**
 * Workrest routes tests
 */
describe('Workrest CRUD tests', function () {

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

    // Save a user to the test db and create new Workrest
    user.save(function () {
      workrest = {
        name: 'Workrest name'
      };

      done();
    });
  });

  it('should be able to save a Workrest if logged in', function (done) {
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

        // Save a new Workrest
        agent.post('/api/workrests')
          .send(workrest)
          .expect(200)
          .end(function (workrestSaveErr, workrestSaveRes) {
            // Handle Workrest save error
            if (workrestSaveErr) {
              return done(workrestSaveErr);
            }

            // Get a list of Workrests
            agent.get('/api/workrests')
              .end(function (workrestsGetErr, workrestsGetRes) {
                // Handle Workrests save error
                if (workrestsGetErr) {
                  return done(workrestsGetErr);
                }

                // Get Workrests list
                var workrests = workrestsGetRes.body;

                // Set assertions
                (workrests[0].user._id).should.equal(userId);
                (workrests[0].name).should.match('Workrest name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Workrest if not logged in', function (done) {
    agent.post('/api/workrests')
      .send(workrest)
      .expect(403)
      .end(function (workrestSaveErr, workrestSaveRes) {
        // Call the assertion callback
        done(workrestSaveErr);
      });
  });

  it('should not be able to save an Workrest if no name is provided', function (done) {
    // Invalidate name field
    workrest.name = '';

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

        // Save a new Workrest
        agent.post('/api/workrests')
          .send(workrest)
          .expect(400)
          .end(function (workrestSaveErr, workrestSaveRes) {
            // Set message assertion
            (workrestSaveRes.body.message).should.match('Please fill Workrest name');

            // Handle Workrest save error
            done(workrestSaveErr);
          });
      });
  });

  it('should be able to update an Workrest if signed in', function (done) {
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

        // Save a new Workrest
        agent.post('/api/workrests')
          .send(workrest)
          .expect(200)
          .end(function (workrestSaveErr, workrestSaveRes) {
            // Handle Workrest save error
            if (workrestSaveErr) {
              return done(workrestSaveErr);
            }

            // Update Workrest name
            workrest.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Workrest
            agent.put('/api/workrests/' + workrestSaveRes.body._id)
              .send(workrest)
              .expect(200)
              .end(function (workrestUpdateErr, workrestUpdateRes) {
                // Handle Workrest update error
                if (workrestUpdateErr) {
                  return done(workrestUpdateErr);
                }

                // Set assertions
                (workrestUpdateRes.body._id).should.equal(workrestSaveRes.body._id);
                (workrestUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Workrests if not signed in', function (done) {
    // Create new Workrest model instance
    var workrestObj = new Workrest(workrest);

    // Save the workrest
    workrestObj.save(function () {
      // Request Workrests
      request(app).get('/api/workrests')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Workrest if not signed in', function (done) {
    // Create new Workrest model instance
    var workrestObj = new Workrest(workrest);

    // Save the Workrest
    workrestObj.save(function () {
      request(app).get('/api/workrests/' + workrestObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', workrest.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Workrest with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/workrests/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Workrest is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Workrest which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Workrest
    request(app).get('/api/workrests/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Workrest with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Workrest if signed in', function (done) {
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

        // Save a new Workrest
        agent.post('/api/workrests')
          .send(workrest)
          .expect(200)
          .end(function (workrestSaveErr, workrestSaveRes) {
            // Handle Workrest save error
            if (workrestSaveErr) {
              return done(workrestSaveErr);
            }

            // Delete an existing Workrest
            agent.delete('/api/workrests/' + workrestSaveRes.body._id)
              .send(workrest)
              .expect(200)
              .end(function (workrestDeleteErr, workrestDeleteRes) {
                // Handle workrest error error
                if (workrestDeleteErr) {
                  return done(workrestDeleteErr);
                }

                // Set assertions
                (workrestDeleteRes.body._id).should.equal(workrestSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Workrest if not signed in', function (done) {
    // Set Workrest user
    workrest.user = user;

    // Create new Workrest model instance
    var workrestObj = new Workrest(workrest);

    // Save the Workrest
    workrestObj.save(function () {
      // Try deleting Workrest
      request(app).delete('/api/workrests/' + workrestObj._id)
        .expect(403)
        .end(function (workrestDeleteErr, workrestDeleteRes) {
          // Set message assertion
          (workrestDeleteRes.body.message).should.match('User is not authorized');

          // Handle Workrest error error
          done(workrestDeleteErr);
        });

    });
  });

  it('should be able to get a single Workrest that has an orphaned user reference', function (done) {
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

          // Save a new Workrest
          agent.post('/api/workrests')
            .send(workrest)
            .expect(200)
            .end(function (workrestSaveErr, workrestSaveRes) {
              // Handle Workrest save error
              if (workrestSaveErr) {
                return done(workrestSaveErr);
              }

              // Set assertions on new Workrest
              (workrestSaveRes.body.name).should.equal(workrest.name);
              should.exist(workrestSaveRes.body.user);
              should.equal(workrestSaveRes.body.user._id, orphanId);

              // force the Workrest to have an orphaned user reference
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

                    // Get the Workrest
                    agent.get('/api/workrests/' + workrestSaveRes.body._id)
                      .expect(200)
                      .end(function (workrestInfoErr, workrestInfoRes) {
                        // Handle Workrest error
                        if (workrestInfoErr) {
                          return done(workrestInfoErr);
                        }

                        // Set assertions
                        (workrestInfoRes.body._id).should.equal(workrestSaveRes.body._id);
                        (workrestInfoRes.body.name).should.equal(workrest.name);
                        should.equal(workrestInfoRes.body.user, undefined);

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
      Workrest.remove().exec(done);
    });
  });
});
