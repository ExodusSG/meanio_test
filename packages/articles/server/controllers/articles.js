'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Article = mongoose.model('Article'),
  /* [ExodusSG] Start to insert defination of User model from MongoDB schema for later user seraching */
  User = mongoose.model('User'),
  /* [ExodusSG] End of insertion */
  _ = require('lodash');


/**
 * Find article by id
 */
exports.article = function(req, res, next, id) {
  Article.load(id, function(err, article) {
    if (err) return next(err);
    if (!article) return next(new Error('Failed to load article ' + id));
    req.article = article;
    next();
  });
};

/**
 * Create an article
 */
exports.create = function(req, res) {
  var article = new Article(req.body);
  /* [ExodusSG] Start to insert code to prepare for the passing newly created article to buddy user */
  var article_tmp = new Article(req.body);
  var email_address = req.body.buddy;
  /* [ExodusSG] End of insertion */
  article.user = req.user;

  /* [ExodusSG] Start to insert code to find user by its email address and then save newly created article to this user */
  User
      .findOne({
        'email':email_address
      })
      .exec(function(err, tmp_user) {
        if (err || !tmp_user) {
           console.log('Error or cannot in finding expected user!', email_address);
           return 
        }
        console.log('Find one user and its id [_id]: ', email_address, tmp_user._id);
        article_tmp.user = tmp_user._id;
        article_tmp.save(function(err) {});
      });
/*  user = User.findOne({'email':email_address}, function(err) {}); */
/*  This console.log message is shown before the tmp_user._id display !!!! 
/*  console.log('Find one user info: ', user._id); */
  /* [ExodusSG] End of insertion */
  article.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot save the article'
      });
    }
    res.json(article);

  });
};

/**
 * Update an article
 */
exports.update = function(req, res) {
  var article = req.article;

  article = _.extend(article, req.body);

  article.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot update the article'
      });
    }
    res.json(article);

  });
};

/**
 * Delete an article
 */
exports.destroy = function(req, res) {
  var article = req.article;

  article.remove(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot delete the article'
      });
    }
    res.json(article);

  });
};

/**
 * Show an article
 */
exports.show = function(req, res) {
  res.json(req.article);
};

/**
 * List of Articles
 */
exports.all = function(req, res) {
  /* [ExodusSG] Start to change code to list only articles that belongs to this user */
  /*  Article.find().sort('-created').populate('user', 'name username').exec(function(err, articles) { */
  Article.find({'user': req.user}).sort('-created').populate('user', 'name username').exec(function(err, articles) {
  /* [ExodusSG] End of insertion */
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the articles'
      });
    }
    res.json(articles);

  });
};
