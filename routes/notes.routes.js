const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag');

function createNonExistingFolders(folders) {
  let preExistingFolders = folders.filter(folder => folder._id),
      foldersThatNeedToBeMade = folders.filter(folder => !folder._id),
      finalizedFolders = [];
  let folderPromiseArray = Folder.create(foldersThatNeedToBeMade).then(res => {
    finalizedFolders = preExistingFolders.concat(res);
    return finalizedFolders;
  });
  return folderPromiseArray;
}
function validateFolderIds(folders, userId) {
  if (folders === undefined) {
    return Promise.resolve();
  }

  if (!Array.isArray(folders)) {
    const err = new Error('The `folders` must be an array');
    err.status = 400;
    return Promise.reject(err);
  }

  folders.forEach(folder => {
    if (!mongoose.Types.ObjectId.isValid(folder._id)) {
      const err = new Error('The `folder._id` is not valid.');
      err.status = 400;
      return Promise.reject(err);
    }
  });

  return Folder.find({ $and: [{ _id: { $in: folders }, userId }] })
    .then(results => {
      if (folders.length !== results.length) {
        const err = new Error('The `folders` contains an invalid id');
        err.status = 400;
        return Promise.reject(err);
      }
    })
    .catch(err => {
      console.error(err);
    });
}

/**
 * @description Creates tags that do not exist in the database, asynchronously...
 * @param {*} tags 
 */
function createNonExistingTags(tags) {
  let preExistingTags = tags.filter(tag => tag._id);
  let tagsThatNeedToBeMade = tags.filter(tag => !tag._id);
  let finalizedTags = [];
  let tagPromiseArray = Tag.create(tagsThatNeedToBeMade).then(res => {
    finalizedTags = preExistingTags.concat(res);
    return finalizedTags;
  });
  return tagPromiseArray;
}

function validateTagIds(tags, userId) {
  if (tags === undefined) { // If tags is undefined, there are no tags and resolve the Promise.
    return Promise.resolve();
  }

  if (!Array.isArray(tags)) { // Tags must be an array
    const err = new Error('The `tags` must be an array');
    err.status = 400;
    return Promise.reject(err);
  }

  tags.forEach(tag => {
    if (!mongoose.Types.ObjectId.isValid(tag._id)) {
      const err = new Error('The `tag._id` is not valid.');
      err.status = 400;
      return Promise.reject(err);
    }
  });
  
  return Tag.find({ $and: [{ _id: { $in: tags }, userId }] })
    .then(results => {
      console.log('VALIDATE TAG results:', results);
      if (tags.length !== results.length) {
        const err = new Error('The `tags` contains an invalid id');
        err.status = 400;
        return Promise.reject(err);
      }
    })
    .catch(err => {
      console.error(err);
    });
}



const router = express.Router();

// Protect endpoints using JWT Strategy
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL NOTES ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;
  const userId = req.user.id;

  let filter = { userId };

  if (searchTerm) {
    // filter.title = { $regex: searchTerm };
    filter.$or = [{ 'title': { $regex: searchTerm } }, { 'content': { $regex: searchTerm } }];
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  if (tagId) {
    filter.tags = tagId;
  }

  Note.find(filter)
    .populate('tags')
    .populate('folders')
    .sort({ 'updatedAt': 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/** ========== GET/READ A SINGLE NOTE BY ID ============================
* @description GET request router to read a Note by ID.
* @params {req, res, next}
*/
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findOne({ _id: id, userId })
    .populate('tags')
    .populate('folders')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});


/** ========== POST/CREATE A NOTE ============================
 * @description POST request router to create a Note.
 * @params {req, res, next}
 */
router.post('/', (req, res, next) => {
  const { title, content, tags, folders } = req.body;
  const userId = req.user.id;
  // const newNote = { title, content, userId, folders, tags };

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  Promise.all([
    createNonExistingTags(tags, userId),
    createNonExistingFolders(folders, userId),
    // validateTagIds(tags, userId),
    // validateFolderIds(folders, userId)
  ])
    .then((values) => {
      console.log('VALUES', values);
      let tagValues = values[0];
      let folderValues = values[1];
      let newNote = {
        userId,
        title,
        content,
        tags: tagValues,
        folders: folderValues
      }
      return Note.create(newNote);
    })
    .then(result => {
      console.log('Note POST result:', result);
      res.json(result);
    })
    .catch(err => {
      console.error(err);
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, content, folderId, tags } = req.body;
  const userId = req.user.id;
  const updateNote = { title, content, userId, folderId, tags };

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (mongoose.Types.ObjectId.isValid(folderId)) {
    updateNote.folderId = folderId;
  }

  Promise.all([
    validateFolderIds(folderId, userId),
    validateTagIds(tags, userId)
  ])
    .then(() => {
      return Note.findByIdAndUpdate(id, updateNote, { new: true })
        .populate('tags');
    })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err === 'InvalidFolder') {
        err = new Error('The folder is not valid');
        err.status = 400;
      }
      if (err === 'InvalidTag') {
        err = new Error('The tag is not valid');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== PATCH/UPDATE A SINGLE ITEM ========== */
/** NEEDS REFACTOR FOR FOLDERS AND OTHER STUFF */
router.patch('/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, content, folderId, tags } = req.body;
  const userId = req.user.id;
  const updatedNote = { title, content, userId, folderId, tags };

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (mongoose.Types.ObjectId.isValid(folderId)) {
    updatedNote.folderId = folderId;
  }

  Promise.all([
    validateFolderId(folderId, userId),
    validateTagIds(tags, userId)
  ])
    .then(() => {
      return Note.findByIdAndUpdate(id, updatedNote, { new: true })
        .populate('tags');
    })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err === 'InvalidFolder') {
        err = new Error('The folder is not valid');
        err.status = 400;
      }
      if (err === 'InvalidTag') {
        err = new Error('The tag is not valid');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findOneAndRemove({ _id: id, userId })
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
