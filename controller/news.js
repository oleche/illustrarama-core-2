const md5 = require('md5');
const fs = require('fs');
const fse = require('fs-extra');
const rq = require('request');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

const News = require('../model/news.js');
const NewsContent = require('../model/news-content.js');

function getUrlExtension(url) {
  const extension = url.split(/#|\?/)[0].split('.').pop().trim();
  if (extension.toLowerCase() === 'jpg' || extension.toLowerCase() === 'png' || extension.toLowerCase() === 'gif' || extension.toLowerCase() === 'bmp' || extension.toLowerCase() === 'tiff' || extension.toLowerCase() === 'svg') {
    return `.${extension}`;
  }
  return '';
}

function download(uri, localPath, filename) {
  rq.head(uri, (err, res) => {
    const content = res.headers['content-type'];
    fse.ensureDir(localPath, () => { // have removed err fronm this... add if needeed
      rq(uri).pipe(fs.createWriteStream(localPath + filename)).on('close', () => {
        if (content === 'image/jpeg' || content === 'image/png') {
          (async () => {
            await imagemin([localPath + filename], {
              destination: localPath,
              plugins: [
                imageminMozjpeg({ quality: 50 }),
                imageminPngquant({
                  quality: [0.5, 0.6],
                }),
              ],
            });
          })();
        }
      });
    });
  });
}

function findAllContents(news, cb) {
  NewsContent.find({ newsId: news._id.toString() }, (err, res) => {
    const newsObject = news.toObject();
    if (err) {
      newsObject.errors = 'With errors in sections';
    } else {
      newsObject.sections = [];
      if (Array.isArray(res)) {
        newsObject.sections = res;
      }
    }
    cb(newsObject);
  }).sort({ index: 1 });
}

// Create and Save a new Note
exports.create = (req, res) => {
  const token = req.header.authorization;
  // Create a Note
  const news = new News({
    title: req.body.title || 'Untitled',
    content: req.body.content,
    source: req.body.source || '',
    lang: req.body.lang || 'ES',
    origin: req.body.origin || '',
    img: req.body.img || '',
    categories: req.body.categories,
    keywords: req.body.keywords,
    keywordsString: req.body.keywordsString || '',
    published: req.body.published || Date.now(),
  });

  res.setHeader('Content-Type', 'application/json');

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  if (token !== 'Basic Z2Vla2Nvd2RldjpnaUdHbGVzMDk=') return res.status(401).send({ auth: false, message: 'Invalid credentials' });

  if (!req.body.content) {
    return res.status(400).send({
      message: 'Note content can not be empty',
    });
  }

  News.findOne({ source: req.body.source })
    .then((nu) => {
      if (nu === null) {
        // move the image from the source to the server
        if (news.img !== '') {
          const filename = `${Date.now()}${getUrlExtension(news.img)}`;
          const imagePath = `/var/www/html/illustrarama-assets/${md5(req.body.source)}/`;
          download(req.body.img, imagePath, filename);
          news.img = `https://assets.illustrarama.com/${md5(req.body.source)}/${filename}`;
        }

        news.save()
          .then((data) => {
            const newsData = data;
            if (req.body.sections !== undefined && Array.isArray(req.body.sections)) {
              req.body.sections.forEach((element) => {
                const newsSection = new NewsContent({
                  newsId: data._id.toString(),
                  content: element.content,
                  type: element.type || 'NONE',
                  source: element.source || '',
                  index: element.index || 0,
                  url: element.url || '',
                });

                if (newsSection.type === 'IMAGE' && newsSection.url !== '') {
                  const filename = `${md5(newsSection.url)}-${Date.now()}${getUrlExtension(newsSection.url)}`;
                  const imagePath = `/var/www/html/illustrarama-assets/${md5(req.body.source)}/`;
                  download(newsSection.url, imagePath, filename);
                  newsSection.url = `https://assets.illustrarama.com/${md5(req.body.source)}/${filename}`;
                }

                newsSection.save()
                  .then(() => {
                    if (newsData.addedContent === undefined) {
                      newsData.addedContent = 1;
                    } else {
                      newsData.addedContent += 1;
                    }
                  }).catch((err) => {
                    newsData.errors = err.message || 'With errors in sections';
                  });
              });
            }

            res.json(newsData);
          }).catch((err) => {
            res.status(500).send({
              message: err.message || 'Some error occurred while creating the entry.',
            });
          });
      } else {
        res.status(409).send({
          message: 'Duplicated entry',
        });
      }
    }).catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the entry.',
      });
    });
  return true;
};

exports.search = (req, res) => {
  const perPage = 20;
  const page = req.query.page || 1;
  const searchQuery = req.query.q;
  const query = {};

  res.setHeader('Content-Type', 'application/json');

  if (searchQuery === undefined || searchQuery === null) {
    return res.status(422).send({
      message: 'invalid search url, please add the proper parameter \'q\'',
    });
  }

  if (page < 0 || page === 0) {
    return res.status(422).send({
      message: 'invalid page number, should start with 1',
    });
  }
  query.skip = perPage * (page - 1);
  query.limit = perPage;

  const search = { $text: { $search: searchQuery } }; // Search in suburb;

  res.locals.news.find(search, {}, query).sort({ published: -1 }).exec((err, news) => {
  // if there is an error retrieving, send the error otherwise send data
    if (err) {
      return res.send(err);
    }
    return res.json(news); // return all employees in JSON format
  });

  return false;
};

// Retrieve and return all notes from the database.
exports.findAll = (req, res) => {
  const perPage = 20;
  const page = req.query.page || 1;
  const queryUrl = req.query.url;
  const queryTag = req.query.tag;
  const query = {};

  res.setHeader('Content-Type', 'application/json');

  if (page < 0 || page === 0) {
    return res.status(422).send({
      message: 'invalid page number, should start with 1',
    });
  }

  query.skip = perPage * (page - 1);
  query.limit = perPage;

  if (!queryUrl) {
    if (!queryTag) {
      res.locals.news.find({}, {}, query).sort({ published: -1 }).exec((err, news) => {
      // if there is an error retrieving, send the error otherwise send data
        if (err) {
          return res.send(err);
        }
        return res.json(news); // return all employees in JSON format
      });
      return false;
    }
    const categoryFilter = { categories: { $in: [queryTag] } };
    res.locals.news.find(categoryFilter, {}, query).sort({ published: -1 }).exec((err, news) => {
    // if there is an error retrieving, send the error otherwise send data
      if (err) {
        return res.send(err);
      }
      return res.json(news); // return all employees in JSON format
    });
    return false;
  }
  return News.findOne({ source: queryUrl })
    .then((news) => {
      if (!news) {
        return res.status(404).send({
          message: `Cannot find id ${queryUrl}`,
        });
      }
      return findAllContents(news, (n) => { res.json(n); });
    }).catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: `Cannot find id ${queryUrl}`,
        });
      }
      return res.status(500).send({
        message: `Error retrieving id ${queryUrl}`,
      });
    });
};

// Find a single note with a noteId
exports.findOne = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  News.findById(req.params.id)
    .then((news) => {
      if (!news) {
        return res.status(404).send({
          message: `Cannot find id ${req.params.id}`,
        });
      }
      findAllContents(news, (n) => {
        const post = n;
        News.findOne({ _id: { $gt: news._id } })
          .then((nu) => {
            post.next = nu;
            res.json(post);
          });
      });
      return false;
    }).catch((err) => {
      if (err.kind === 'ObjectId') {
        return res.status(404).send({
          message: `Cannot find id ${req.params.id}`,
        });
      }
      return res.status(500).send({
        message: `Error retrieving id ${req.params.id}`,
      });
    });
};

// Update a note identified by the noteId in the request - removed req, res
exports.update = () => {

};

// Update a note identified by the noteId in the request - removed req, res
exports.vote = () => {

};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
  const token = req.header.authorization;

  res.setHeader('Content-Type', 'application/json');

  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  if (token !== 'Basic Z2Vla2Nvd2RldjpnaUdHbGVzMDk=') return res.status(401).send({ auth: false, message: 'Invalid credentials' });

  if (!req.params.noteId) {
    return res.status(400).send({
      message: 'Note content can not be empty',
    });
  }

  News.findByIdAndRemove(req.params.noteId)
    .then((note) => {
      if (!note) {
        return res.status(404).send({
          message: `Note not found with id ${req.params.noteId}`,
        });
      }
      NewsContent.remove({ newsId: req.params.noteId }, (err) => {
        if (err) {
          return res.status(500).send({
            message: 'With errors in sections',
          });
        }
        return res.send({ message: 'Note deleted successfully!' });
      });
      return true;
    }).catch((err) => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        return res.status(404).send({
          message: `Note not found with id ${req.params.noteId}`,
        });
      }
      return res.status(500).send({
        message: `Could not delete note with id ${req.params.noteId}`,
      });
    });

  return true;
};
