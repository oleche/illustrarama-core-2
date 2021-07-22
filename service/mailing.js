const sgMail = require('@sendgrid/mail');
const mustache = require('mustache');
const fs = require('fs');
const path = require('path');
const database = require('../config/database');

exports.welcome = (data) => {
  sgMail.setApiKey(database.sendgrid);

  fs.readFile(path.resolve(__dirname, 'templates/welcome.mustache'), (bodyErr, bodyData) => {
    if (bodyErr) { throw bodyErr; }
    const renderedMail = mustache.render(bodyData.toString(), { user: data });
    const msg = {
      to: data.email,
      from: 'Illustrarama.com <no-responder@illustrarama.com>',
      subject: '¡Bienvenido a illustrarama.com!',
      text: 'Bienvenido al mejor sitio de noticias de ilustración, diseño y arte! Si recibes este correo es porque has creado tu cuenta exito.',
      html: renderedMail,
    };
    sgMail.send(msg);
  });
}

exports.subscription = (data, newsModel) => {
  const query = {};
  query.limit = 4;

  sgMail.setApiKey(database.sendgrid);

  newsModel.find({}, {}, query).sort({ published: -1 }).exec((err, news) => {
    const newsItem = news;
    // if there is an error retrieving, send the error otherwise send data
    if (err) {
      throw (err);
    }

    let newsSection = '';

    fs.readFile(path.resolve(__dirname, 'templates/newsSection.mustache'), (e, contentData) => {
      if (e) { throw e; }

      const newsGroups = {
        news0: newsItem[0],
        news0Published: newsItem[0].published.toLocaleDateString('en-EN', { day: 'numeric', month: 'numeric', year: 'numeric' }),
        news1: newsItem[1],
        news1Published: newsItem[1].published.toLocaleDateString('en-EN', { day: 'numeric', month: 'numeric', year: 'numeric' }),
        news2: newsItem[2],
        news2Published: newsItem[2].published.toLocaleDateString('en-EN', { day: 'numeric', month: 'numeric', year: 'numeric' }),
        news3: newsItem[3],
        news3Published: newsItem[3].published.toLocaleDateString('en-EN', { day: 'numeric', month: 'numeric', year: 'numeric' }),
      };

      const rendered = mustache.render(contentData.toString(), newsGroups);
      newsSection = rendered;

      fs.readFile(path.resolve(__dirname, 'templates/subscribeEmail.mustache'), (bodyErr, bodyData) => {
        if (bodyErr) { throw bodyErr; }
        const renderedMail = mustache.render(bodyData.toString(), { section: newsSection });
        const msg = {
          to: data.email,
          from: 'Illustrarama.com <no-responder@illustrarama.com>',
          subject: '¡Bienvenido a illustrarama.com!',
          text: 'Bienvenido al mejor sitio de noticias de ilustración, diseño y arte! Si recibes este correo es porque te has suscrito con exito.',
          html: renderedMail,
        };
        sgMail.send(msg);
      });
    });
  });
};

exports.weekly = (newsModel, subscriptionModel) => {
  const query = {};
  query.limit = 8;

  sgMail.setApiKey(database.sendgrid);

  newsModel.find({}, {}, query).sort({ published: -1 }).exec((err, news) => {
    const newsItem = news;

    let newsSection = '';

    fs.readFile(path.resolve(__dirname, './templates/newsSectionSunday.mustache'), (e, data) => {
      if (e) { throw e; }

      const newsGroups = {
        news0: newsItem[0],
        news0Published: newsItem[0].published.toLocaleDateString('en-EN', { day: 'numeric', month: 'numeric', year: 'numeric' }),
        news1: newsItem[1],
        news1Published: newsItem[1].published.toLocaleDateString('en-EN', { day: 'numeric', month: 'numeric', year: 'numeric' }),
        news2: newsItem[2],
        news2Published: newsItem[2].published.toLocaleDateString('en-EN', { day: 'numeric', month: 'numeric', year: 'numeric' }),
        news3: newsItem[3],
        news3Published: newsItem[3].published.toLocaleDateString('en-EN', { day: 'numeric', month: 'numeric', year: 'numeric' }),
        news4: newsItem[4],
        news4Published: newsItem[4].published.toLocaleDateString('en-EN', { day: 'numeric', month: 'numeric', year: 'numeric' }),
        news5: newsItem[5],
        news5Published: newsItem[5].published.toLocaleDateString('en-EN', { day: 'numeric', month: 'numeric', year: 'numeric' }),
        news6: newsItem[6],
        news6Published: newsItem[6].published.toLocaleDateString('en-EN', { day: 'numeric', month: 'numeric', year: 'numeric' }),
        news7: newsItem[7],
        news7Published: newsItem[7].published.toLocaleDateString('en-EN', { day: 'numeric', month: 'numeric', year: 'numeric' }),
      };

      const rendered = mustache.render(data.toString(), newsGroups);
      newsSection = rendered;

      fs.readFile(path.resolve(__dirname, 'templates/sundayEmail.mustache'), (bodyErr, bodyData) => {
        if (bodyErr) { throw bodyErr; }
        subscriptionModel.find({}, {}, {}).sort({ email: -1 }).exec((er, subscriptions) => {
          subscriptions.forEach((subscription) => {
            const parameters = {
              section: newsSection,
              subscriptionId: subscription._id,
            };
            const renderedMail = mustache.render(bodyData.toString(), parameters);
            const msg = {
              to: subscription.email,
              from: 'Illustrarama.com <no-responder@illustrarama.com>',
              subject: 'Illustrarama.com | Tu resumen semanal',
              text: 'Te entregamos el resumen semana de las ultimas noticias de la semana',
              html: renderedMail,
            };
            sgMail.send(msg);
          });
        });
      });
    });
  });
};
