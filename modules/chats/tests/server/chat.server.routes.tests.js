'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Chat = mongoose.model('Chat'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  chat;

/**
 * Chat routes tests
 */
describe('Chat CRUD tests', function () {

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

    // Save a user to the test db and create new Chat
    user.save(function () {
      chat = {
        name: 'Chat name'
      };

      done();
    });
  });

  it('should be able to save a Chat if logged in', function (done) {
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

        // Save a new Chat
        agent.post('/api/chats')
          .send(chat)
          .expect(200)
          .end(function (chatSaveErr, chatSaveRes) {
            // Handle Chat save error
            if (chatSaveErr) {
              return done(chatSaveErr);
            }

            // Get a list of Chats
            agent.get('/api/chats')
              .end(function (chatsGetErr, chatsGetRes) {
                // Handle Chats save error
                if (chatsGetErr) {
                  return done(chatsGetErr);
                }

                // Get Chats list
                var chats = chatsGetRes.body;

                // Set assertions
                (chats[0].user._id).should.equal(userId);
                (chats[0].name).should.match('Chat name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Chat if not logged in', function (done) {
    agent.post('/api/chats')
      .send(chat)
      .expect(403)
      .end(function (chatSaveErr, chatSaveRes) {
        // Call the assertion callback
        done(chatSaveErr);
      });
  });

  it('should not be able to save an Chat if no name is provided', function (done) {
    // Invalidate name field
    chat.name = '';

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

        // Save a new Chat
        agent.post('/api/chats')
          .send(chat)
          .expect(400)
          .end(function (chatSaveErr, chatSaveRes) {
            // Set message assertion
            (chatSaveRes.body.message).should.match('Please fill Chat name');

            // Handle Chat save error
            done(chatSaveErr);
          });
      });
  });

  it('should be able to update an Chat if signed in', function (done) {
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

        // Save a new Chat
        agent.post('/api/chats')
          .send(chat)
          .expect(200)
          .end(function (chatSaveErr, chatSaveRes) {
            // Handle Chat save error
            if (chatSaveErr) {
              return done(chatSaveErr);
            }

            // Update Chat name
            chat.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Chat
            agent.put('/api/chats/' + chatSaveRes.body._id)
              .send(chat)
              .expect(200)
              .end(function (chatUpdateErr, chatUpdateRes) {
                // Handle Chat update error
                if (chatUpdateErr) {
                  return done(chatUpdateErr);
                }

                // Set assertions
                (chatUpdateRes.body._id).should.equal(chatSaveRes.body._id);
                (chatUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Chats if not signed in', function (done) {
    // Create new Chat model instance
    var chatObj = new Chat(chat);

    // Save the chat
    chatObj.save(function () {
      // Request Chats
      request(app).get('/api/chats')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Chat if not signed in', function (done) {
    // Create new Chat model instance
    var chatObj = new Chat(chat);

    // Save the Chat
    chatObj.save(function () {
      request(app).get('/api/chats/' + chatObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', chat.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Chat with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/chats/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Chat is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Chat which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Chat
    request(app).get('/api/chats/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Chat with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Chat if signed in', function (done) {
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

        // Save a new Chat
        agent.post('/api/chats')
          .send(chat)
          .expect(200)
          .end(function (chatSaveErr, chatSaveRes) {
            // Handle Chat save error
            if (chatSaveErr) {
              return done(chatSaveErr);
            }

            // Delete an existing Chat
            agent.delete('/api/chats/' + chatSaveRes.body._id)
              .send(chat)
              .expect(200)
              .end(function (chatDeleteErr, chatDeleteRes) {
                // Handle chat error error
                if (chatDeleteErr) {
                  return done(chatDeleteErr);
                }

                // Set assertions
                (chatDeleteRes.body._id).should.equal(chatSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Chat if not signed in', function (done) {
    // Set Chat user
    chat.user = user;

    // Create new Chat model instance
    var chatObj = new Chat(chat);

    // Save the Chat
    chatObj.save(function () {
      // Try deleting Chat
      request(app).delete('/api/chats/' + chatObj._id)
        .expect(403)
        .end(function (chatDeleteErr, chatDeleteRes) {
          // Set message assertion
          (chatDeleteRes.body.message).should.match('User is not authorized');

          // Handle Chat error error
          done(chatDeleteErr);
        });

    });
  });

  it('should be able to get a single Chat that has an orphaned user reference', function (done) {
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

          // Save a new Chat
          agent.post('/api/chats')
            .send(chat)
            .expect(200)
            .end(function (chatSaveErr, chatSaveRes) {
              // Handle Chat save error
              if (chatSaveErr) {
                return done(chatSaveErr);
              }

              // Set assertions on new Chat
              (chatSaveRes.body.name).should.equal(chat.name);
              should.exist(chatSaveRes.body.user);
              should.equal(chatSaveRes.body.user._id, orphanId);

              // force the Chat to have an orphaned user reference
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

                    // Get the Chat
                    agent.get('/api/chats/' + chatSaveRes.body._id)
                      .expect(200)
                      .end(function (chatInfoErr, chatInfoRes) {
                        // Handle Chat error
                        if (chatInfoErr) {
                          return done(chatInfoErr);
                        }

                        // Set assertions
                        (chatInfoRes.body._id).should.equal(chatSaveRes.body._id);
                        (chatInfoRes.body.name).should.equal(chat.name);
                        should.equal(chatInfoRes.body.user, undefined);

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
      Chat.remove().exec(done);
    });
  });
});
