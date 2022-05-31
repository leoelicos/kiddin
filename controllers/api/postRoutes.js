const router = require('express').Router();
const { Post } = require('../../models');
const withAuth = require('../../utils/auth');

// MULTER STUFF
// express middleware to support uploading of files
const multer = require('multer');
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
var storage = multer.diskStorage({
  destination: './public/data/uploads/',
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  }
});
const upload = multer({ storage, fileFilter });

// CONTROLLER MULTER STUFF
//  app.post('/uploads', upload.single('upload'), function (req, res) {
//   console.log(req.file);
//   const src = path.join(__dirname, req.file.path);
//   res.status(200).json({ path: 'https://leoelicos-multer.herokuapp.com' + src });
// });

router.post('/uploads', [withAuth,upload.single('upload')], async (req, res) => {
  try {
    const src = path.join(__dirname, req.file.path);
    const newPost = await Post.create({
      title: req.body.title,
      text: req.body.text,
      //ADD IN HEROKU URL WHEN KNOWN
      image_url: src,
      price: req.body.price,
      user_id: req.session.user_id,
    });

    res.status(200).json(newPost);
  } catch (err) {
    res.status(400).json(err);
  }
});

//delete path if we add in later
router.delete('/:id', withAuth, async (req, res) => {
  try {
    const postData = await Post.destroy({
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });
    console.log(postData);

    if (!postData) {
      res.status(404).json({ message: 'No post found with this id!' });
      return;
    }

    res.status(200).json(postData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
