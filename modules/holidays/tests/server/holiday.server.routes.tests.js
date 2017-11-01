'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Holiday = mongoose.model('Holiday'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  holiday;

/**
 * Holiday routes tests
 */
describe('Holiday CRUD tests', function () {

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

    // Save a user to the test db and create new Holiday
    user.save(function () {
      holiday = {
        name: 'Holiday name'
      };

      done();
    });
  });

  it('should be able to save a Holiday if logged in', function (done) {
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

        // Save a new Holiday
        agent.post('/api/holidays')
          .send(holiday)
          .expect(200)
          .end(function (holidaySaveErr, holidaySaveRes) {
            // Handle Holiday save error
            if (holidaySaveErr) {
              return done(holidaySaveErr);
            }

            // Get a list of Holidays
            agent.get('/api/holidays')
              .end(function (holidaysGetErr, holidaysGetRes) {
                // Handle Holidays save error
                if (holidaysGetErr) {
                  return done(holidaysGetErr);
                }

                // Get Holidays list
                var holidays = holidaysGetRes.body;

                // Set assertions
                (holidays[0].user._id).should.equal(userId);
                (holidays[0].name).should.match('Holiday name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Holiday if not logged in', function (done) {
    agent.post('/api/holidays')
      .send(holiday)
      .expect(403)
      .end(function (holidaySaveErr, holidaySaveRes) {
        // Call the assertion callback
        done(holidaySaveErr);
      });
  });

  it('should not be able to save an Holiday if no name is provided', function (done) {
    // Invalidate name field
    holiday.name = '';

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

        // Save a new Holiday
        agent.post('/api/holidays')
          .send(holiday)
          .expect(400)
          .end(function (holidaySaveErr, holidaySaveRes) {
            // Set message assertion
            (holidaySaveRes.body.message).should.match('Please fill Holiday name');

            // Handle Holiday save error
            done(holidaySaveErr);
          });
      });
  });

  it('should be able to update an Holiday if signed in', function (done) {
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

        // Save a new Holiday
        agent.post('/api/holidays')
          .send(holiday)
          .expect(200)
          .end(function (holidaySaveErr, holidaySaveRes) {
            // Handle Holiday save error
            if (holidaySaveErr) {
              return done(holidaySaveErr);
            }

            // Update Holiday name
            holiday.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Holiday
            agent.put('/api/holidays/' + holidaySaveRes.body._id)
              .send(holiday)
              .expect(200)
              .end(function (holidayUpdateErr, holidayUpdateRes) {
                // Handle Holiday update error
                if (holidayUpdateErr) {
                  return done(holidayUpdateErr);
                }

                // Set assertions
                (holidayUpdateRes.body._id).should.equal(holidaySaveRes.body._id);
                (holidayUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Holidays if not signed in', function (done) {
    // Create new Holiday model instance
    var holidayObj = new Holiday(holiday);

    // Save the holiday
    holidayObj.save(function () {
      // Request Holidays
      request(app).get('/api/holidays')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Holiday if not signed in', function (done) {
    // Create new Holiday model instance
    var holidayObj = new Holiday(holiday);

    // Save the Holiday
    holidayObj.save(function () {
      request(app).get('/api/holidays/' + holidayObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', holiday.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Holiday with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/holidays/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Holiday is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Holiday which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Holiday
    request(app).get('/api/holidays/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Holiday with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Holiday if signed in', function (done) {
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

        // Save a new Holiday
        agent.post('/api/holidays')
          .send(holiday)
          .expect(200)
          .end(function (holidaySaveErr, holidaySaveRes) {
            // Handle Holiday save error
            if (holidaySaveErr) {
              return done(holidaySaveErr);
            }

            // Delete an existing Holiday
            agent.delete('/api/holidays/' + holidaySaveRes.body._id)
              .send(holiday)
              .expect(200)
              .end(function (holidayDeleteErr, holidayDeleteRes) {
                // Handle holiday error error
                if (holidayDeleteErr) {
                  return done(holidayDeleteErr);
                }

                // Set assertions
                (holidayDeleteRes.body._id).should.equal(holidaySaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Holiday if not signed in', function (done) {
    // Set Holiday user
    holiday.user = user;

    // Create new Holiday model instance
    var holidayObj = new Holiday(holiday);

    // Save the Holiday
    holidayObj.save(function () {
      // Try deleting Holiday
      request(app).delete('/api/holidays/' + holidayObj._id)
        .expect(403)
        .end(function (holidayDeleteErr, holidayDeleteRes) {
          // Set message assertion
          (holidayDeleteRes.body.message).should.match('User is not authorized');

          // Handle Holiday error error
          done(holidayDeleteErr);
        });

    });
  });

  it('should be able to get a single Holiday that has an orphaned user reference', function (done) {
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

          // Save a new Holiday
          agent.post('/api/holidays')
            .send(holiday)
            .expect(200)
            .end(function (holidaySaveErr, holidaySaveRes) {
              // Handle Holiday save error
              if (holidaySaveErr) {
                return done(holidaySaveErr);
              }

              // Set assertions on new Holiday
              (holidaySaveRes.body.name).should.equal(holiday.name);
              should.exist(holidaySaveRes.body.user);
              should.equal(holidaySaveRes.body.user._id, orphanId);

              // force the Holiday to have an orphaned user reference
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

                    // Get the Holiday
                    agent.get('/api/holidays/' + holidaySaveRes.body._id)
                      .expect(200)
                      .end(function (holidayInfoErr, holidayInfoRes) {
                        // Handle Holiday error
                        if (holidayInfoErr) {
                          return done(holidayInfoErr);
                        }

                        // Set assertions
                        (holidayInfoRes.body._id).should.equal(holidaySaveRes.body._id);
                        (holidayInfoRes.body.name).should.equal(holiday.name);
                        should.equal(holidayInfoRes.body.user, undefined);

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
      Holiday.remove().exec(done);
    });
  });
});
