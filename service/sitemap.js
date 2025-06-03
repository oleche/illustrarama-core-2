const fs = require('fs');
const database = require('../config/database');

exports.sitemap = (newsModel, cb) => {
    newsModel.find({})
        .then(articles => {
            console.log(`Sitemap generator found ${articles.length} articles in the database.`);
            const allArticlesES = articles.filter(a => a.lang === 'ES');
            const allArticlesNL = articles.filter(a => a.lang === 'NL');
            const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
        <url>
            <loc>${database.site_url}/</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>
        <url>
            <loc>${database.site_url}/about</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.8</priority>
        </url>
        <url>
            <loc>${database.site_url}/contact</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.8</priority>
        </url>
        <url>
            <loc>${database.site_url}/privacy</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>yearly</changefreq>
            <priority>0.5</priority>
        </url>
        <url>
            <loc>${database.site_url}/comments-policy</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>yearly</changefreq>
            <priority>0.5</priority>
        </url>
    ${[...allArticlesES, ...allArticlesNL].map(article => `  <url>
            <loc>${database.site_url}/article/${getArticleSlug(article.title)}-${article._id}</loc>
            <lastmod>${new Date(article.updatedAt || article.published).toISOString()}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.9</priority>
        </url>`).join('\n')}
    </urlset>
    `;

            fs.writeFile('/var/www/html/illustrarama-assets/sitemap.xml', sitemap, { flag: 'w' }, (err) => cb(err));
        })
        .catch((err) => {
            cb(err);
        });
}

const getArticleSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60);
  };