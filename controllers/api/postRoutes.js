/*
 * Just Kidding
 * controllers/api/postRoutes.js
 * Defines '/api/posts' CRUD requests
 * Copyright 2022 Alicia Santidrian, Jess Huang, Leo Wong
 */

// import express router
const router = require('express').Router();

// import model required in post routes
const { Post } = require('../../models');

// import custom middleware to redirect users if they are not logged in
const withAuth = require('../../utils/auth');

// import Node utility for working with file and directory paths
const path = require('path');

// define HTTP Response Status Codes
const OK = 200;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

// import middleware to support uploading of files
const multer = require('multer');

// multer middleware to filter non-JPG files
const fileFilter = (req, file, cb) => {
  // conditional to detect JPG and JPEG
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
    // multer API to execute file upload
    cb(null, true);
  } else {
    // multer API to reject file upload
    cb(null, false);
  }
};

// multer middleware to define upload file path and file name
var storage = multer.diskStorage({
  // define upload file path
  destination: './public/data/uploads/',

  // define callback function to determine file name
  filename: function (req, file, cb) {

    // set filename as the current time, to nearest millisecond
    const datestamp = Date.now();

    // set file extension to be same as original filename
    const extension = path.extname(file.originalname);

    // define filename with extension
    const fileName = datestamp + extension;

    // run callback with generated fileName as argument
    cb(null, fileName);
  }
});

// multer middleware to execute file upload using the two custom functions generated above
const upload = multer({ storage, fileFilter });

// Route handler to upload a file that uses two middleware: withAuth will redirect the user if not logged in, and upload will upload a file to the public folder
router.post('/uploads', [withAuth,upload.single('upload')], async (req, res) => {
  // Get parameters from req
  const {title, text, price, threadId: thread_id} = req.body;

  // Get parameter from session
  const {user_id} = req.session;

  // Get parameter from multer's file upload
  const { filename } = req.file;

  // Define image_url using the public path
  const image_url = '/data/uploads/' + filename;

  try {
    // Sequelize API to create a post
    await Post.create({
      title,
      text,
      image_url,
      price,
      user_id,
      thread_id
    });

    // Respond with status OK
    // File upload relies on older version of POST, so we redirect here directly (from the controller)
    res.status(OK).redirect('/thread/' + thread_id);

  // Respond with any error and status BAD_REQUEST
  } catch (err) {
    res.status(BAD_REQUEST).json(err);
  }
});

// Route handler to delete a post
router.delete('/:id', withAuth, async (req, res) => {
  // Get post id from req
  const { id } = req.params;

  // Get user id from session
  const { user_id } = req.session;

  // Sequelize API to delete a post
  const postData = await Post.destroy({ where: { id, user_id } });

  try {
    // If the post doesn't exist, return NOT_FOUND and a message
    if (!postData) {
      res.status(NOT_FOUND).json({ message: 'No post found with this id!' });
      return;
    }
    // Return OK if post was deleted
    res.status(OK).json(postData);

    // Respond with any error and status INTERNAL_SERVER_ERROR
  } catch (err) {
    res.status(INTERNAL_SERVER_ERROR).json(err);
  }
});

module.exports = router;
