'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Transport = mongoose.model('Transport'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  transport;

/**
 * Transport routes tests
 */
describe('Transport CRUD tests', function () {

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

    // Save a user to the test db and create new Transport
    user.save(function () {
      transport = {
        name: 'Transport name'
      };

      done();
    });
  });

  it('should be able to save a Transport if logged in', function (done) {
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

        // Save a new Transport
        agent.post('/api/transports')
          .send(transport)
          .expect(200)
          .end(function (transportSaveErr, transportSaveRes) {
            // Handle Transport save error
            if (transportSaveErr) {
              return done(transportSaveErr);
            }

            // Get a list of Transports
            agent.get('/api/transports')
              .end(function (transportsGetErr, transportsGetRes) {
                // Handle Transports save error
                if (transportsGetErr) {
                  return done(transportsGetErr);
                }

                // Get Transports list
                var transports = transportsGetRes.body;

                // Set assertions
                (transports[0].user._id).should.equal(userId);
                (transports[0].name).should.match('Transport name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Transport if not logged in', function (done) {
    agent.post('/api/transports')
      .send(transport)
      .expect(403)
      .end(function (transportSaveErr, transportSaveRes) {
        // Call the assertion callback
        done(transportSaveErr);
      });
  });

  it('should not be able to save an Transport if no name is provided', function (done) {
    // Invalidate name field
    transport.name = '';

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

        // Save a new Transport
        agent.post('/api/transports')
          .send(transport)
          .expect(400)
          .end(function (transportSaveErr, transportSaveRes) {
            // Set message assertion
            (transportSaveRes.body.message).should.match('Please fill Transport name');

            // Handle Transport save error
            done(transportSaveErr);
          });
      });
  });

  it('should be able to update an Transport if signed in', function (done) {
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

        // Save a new Transport
        agent.post('/api/transports')
          .send(transport)
          .expect(200)
          .end(function (transportSaveErr, transportSaveRes) {
            // Handle Transport save error
            if (transportSaveErr) {
              return done(transportSaveErr);
            }

            // Update Transport name
            transport.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Transport
            agent.put('/api/transports/' + transportSaveRes.body._id)
              .send(transport)
              .expect(200)
              .end(function (transportUpdateErr, transportUpdateRes) {
                // Handle Transport update error
                if (transportUpdateErr) {
                  return done(transportUpdateErr);
                }

                // Set assertions
                (transportUpdateRes.body._id).should.equal(transportSaveRes.body._id);
                (transportUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Transports if not signed in', function (done) {
    // Create new Transport model instance
    var transportObj = new Transport(transport);

    // Save the transport
    transportObj.save(function () {
      // Request Transports
      request(app).get('/api/transports')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Transport if not signed in', function (done) {
    // Create new Transport model instance
    var transportObj = new Transport(transport);

    // Save the Transport
    transportObj.save(function () {
      request(app).get('/api/transports/' + transportObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', transport.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Transport with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/transports/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Transport is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Transport which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Transport
    request(app).get('/api/transports/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Transport with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Transport if signed in', function (done) {
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

        // Save a new Transport
        agent.post('/api/transports')
          .send(transport)
          .expect(200)
          .end(function (transportSaveErr, transportSaveRes) {
            // Handle Transport save error
            if (transportSaveErr) {
              return done(transportSaveErr);
            }

            // Delete an existing Transport
            agent.delete('/api/transports/' + transportSaveRes.body._id)
              .send(transport)
              .expect(200)
              .end(function (transportDeleteErr, transportDeleteRes) {
                // Handle transport error error
                if (transportDeleteErr) {
                  return done(transportDeleteErr);
                }

                // Set assertions
                (transportDeleteRes.body._id).should.equal(transportSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Transport if not signed in', function (done) {
    // Set Transport user
    transport.user = user;

    // Create new Transport model instance
    var transportObj = new Transport(transport);

    // Save the Transport
    transportObj.save(function () {
      // Try deleting Transport
      request(app).delete('/api/transports/' + transportObj._id)
        .expect(403)
        .end(function (transportDeleteErr, transportDeleteRes) {
          // Set message assertion
          (transportDeleteRes.body.message).should.match('User is not authorized');

          // Handle Transport error error
          done(transportDeleteErr);
        });

    });
  });

  it('should be able to get a single Transport that has an orphaned user reference', function (done) {
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

          // Save a new Transport
          agent.post('/api/transports')
            .send(transport)
            .expect(200)
            .end(function (transportSaveErr, transportSaveRes) {
              // Handle Transport save error
              if (transportSaveErr) {
                return done(transportSaveErr);
              }

              // Set assertions on new Transport
              (transportSaveRes.body.name).should.equal(transport.name);
              should.exist(transportSaveRes.body.user);
              should.equal(transportSaveRes.body.user._id, orphanId);

              // force the Transport to have an orphaned user reference
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

                    // Get the Transport
                    agent.get('/api/transports/' + transportSaveRes.body._id)
                      .expect(200)
                      .end(function (transportInfoErr, transportInfoRes) {
                        // Handle Transport error
                        if (transportInfoErr) {
                          return done(transportInfoErr);
                        }

                        // Set assertions
                        (transportInfoRes.body._id).should.equal(transportSaveRes.body._id);
                        (transportInfoRes.body.name).should.equal(transport.name);
                        should.equal(transportInfoRes.body.user, undefined);

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
      Transport.remove().exec(done);
    });
  });
});
