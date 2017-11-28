'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Month = mongoose.model('Month'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  month;

/**
 * Month routes tests
 */
describe('Month CRUD tests', function () {

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

    // Save a user to the test db and create new Month
    user.save(function () {
      month = {
        name: 'Month name'
      };

      done();
    });
  });

  it('should be able to save a Month if logged in', function (done) {
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

        // Save a new Month
        agent.post('/api/months')
          .send(month)
          .expect(200)
          .end(function (monthSaveErr, monthSaveRes) {
            // Handle Month save error
            if (monthSaveErr) {
              return done(monthSaveErr);
            }

            // Get a list of Months
            agent.get('/api/months')
              .end(function (monthsGetErr, monthsGetRes) {
                // Handle Months save error
                if (monthsGetErr) {
                  return done(monthsGetErr);
                }

                // Get Months list
                var months = monthsGetRes.body;

                // Set assertions
                (months[0].user._id).should.equal(userId);
                (months[0].name).should.match('Month name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Month if not logged in', function (done) {
    agent.post('/api/months')
      .send(month)
      .expect(403)
      .end(function (monthSaveErr, monthSaveRes) {
        // Call the assertion callback
        done(monthSaveErr);
      });
  });

  it('should not be able to save an Month if no name is provided', function (done) {
    // Invalidate name field
    month.name = '';

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

        // Save a new Month
        agent.post('/api/months')
          .send(month)
          .expect(400)
          .end(function (monthSaveErr, monthSaveRes) {
            // Set message assertion
            (monthSaveRes.body.message).should.match('Please fill Month name');

            // Handle Month save error
            done(monthSaveErr);
          });
      });
  });

  it('should be able to update an Month if signed in', function (done) {
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

        // Save a new Month
        agent.post('/api/months')
          .send(month)
          .expect(200)
          .end(function (monthSaveErr, monthSaveRes) {
            // Handle Month save error
            if (monthSaveErr) {
              return done(monthSaveErr);
            }

            // Update Month name
            month.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Month
            agent.put('/api/months/' + monthSaveRes.body._id)
              .send(month)
              .expect(200)
              .end(function (monthUpdateErr, monthUpdateRes) {
                // Handle Month update error
                if (monthUpdateErr) {
                  return done(monthUpdateErr);
                }

                // Set assertions
                (monthUpdateRes.body._id).should.equal(monthSaveRes.body._id);
                (monthUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Months if not signed in', function (done) {
    // Create new Month model instance
    var monthObj = new Month(month);

    // Save the month
    monthObj.save(function () {
      // Request Months
      request(app).get('/api/months')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Month if not signed in', function (done) {
    // Create new Month model instance
    var monthObj = new Month(month);

    // Save the Month
    monthObj.save(function () {
      request(app).get('/api/months/' + monthObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', month.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Month with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/months/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Month is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Month which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Month
    request(app).get('/api/months/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Month with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Month if signed in', function (done) {
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

        // Save a new Month
        agent.post('/api/months')
          .send(month)
          .expect(200)
          .end(function (monthSaveErr, monthSaveRes) {
            // Handle Month save error
            if (monthSaveErr) {
              return done(monthSaveErr);
            }

            // Delete an existing Month
            agent.delete('/api/months/' + monthSaveRes.body._id)
              .send(month)
              .expect(200)
              .end(function (monthDeleteErr, monthDeleteRes) {
                // Handle month error error
                if (monthDeleteErr) {
                  return done(monthDeleteErr);
                }

                // Set assertions
                (monthDeleteRes.body._id).should.equal(monthSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Month if not signed in', function (done) {
    // Set Month user
    month.user = user;

    // Create new Month model instance
    var monthObj = new Month(month);

    // Save the Month
    monthObj.save(function () {
      // Try deleting Month
      request(app).delete('/api/months/' + monthObj._id)
        .expect(403)
        .end(function (monthDeleteErr, monthDeleteRes) {
          // Set message assertion
          (monthDeleteRes.body.message).should.match('User is not authorized');

          // Handle Month error error
          done(monthDeleteErr);
        });

    });
  });

  it('should be able to get a single Month that has an orphaned user reference', function (done) {
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

          // Save a new Month
          agent.post('/api/months')
            .send(month)
            .expect(200)
            .end(function (monthSaveErr, monthSaveRes) {
              // Handle Month save error
              if (monthSaveErr) {
                return done(monthSaveErr);
              }

              // Set assertions on new Month
              (monthSaveRes.body.name).should.equal(month.name);
              should.exist(monthSaveRes.body.user);
              should.equal(monthSaveRes.body.user._id, orphanId);

              // force the Month to have an orphaned user reference
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

                    // Get the Month
                    agent.get('/api/months/' + monthSaveRes.body._id)
                      .expect(200)
                      .end(function (monthInfoErr, monthInfoRes) {
                        // Handle Month error
                        if (monthInfoErr) {
                          return done(monthInfoErr);
                        }

                        // Set assertions
                        (monthInfoRes.body._id).should.equal(monthSaveRes.body._id);
                        (monthInfoRes.body.name).should.equal(month.name);
                        should.equal(monthInfoRes.body.user, undefined);

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
      Month.remove().exec(done);
    });
  });
});
