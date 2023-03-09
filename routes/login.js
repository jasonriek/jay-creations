const hash = require('pbkdf2-password')()
const admin_db = require('../service/admin_sql');
const db = require('../service/sql');
const utils = require('../service/utils');

function authenticate(name, pass, fn) {
    if (!module.children) console.log('authenticating %s:%s', name, pass);
    let user = admin_db.adminUsername(name);
    // query the db for the given username
    if (!user) return fn(null, null)
    // apply the same algorithm to the POSTed password, applying
    // the hash against the pass / salt, if there is a match we
    // found the user
    hash({ password: pass, salt: user.SALT }, function (err, pass, salt, hash) {
      if (err) {return fn(err)};
      if (hash === user.HASH) {return fn(null, user);}
      fn(null, null);
    });
}

function restrict(req, res, next) {
    if (req.session.user) {
        next();
    }
    else {
        req.session.error = 'Access Denied!';
        res.redirect('/login');
    }
}

function logout_get(req, res){
    req.session.destroy(function() {
        res.redirect('/login');
    });
}

function login_get (req, res) { 
  let context = {caps: utils.capitalize};
  let themes = db.getBlogThemes()
  let ids = [];
  for(let theme of themes) {
      ids = db.getBlogIDs(theme.THEME)
      theme['last_id'] = 1
      if(ids.length) {
          theme['last_id'] = ids.slice(-1)[0].id;
      }
  }
  context['themes'] = themes;
  console.log(context);
  res.render('login', context);
}

function login_post (req, res, next) {
    authenticate(req.body.username, req.body.password, function(err, user) {
      if (err){return next(err);}
      if (user) {
        // Regenerate session when signing in
        // to prevent fixation
        req.session.regenerate(function(){
          // Store the user's primary key
          // in the session store to be retrieved,
          // or in this case the entire user object
          req.session.user = user;
          req.session.success = 'Authenticated' 
            + ' click to <a href="/logout">logout</a>. '
          res.redirect('/');
          //res.render('blog_write');

        });
      } 
      else {
        req.session.error = 'Authentication failed, please check your '
          + ' username and password.'
        res.redirect('/login');
      }
    }); 
}

module.exports = {
    restrict,
    logout_get,
    login_get,
    login_post,
    hash
}