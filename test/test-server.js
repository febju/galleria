//CHAI
var chai = require('chai');
var server = require('../app');
var should = chai.should();
var expect = chai.expect();
//For reading mockfiles
var fs = require('fs');
//For database
var mongoose = require('mongoose');
//Models
var Media = require('../models/media.js');

chai.use(require('chai-http'));

var email1 = require('../public/redact/email1');
var email2 = require('../public/redact/email2');

describe('Frontpage', function() {
	it('should show the frontpage', function(done){
		chai.request(server)
		.get('/')
		.end(function(err, res){
			res.should.have.status(200);
			res.should.be.html;
			done();
		});
	});
});

describe('User', function() {
	it('should show user creation page', function(done){
		chai.request(server)
		.get('/user/register')
		.end(function(err, res){
			res.should.have.status(200);
			res.should.be.html;
			done();
		});
	});
	it('should create new user', function(done) {
		var agent = chai.request.agent(server)
		agent
		.post('/register')
		.send({'username': 'Testi', 'password': 'testi', 'email': email1})
		.then(function (res) {
			return agent.get('/')
			.then(function (res) {
				res.should.have.status(200);
				var login = (res.text).includes('<a class="login-name">Testi</a>');
				if (login == true) done(); 
			});
		});
	});
	it('should not create user with incorrect email');	//Ei toteutettavissa atm
	it('should not create user with duplicate email', function(done) {
		chai.request(server)
		.post('/register')
		.send({'username': 'Test', 'password': 'testi', 'email': email1})
		.end(function (err, res) {
			res.should.have.status(200);
			var login = (res.text).includes('<a class="login-name">Ei kirjautunut</a>');
			if (login == true) done(); 
		});
	});
	it('should not create user with duplicate username', function(done) {
		chai.request(server)
		.post('/register')
		.send({'username': 'Testi', 'password': 'testi', 'email': email2})
		.end(function (err, res) {
			res.should.have.status(200);
			var login = (res.text).includes('<a class="login-name">Ei kirjautunut</a>');
			if (login == true) done(); 
		});
	});
});

describe('Login', function() {
	it('should show the login page', function(done){
		chai.request(server)
		.get('/user/login')
		.end(function(err, res){
			res.should.have.status(200);
			res.should.be.html;
			done();
		});
	});
	it('should allow correct logins', function(done){
		var agent = chai.request.agent(server)
		agent
		.post('/login')
		.send({'username': 'Testi', 'password': 'testi'})
		.then(function (res) {
			res.should.have.status(200);
			var login = (res.text).includes('<a class="login-name">Testi</a>');
			if (login == true) done(); 
		});
	});
	it('should disallow logins with false passwords', function(done){
		var agent = chai.request.agent(server)
		agent
		.post('/login')
		.send({'username': 'Testi', 'password': 'test'})
		.then(function (res) {
			return agent.get('/user/login')
			.then(function (res) {
				res.should.have.status(200);
				var login = (res.text).includes('<a class="login-name">Ei kirjautunut</a>');
				if (login == true) done(); 
			});
		});
	});
	it('should disallow logins to non-existing accounts', function(done){
		var agent = chai.request.agent(server)
		agent
		.post('/login')
		.send({'username': 'Test', 'password': 'testi'})
		.then(function (res) {
			return agent.get('/user/login')
			.then(function (res) {
				res.should.have.status(200);
				var login = (res.text).includes('<a class="login-name">Ei kirjautunut</a>');
				if (login == true) done(); 
			});
		});
	});
	it('should logout', function(done){
		var agent = chai.request.agent(server)
		agent
		.post('/login')
		.send({'username': 'Testi', 'password': 'testi'})
		.then(function (res) {
			res.should.have.status(200);
			var login = (res.text).includes('<a class="login-name">Testi</a>');
			if (login == true) {
				return agent.get('/logout')
				.then(function (res) {
					return agent.get('/user/login')
					.then(function (res) {
						res.should.have.status(200);
						var login = (res.text).includes('<a class="login-name">Ei kirjautunut</a>');
						if (login == true) done();
					});
				});
			}
		});
	});
});

describe('Password reset', function() {
	it('should show the password reset page', function(done){
		chai.request(server)
		.get('/user/forgot')
		.end(function(err, res){
			res.should.have.status(200);
			res.should.be.html;
			done();
		});
	});
	it('should create tokens for existing accounts');
	it('should not create tokens for non-existing accounts');
	it('should allow access with correct tokens');
	it('should disallow access with false tokens');
	it('should disallow access if logged in');
	it('should reset password as requested');
});

describe('Media submission', function() {
	it('should show file submission page', function(done){
		chai.request(server)
		.get('/media/submit')
		.end(function(err, res){
			res.should.have.status(200);
			res.should.be.html;
			done();
		});
	});
	it('should allow new file submissions', function(done){
		var agent = chai.request.agent(server)
		agent
		.post('/media/submit')
		.field('name', 'nimi')
		.field('description', 'kuvaus')
		.attach('submission', fs.readFileSync('./test/test.png'), 'testi.png')
		.end(function(err, res){
			res.should.redirect;
			res.should.have.status(200);
			done();
		});
	});
});

describe('Media index', function() {
	it('should show all media files', function(done){
		chai.request(server)
		.get('/media')
		.end(function(err, res){
			res.should.have.status(200);
			res.should.be.html;
			done();
		});
	});
	it('should show only image files', function(done){
		chai.request(server)
		.get('/media/image')
		.end(function(err, res){
			res.should.have.status(200);
			res.should.be.html;
			done();
		});
	});
	it('should show only video files', function(done){
		chai.request(server)
		.get('/media/video')
		.end(function(err, res){
			res.should.have.status(200);
			res.should.be.html;
			done();
		});
	});
	it('should show only audio files', function(done){
		chai.request(server)
		.get('/media/audio')
		.end(function(err, res){
			res.should.have.status(200);
			res.should.be.html;
			done();
		});
	});
	it('should show links to singular files');
	it('should divide all files with pagination');		//Tarvitaan yli 20 tiedostoa
	it('should not allow access to non-existing pages', function(done){
		chai.request(server)
		.get('/media/?page=99999')
		.end(function(err, res){
			res.should.redirect;
			done();
		});
	});
});

describe('Media detail', function() {
	it('should show single file', function(done) {
		var detail = Media.findOne().exec();
		detail.then(function(media){
			chai.request(server)
			.get('/media/?id='+media.file)
			.end(function(err, res){
				res.should.have.status(200);
				res.should.be.html;
				done();
			});
		})
		.catch(function(err){
			console.log('error', err);
		});		
	});
	it('should not allow access to non-existing file', function(done) {
		chai.request(server)
		.get('/media/?id=test')
		.end(function(err, res){
			res.should.redirect;
			done();
		});
	});
	it('should allow zoom for images');
	it('should have video player for videos');
	it('should have audio player for audio');
	it('should allow movement to previous file');
	it('should allow movement to next file');
});

describe('Media search', function() {
	it('should show the search options');
	it('should show all search results');
	it('should show links to singular files');
	it('should divide all files with pagination');
	it('should not allow access to non-existing pages');
});

describe('Init', function() {
	it('should clear database', function(done){
		mongoose.createConnection('mongodb://localhost/galleria_test', function(){
            mongoose.connection.db.dropDatabase(function(){
                done();
            });
        });
	});
});