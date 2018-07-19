'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Room = mongoose.model('Room'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  room;

/**
 * Room routes tests
 */
describe('Room CRUD tests', function () {

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

    // Save a user to the test db and create new Room
    user.save(function () {
      room = {
        name: 'Room name'
      };

      done();
    });
  });

  it('should be able to save a Room if logged in', function (done) {
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

        // Save a new Room
        agent.post('/api/rooms')
          .send(room)
          .expect(200)
          .end(function (roomSaveErr, roomSaveRes) {
            // Handle Room save error
            if (roomSaveErr) {
              return done(roomSaveErr);
            }

            // Get a list of Rooms
            agent.get('/api/rooms')
              .end(function (roomsGetErr, roomsGetRes) {
                // Handle Rooms save error
                if (roomsGetErr) {
                  return done(roomsGetErr);
                }

                // Get Rooms list
                var rooms = roomsGetRes.body;

                // Set assertions
                (rooms[0].user._id).should.equal(userId);
                (rooms[0].name).should.match('Room name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Room if not logged in', function (done) {
    agent.post('/api/rooms')
      .send(room)
      .expect(403)
      .end(function (roomSaveErr, roomSaveRes) {
        // Call the assertion callback
        done(roomSaveErr);
      });
  });

  it('should not be able to save an Room if no name is provided', function (done) {
    // Invalidate name field
    room.name = '';

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

        // Save a new Room
        agent.post('/api/rooms')
          .send(room)
          .expect(400)
          .end(function (roomSaveErr, roomSaveRes) {
            // Set message assertion
            (roomSaveRes.body.message).should.match('Please fill Room name');

            // Handle Room save error
            done(roomSaveErr);
          });
      });
  });

  it('should be able to update an Room if signed in', function (done) {
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

        // Save a new Room
        agent.post('/api/rooms')
          .send(room)
          .expect(200)
          .end(function (roomSaveErr, roomSaveRes) {
            // Handle Room save error
            if (roomSaveErr) {
              return done(roomSaveErr);
            }

            // Update Room name
            room.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Room
            agent.put('/api/rooms/' + roomSaveRes.body._id)
              .send(room)
              .expect(200)
              .end(function (roomUpdateErr, roomUpdateRes) {
                // Handle Room update error
                if (roomUpdateErr) {
                  return done(roomUpdateErr);
                }

                // Set assertions
                (roomUpdateRes.body._id).should.equal(roomSaveRes.body._id);
                (roomUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Rooms if not signed in', function (done) {
    // Create new Room model instance
    var roomObj = new Room(room);

    // Save the room
    roomObj.save(function () {
      // Request Rooms
      request(app).get('/api/rooms')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Room if not signed in', function (done) {
    // Create new Room model instance
    var roomObj = new Room(room);

    // Save the Room
    roomObj.save(function () {
      request(app).get('/api/rooms/' + roomObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', room.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Room with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/rooms/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Room is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Room which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Room
    request(app).get('/api/rooms/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Room with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Room if signed in', function (done) {
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

        // Save a new Room
        agent.post('/api/rooms')
          .send(room)
          .expect(200)
          .end(function (roomSaveErr, roomSaveRes) {
            // Handle Room save error
            if (roomSaveErr) {
              return done(roomSaveErr);
            }

            // Delete an existing Room
            agent.delete('/api/rooms/' + roomSaveRes.body._id)
              .send(room)
              .expect(200)
              .end(function (roomDeleteErr, roomDeleteRes) {
                // Handle room error error
                if (roomDeleteErr) {
                  return done(roomDeleteErr);
                }

                // Set assertions
                (roomDeleteRes.body._id).should.equal(roomSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Room if not signed in', function (done) {
    // Set Room user
    room.user = user;

    // Create new Room model instance
    var roomObj = new Room(room);

    // Save the Room
    roomObj.save(function () {
      // Try deleting Room
      request(app).delete('/api/rooms/' + roomObj._id)
        .expect(403)
        .end(function (roomDeleteErr, roomDeleteRes) {
          // Set message assertion
          (roomDeleteRes.body.message).should.match('User is not authorized');

          // Handle Room error error
          done(roomDeleteErr);
        });

    });
  });

  it('should be able to get a single Room that has an orphaned user reference', function (done) {
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

          // Save a new Room
          agent.post('/api/rooms')
            .send(room)
            .expect(200)
            .end(function (roomSaveErr, roomSaveRes) {
              // Handle Room save error
              if (roomSaveErr) {
                return done(roomSaveErr);
              }

              // Set assertions on new Room
              (roomSaveRes.body.name).should.equal(room.name);
              should.exist(roomSaveRes.body.user);
              should.equal(roomSaveRes.body.user._id, orphanId);

              // force the Room to have an orphaned user reference
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

                    // Get the Room
                    agent.get('/api/rooms/' + roomSaveRes.body._id)
                      .expect(200)
                      .end(function (roomInfoErr, roomInfoRes) {
                        // Handle Room error
                        if (roomInfoErr) {
                          return done(roomInfoErr);
                        }

                        // Set assertions
                        (roomInfoRes.body._id).should.equal(roomSaveRes.body._id);
                        (roomInfoRes.body.name).should.equal(room.name);
                        should.equal(roomInfoRes.body.user, undefined);

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
      Room.remove().exec(done);
    });
  });
});
