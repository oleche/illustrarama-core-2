const News = require('../model/news');
const sitemap = require('../service/sitemap');

exports.upload = (req, res) => {
    sitemap.sitemap(News, (err) => {
        if (err) {
            res.status(500).send('Error generating sitemap');
        } else {
            res.setHeader('Content-Type', 'application/xml');
            res.status(200).send('Sitemap generated successfully');
        }
    });
}