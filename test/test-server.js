var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();
var expect = chai.expect();

var fs = require('fs');

var mongoose = require('mongoose');

chai.use(chaiHttp);

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
		chai.request(server)
		.post('/register')
		.send({'username': 'Testi', 'password': 'testi', 'email': 'febju.system@gmail.com'})
		.end(function(res){
			done();
		});
	});
	it('should not create user with incorrect email');	//Ei toteutettavissa atm
	it('should not create user with duplicate email');
	it('should not create user with duplicate username');
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
		var agent = chai.request.agent(server);
		agent.post('/login')
		.send({'username': 'Testi', 'password': 'testi'})
		.then(function(res){
			agent.get('/user/login')
				.then(function(res2){
					//res2.should.redirect;
					done();
				});
		});
	});
	it('should disallow logins with false passwords');
	it('should disallow logins to non-existing accounts');
	it('should logout');
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
	it('should show file submission page');
	it('should allow new file submissions', function(done){
		chai.request(server)
		.post('/media/submit')
		.field('name', 'nimi')
		.field('description', 'kuvaus')
		.attach('submission', fs.readFileSync('./test/test.png'), 'testi.png')
		.end(function(err, res){
			res.should.redirect;
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
	it('should divide all files with pagination');
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
	it('should show single file');
	it('should show information of the file');
	it('should allow zoom for images');
	it('should allow movement to previous file');
	it('should allow movement to next file');
});

describe('Media search', function() {
	it('should show the search options');
	it('should show all search results');
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