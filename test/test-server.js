var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();
var expect = chai.expect();

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
	it('should create new user');
	it('should offer feedback if user creation failed');
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
	it('should allow correct logins');
	it('should disallow incorrect logins');
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
	it('should offer password reset');
	it('should allow correct access password resets');
	it('should disallow correct access password resets');
	it('should reset password as requested');
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

describe('Media submission', function() {
	it('should allow new file submissions from registered users');
	it('should save new files on server');
});