//Useful for debugging handlebars code//
// Throw in {{debug}} in hbs template to see context

var Handlebars = require('handlebars');

Handlebars.registerHelper('debug', function(opt) {
    console.log("Current Context");
    console.log("====================");
    console.log(this);

    if (opt) {
      console.log("Value");
      console.log("====================");
      console.log(opt);
    }
})

Handlebars.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
