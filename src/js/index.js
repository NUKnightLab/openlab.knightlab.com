var Tabletop = require('tabletop');
var lightningTalkTemplate = require("./../templates/partials/lightning-talk-archive.hbs");

var publicSpreadsheetURL= "https://docs.google.com/spreadsheets/d/14AioGTfHHIRz-u3zoJJeqXq0B66yyq72BCZFXccOhhw/pubhtml"

Tabletop.init({key: publicSpreadsheetURL, callback: onLoad});

function onLoad(data, tabletop) {
    console.log(data);
    lightningTalkArchiveDOM = document.querySelector('#lightning-talk-archive');
    console.log(lightningTalkArchiveDOM);
    lightningTalkArchiveDOM.innerHTML = lightningTalkTemplate(data["lightning-talk-archive"])
}
