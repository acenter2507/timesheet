'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Message = mongoose.model('Message'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  message;

/**
 * Message routes tests
 */
describe('Message CRUD tests', function () {

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

    // Save a user to the test db and create new Message
    user.save(function () {
      message = {
        name: 'Message name'
      };

      done();
    });
  });

  it('should be able to save a Message if logged in', function (done) {
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

        // Save a new Message
        agent.post('/api/messages')
          .send(message)
          .expect(200)
          .end(function (messageSaveErr, messageSaveRes) {
            // Handle Message save error
            if (messageSaveErr) {
              return done(messageSaveErr);
            }

            // Get a list of Messages
            agent.get('/api/messages')
              .end(function (messagesGetErr, messagesGetRes) {
                // Handle Messages save error
                if (messagesGetErr) {
                  return done(messagesGetErr);
                }

                // Get Messages list
                var messages = messagesGetRes.body;

                // Set assertions
                (messages[0].user._id).should.equal(userId);
                (messages[0].name).should.match('Message name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Message if not logged in', function (done) {
    agent.post('/api/messages')
      .send(message)
      .expect(403)
      .end(function (messageSaveErr, messageSaveRes) {
        // Call the assertion callback
        done(messageSaveErr);
      });
  });

  it('should not be able to save an Message if no name is provided', function (done) {
    // Invalidate name field
    message.name = '';

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

        // Save a new Message
        agent.post('/api/messages')
          .send(message)
          .expect(400)
          .end(function (messageSaveErr, messageSaveRes) {
            // Set message assertion
            (messageSaveRes.body.message).should.match('Please fill Message name');

            // Handle Message save error
            done(messageSaveErr);
          });
      });
  });

  it('should be able to update an Message if signed in', function (done) {
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

        // Save a new Message
        agent.post('/api/messages')
          .send(message)
          .expect(200)
          .end(function (messageSaveErr, messageSaveRes) {
            // Handle Message save error
            if (messageSaveErr) {
              return done(messageSaveErr);
            }

            // Update Message name
            message.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Message
            agent.put('/api/messages/' + messageSaveRes.body._id)
              .send(message)
              .expect(200)
              .end(function (messageUpdateErr, messageUpdateRes) {
                // Handle Message update error
                if (messageUpdateErr) {
                  return done(messageUpdateErr);
                }

                // Set assertions
                (messageUpdateRes.body._id).should.equal(messageSaveRes.body._id);
                (messageUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Messages if not signed in', function (done) {
    // Create new Message model instance
    var messageObj = new Message(message);

    // Save the message
    messageObj.save(function () {
      // Request Messages
      request(app).get('/api/messages')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Message if not signed in', function (done) {
    // Create new Message model instance
    var messageObj = new Message(message);

    // Save the Message
    messageObj.save(function () {
      request(app).get('/api/messages/' + messageObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', message.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Message with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/messages/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Message is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Message which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Message
    request(app).get('/api/messages/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Message with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Message if signed in', function (done) {
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

        // Save a new Message
        agent.post('/api/messages')
          .send(message)
          .expect(200)
          .end(function (messageSaveErr, messageSaveRes) {
            // Handle Message save error
            if (messageSaveErr) {
              return done(messageSaveErr);
            }

            // Delete an existing Message
            agent.delete('/api/messages/' + messageSaveRes.body._id)
              .send(message)
              .expect(200)
              .end(function (messageDeleteErr, messageDeleteRes) {
                // Handle message error error
                if (messageDeleteErr) {
                  return done(messageDeleteErr);
                }

                // Set assertions
                (messageDeleteRes.body._id).should.equal(messageSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Message if not signed in', function (done) {
    // Set Message user
    message.user = user;

    // Create new Message model instance
    var messageObj = new Message(message);

    // Save the Message
    messageObj.save(function () {
      // Try deleting Message
      request(app).delete('/api/messages/' + messageObj._id)
        .expect(403)
        .end(function (messageDeleteErr, messageDeleteRes) {
          // Set message assertion
          (messageDeleteRes.body.message).should.match('User is not authorized');

          // Handle Message error error
          done(messageDeleteErr);
        });

    });
  });

  it('should be able to get a single Message that has an orphaned user reference', function (done) {
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

          // Save a new Message
          agent.post('/api/messages')
            .send(message)
            .expect(200)
            .end(function (messageSaveErr, messageSaveRes) {
              // Handle Message save error
              if (messageSaveErr) {
                return done(messageSaveErr);
              }

              // Set assertions on new Message
              (messageSaveRes.body.name).should.equal(message.name);
              should.exist(messageSaveRes.body.user);
              should.equal(messageSaveRes.body.user._id, orphanId);

              // force the Message to have an orphaned user reference
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

                    // Get the Message
                    agent.get('/api/messages/' + messageSaveRes.body._id)
                      .expect(200)
                      .end(function (messageInfoErr, messageInfoRes) {
                        // Handle Message error
                        if (messageInfoErr) {
                          return done(messageInfoErr);
                        }

                        // Set assertions
                        (messageInfoRes.body._id).should.equal(messageSaveRes.body._id);
                        (messageInfoRes.body.name).should.equal(message.name);
                        should.equal(messageInfoRes.body.user, undefined);

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
      Message.remove().exec(done);
    });
  });
});
