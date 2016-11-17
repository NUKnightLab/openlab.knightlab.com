var _ = require('lodash'),
    fm = require('front-matter'),
    yml = require('yamljs'),
    fs = require('fs-extra'),
    path = require('path'),
    Handlebars = require('handlebars'),
    globby = require('globby'),
    debug = require('./helpers/debug-hbs.js'),
    helper = require('./helpers/partial-builder.js')
    config = require('./../config')

//run Helpers
helper.getPartial(Handlebars, 'src/templates/partials/');
var data = getData(config.copyFile);

function getData(file) {
    fileName = path.basename(file, '.yml');
    return yml.load(file);
}

function renderTemplate(templatePath, data) {
  var file = fs.readFileSync(templatePath, 'utf8'),
      frontMatter = fm(file),
      fmData = frontMatter.attributes,
      context = _.extend(fmData, data),
      template = Handlebars.compile(frontMatter.body);

  return template(context);
}

function renderPage(template, layout, data) {
  var file = fs.readFileSync(layout, 'utf8'),
      page = Handlebars.compile(file),
      context = _.extend({body: template}, data);

  return page(context);
}

function build(data) {
  var hbsTemplates = globby.sync('src/templates/**/*.hbs');

  _.forEach(hbsTemplates, function(file, i) {
    var filePattern = path.dirname(file).split('src/templates/')[1],
        fileName = path.basename(file, '.hbs'),
        template = renderTemplate(file, data),
        page = renderPage(template, 'src/templates/layouts/default.hbs', data);

    if(!!filePattern) {
      fs.outputFileSync(`dist/${filePattern}/${fileName}.html`)
    } else {
      fs.outputFileSync(`dist/${fileName}.html`, page, 'utf8');
    }
  });
}

build(data);
