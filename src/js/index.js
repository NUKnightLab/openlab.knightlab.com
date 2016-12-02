// Load Packages
var Tabletop = require('tabletop');
var _ = require('lodash');
var moment = require('moment');

// Set up DOM Elements
var eventsListDOM = document.querySelector('#events-list');
var lightningTalksArchiveDOM = document.querySelector('#lightning-talks-archive');

// Load Handlebars partials
var eventsListTemplate = require("./../templates/partials/events-list.hbs");
var lightningTalksTemplate = require("./../templates/partials/lightning-talks-archive.hbs");

// Set up global variables
var moment = require('moment');
var publicSpreadsheetURL= "https://docs.google.com/spreadsheets/d/14AioGTfHHIRz-u3zoJJeqXq0B66yyq72BCZFXccOhhw/pubhtml";
var copy = false;
var staticCopy = require('json-loader!../data/static-copy.json');

// Initialize the code by starting Tabletop
Tabletop.init({key: publicSpreadsheetURL, callback: onLoad});

function onLoad(data, tabletop) {
    copy = data;
    copy.events = processEventsSheet(data.events.elements);
    updateDOM();
}

function updateDOM() {
    eventsListDOM.innerHTML = eventsListTemplate(copy.events);
    lightningTalksArchiveDOM.innerHTML = lightningTalksTemplate(copy["lightning-talks-archive"]);
    enableButtons();
}

function processEventsSheet(sheet) {
    newEventsSheet = {thisWeekEvents: [], upcomingEvents: [], archivedEvents: []};

    for (let event of sheet) {
        var newEvent = event;

        attatchEventMetadata(newEvent);
        processEventDateTime(newEvent);
        newEvent.datetimeString = createEventDateTimeString(newEvent);
        
        if (newEvent.thisWeek) { 
            newEventsSheet.thisWeekEvents.push(newEvent); 
        } else if (newEvent.archived) {
            newEventsSheet.archivedEvents.push(newEvent);
        } else { 
            newEventsSheet.upcomingEvents.push(newEvent);
        }
    }
    return newEventsSheet;
}

function attatchEventMetadata(evt) {
    evt.meta = false;
    for (let eventType of staticCopy.eventTypes) {
        if (evt.type == eventType.slug) { evt.meta = eventType; }

        if (evt.customEmoji) { 
            evt.emoji = evt.customEmoji; 
        } else if (evt.meta && evt.meta.emoji) {
            evt.emoji = evt.meta.emoji; 
        } else {
            evt.emoji = "&#x1f5d3;";
        }

        if (!evt.location && evt.meta.location) { evt.location = evt.meta.location; }
        if (!evt.time && evt.meta.time) { evt.time = evt.meta.time; }

        if (evt.buttonLink) {
            if (evt.customButtonText) {
                evt.buttonText = evt.customButtonText;
            } else if (evt.meta.buttonText) { 
                evt.buttonText = evt.meta.buttonText; 
            } else { 
                evt.buttonText = "Learn more";
            }
        }
    }
}

function processEventDateTime(evt) {
    evt.moment = moment(evt.date);
    evt.thisWeek = (evt.moment.isSameOrAfter(moment(), 'day') && evt.moment.isSameOrBefore(moment(), 'week'));
    evt.archived = evt.moment.isBefore(moment(), 'day');
}

function createEventDateTimeString(evt) {
    var str = '';
    if (evt.thisWeek) {
        str = evt.moment.format('dddd');
    } else {
        str = evt.moment.format('MMMM M');
    }
    if (evt.time) { str += ", " + evt.time; }
    return str;
}

function enableButtons() {
    showArchivesButton = document.querySelector('#show-archives-btn');
    archiveListDOM = document.querySelector('#archives-list');
    showArchivesButton.addEventListener('click', function() {
        archiveListDOM.style.display = "block";
    });

    showLightningTalksListButton = document.querySelector('#show-ligtning-talks-btn');
    lightningTalksListDOM = document.querySelector('#lightning-talks-list');
    showLightningTalksListButton.addEventListener('click', function() {
        lightningTalksListDOM.style.display = "block";
    });
}
