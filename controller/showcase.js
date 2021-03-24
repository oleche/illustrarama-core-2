const News = require('../model/news.js');
const NewsContent = require('../model/news-content.js');

function attachNewsMain(newsContent, cb) {
  News.findById(newsContent.newsId)
    .then((news) => {
      const newsContentObject = newsContent.toObject();
      newsContentObject.parent = {};
      if (!news) {
        newsContentObject.parent.errors = 'With errors in sections';
      } else {
        newsContentObject.parent = news;
      }
      cb(newsContentObject);
    }).catch((err) => {
      const newsContentObject = newsContent.toObject();
      newsContentObject.parent = {};
      if (err.kind === 'ObjectId') {
        newsContentObject.parent.errors = 'Cannot retrieve parent';
      } else {
        newsContentObject.parent.errors = `Error retrieving id ${newsContent.newsId}`;
      }
      cb(newsContentObject);
    });
}

exports.findAll = (req, res) => {
  const perPage = 20;
  const page = req.query.page || 1;
  const queryTag = req.query.tag;
  const querySearch = req.query.q;
  const query = {};

  res.setHeader('Content-Type', 'application/json');

  if (page < 0 || page === 0) {
    return res.status(422).send({
      message: 'invalid page number, should start with 1',
    });
  }

  query.skip = perPage * (page - 1);
  query.limit = perPage;

  if (!querySearch) {
    if (!queryTag) {
      const newsResult = [];
      const imageFilter = { type: 'IMAGE' };
      res.locals.newsContent.find(imageFilter, {}, query).sort({ newsId: -1 }).exec((err, newsContent) => {
        if (err) {
          return res.send(err);
        }
        let items = 0;
        newsContent.forEach((element, index, array) => {
          attachNewsMain(element, function(digested){
            newsResult.push(digested);
            items++;
            if(items === array.length) {
              return res.json(newsResult);
            }
          });
        });
      });
    }
  }
};

exports.findOne = (req, res) => {

};

exports.vote = (req, res) => {

};
