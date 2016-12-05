// Load Packages
var Tabletop = require('tabletop');
var _ = require('lodash');
var moment = require('moment');

// Set up DOM Elements
var upcomingEventsPanelDOM = document.querySelector('#upcoming-events-panel');
var eventsListFullDOM = document.querySelector('#events-list-full');
var lightningTalksArchiveDOM = document.querySelector('#lightning-talks-archive');

// Load Handlebars partials
var upcomingEventsPanelTemplate = require("./../templates/partials/events-list-small.hbs");
var eventsListFullTemplate = require("./../templates/partials/events-list-full.hbs");
var lightningTalksTemplate = require("./../templates/partials/lightning-talks-archive.hbs");

// Set up global variables
var moment = require('moment');
var publicSpreadsheetURL= "https://docs.google.com/spreadsheets/d/14AioGTfHHIRz-u3zoJJeqXq0B66yyq72BCZFXccOhhw/pubhtml";
var copy = false;
var staticCopy = require('json-loader!../data/static-copy.json');

// Initialize the code by starting Tabletop
console.time("tabletop");
Tabletop.init({key: publicSpreadsheetURL, callback: onLoad});

function onLoad(data, tabletop) {
    console.timeEnd("tabletop");
    console.time("process");
    copy = data;
    copy.events = processEventsSheet(data.events.elements);
    console.timeEnd("process");
    updateDOM();
}

function updateDOM() {
    console.time("render");
    upcomingEventsPanelDOM.innerHTML = upcomingEventsPanelTemplate(copy.events);
    eventsListFullDOM.innerHTML = eventsListFullTemplate(copy.events);
    console.timeEnd("render");
    // lightningTalksArchiveDOM.innerHTML = lightningTalksTemplate(copy["lightning-talks-archive"]);
    enableButtons();
}

function processEventsSheet(sheet) {
    newEventsSheet = {thisWeekEvents: [], upcomingEvents: [], archivedEvents: [], nextThreeEvents: []};

    for (let event of sheet) {
        var newEvent = event;

        attatchEventMetadata(newEvent);
        processEventDateTime(newEvent);
        newEvent.datetimeString = createEventDateTimeString(newEvent);
        newEvent.slug = slugifyEvent(newEvent);

        if (newEvent.thisWeek) {
            newEventsSheet.thisWeekEvents.push(newEvent);
        } else if (newEvent.archived) {
            newEventsSheet.archivedEvents.push(newEvent);
        } else {
            newEventsSheet.upcomingEvents.push(newEvent);
        }
    }

    if (newEventsSheet.thisWeekEvents.length > 3) {
        newEventsSheet.nextThreeEvents = thisWeekEvents.slice(0, 3)
    } else {
        newEventsSheet.nextThreeEvents = newEventsSheet.thisWeekEvents.concat(newEventsSheet.upcomingEvents.slice(0, 3 - newEventsSheet.thisWeekEvents.length));
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

function slugifyEvent(evt) {
    // TODO: THIS FUNCTION DOESN'T REALLY work
    // See this for guidance: https://gist.github.com/onyxfish/db112abb8c1d8a5018e5
    value = evt.name.toLowerCase();
    value = value.replace(/[^\w\s-]/g, '');
    value = value.replace(/\s+/g, '-');
    return value;
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

    // showLightningTalksListButton = document.querySelector('#show-ligtning-talks-btn');
    // lightningTalksListDOM = document.querySelector('#lightning-talks-list');
    // showLightningTalksListButton.addEventListener('click', function() {
    //     lightningTalksListDOM.style.display = "block";
    // });
}
