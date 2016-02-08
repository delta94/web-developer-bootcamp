const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');

// GET INDEX ////////////////////////////////////////
router.get('/', function(req, res) {
  Campground.find({}, function(err, campgrounds) {
    if (err) {
      console.log(err);
    } else {
      res.status(200).render('campground/index', {
        campgrounds: campgrounds,
      });
    }
  });
});

// GET NEW  /////////////////////////////////////////
router.get('/new', isLoggedIn, function(req, res) {
  res.status(200).render('campground/new');
});

// POST CREATE /////////////////////////////////////
router.post('/', isLoggedIn, function(req, res) {
  var data = {
    name: req.body.name,
    image: req.body.image,
    description: req.body.description,
    author: {
      id: req.user._id,
      username: req.user.username,
    },
  };
  Campground.create(data, function(err, cb) {
    if (err) {
      console.log(err);
    } else {
      res.status(302).redirect('/campgrounds/' + cb._id);
    }
  });
});

// GET SHOW ////////////////////////////////////////
router.get('/:id', function(req, res) {
  Campground.findById(req.params.id).populate('comments').exec(function(err, campground) {
    if (err) {
      console.log(err);
    } else {
      res.status(200).render('campground/show', {
        campground: campground,
      });
    }
  });
});

// EDIT FORM ///////////////////////////////////////
router.get('/:id/edit', checkCampgroundOwnership, function(req, res) {
  Campground.findById(req.params.id, function(err, campground) {
    if (err) {
      console.log(err);
      res.status(303).redirect('/campgrounds/' + req.params.id);
    }
    res.status(200).render('campground/edit', {campground: campground});
  });
});


// PUT UPDATE //////////////////////////////////////
router.put('/:id', checkCampgroundOwnership, function(req, res) {
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, eCampground) {
    if (err) {
      console.log(err);
      res.status(303).redirect('/campgrounds/' + req.params.id);
    } else {
      res.status(303).redirect('/campgrounds/' + req.params.id);
    }
  });
});

// DESTROY /////////////////////////////////////////
router.delete('/:id', checkCampgroundOwnership, function(req, res) {
  Campground.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      console.log(err);
      res.status(302).redirect('/campgrounds/' + req.params.id);
    } else {
      res.status(302).redirect('/campgrounds');
    }
  });
});


// MIDDLEWARE //////////////////////////////////////
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(200).redirect('/login');
}

function checkCampgroundOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, function(err, fCampground) {
      if (err) {
        res.status(302).redirect('back');
      } else {
        if (fCampground.author.id.equals(req.user._id)) {
         next();
        } else {
          res.status(302).redirect('back');
        }
      }
    });
  } else {
    res.status(302).redirect('back');
  }
}

module.exports = router;
