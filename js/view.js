'use strict';

// Put your view code here (e.g., the graph renderering code)
var AbstractView = function () {
};

_.extend(AbstractView.prototype, {
    _instantiateInterface: function (templateId, attachToElement) {
        var template = document.getElementById(templateId);
        this.hostElement = document.createElement('div');
        this.hostElement.innerHTML = template.innerHTML;
        attachToElement.appendChild(this.hostElement);
    }
});

var RadioButtonView = function (attachToElement, name, descriptions) {
    this._instantiateInterface('radio_button_template', attachToElement);
    var children = attachToElement.getElementsByTagName('input');
    for (var i = 0; i < children.length; i++) {
        children[i].setAttribute('name', name);
    }
    attachToElement.getElementsByTagName('span')[0].innerHTML = descriptions;
};
_.extend(RadioButtonView.prototype, AbstractView.prototype);

var InvalidTimeErrorView = function (attachToElement) {
    this._instantiateInterface('invalid_time_error_template', attachToElement);
};
_.extend(InvalidTimeErrorView.prototype, AbstractView.prototype);

var TableView = function (attachToElement) {
    var table = document.createElement('table');
    attachToElement.appendChild(table);
    table.className = "table table-striped table-bordered";

    var tableBody = document.createElement('tbody');
    table.appendChild(tableBody);

    var row = document.createElement('tr');
    tableBody.appendChild(row);
    var first = document.createElement('th');
    var second = document.createElement('th');
    row.appendChild(first);
    row.appendChild(second);

    first.innerHTML = "Activity Types";
    second.innerHTML = "Time Spent (in Minutes)";

    for (var i = 0; i < ACTIVITIES.length; i++) {
        row = document.createElement('tr');
        tableBody.appendChild(row);

        first = document.createElement('td');
        second = document.createElement('td');
        row.appendChild(first);
        row.appendChild(second);

        first.innerHTML = ACTIVITIES[i];
        second.setAttribute('id', ACTIVITIES[i]);
        second.innerHTML = "0";
    }
};

function drawPieGraph(activityStoreModel) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var colors = ["#5CADFF", "#75A319", "#FFAC30", "#FF4719", "#FFA3D1", "#8533D6"];

    var width = canvas.width;
    var height = canvas.height;

    context.clearRect(0, 0, width, height);

    var activityDurations = _.map(ACTIVITIES, activityStoreModel.getActivityTotalDuration, activityStoreModel);
    var totalDuration = _.reduce(activityDurations, function (memo, duration) {
        return memo + duration;
    });
    var activityDurationPct = _.map(activityDurations, function (duration) {
        return duration / totalDuration;
    });

    var prevAngle = 0;
    var prevLegendYPos = height / 10;

    context.font = height/15 + 'px Arial';
    context.textAlign = 'center';
    context.fillStyle = 'black';
    context.fillText("Activity Durations by Type", width/2, height/15);
    context.textAlign = 'start';
    for (var i = 0; i < activityDurationPct.length; i++) {
        context.beginPath();
        context.fillStyle = colors[i];
        context.font = height / 20 + "px Arial";
        context.moveTo(width * 2 / 3, height / 2);
        context.arc(width * 2 / 3, height / 2, height / 3, prevAngle, prevAngle += 2 * Math.PI * activityDurationPct[i]);
        context.lineTo(width * 2 / 3, height / 2);
        context.fill();
        context.fillRect(0, prevLegendYPos += height / 10, height / 20, height / 20);
        context.fillText(ACTIVITIES[i], height / 10, prevLegendYPos + height / 20);
    }
}

function drawBarGraph(activityStoreModel, activityMetric) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var colors = ["#5CADFF", "#75A319", "#FFAC30", "#FF4719", "#FFA3D1", "#8533D6"];
    var width = canvas.width;
    var height = canvas.height;
    var prevLegendYPos = height / 10;
    var activityData = activityStoreModel.getActivityDataPoints();
    var rawLevels = {};

    _.each(ACTIVITIES, function (activityType) {
        rawLevels[activityType] = {};
        rawLevels[activityType].total = 0;
        rawLevels[activityType].size = 0;
    });

    for (var i = 0; i < activityData.length; i++) {
        rawLevels[activityData[i].activityType].total += activityData[i].activityDataDict[activityMetric];
        rawLevels[activityData[i].activityType].size++;
    }

    context.clearRect(0, 0, width, height);
    context.font = height/15 + 'px Arial';
    context.textAlign = 'center';
    context.fillStyle = 'black';
    context.fillText("Activity "+ activityMetric.charAt(0).toUpperCase() + activityMetric.slice(1) +" Level by Type", width/2, height/15);
    context.textAlign = 'start';

    for (i = 0; i < ACTIVITIES.length; i++) {
        var avg = rawLevels[ACTIVITIES[i]].total / rawLevels[ACTIVITIES[i]].size || 0;
        context.fillStyle = colors[i];
        context.font = height / 20 + "px Arial";
        context.fillRect(width * 9 / 20, prevLegendYPos += height / 10, width / 10 * avg, height / 20);
        context.fillText(ACTIVITIES[i], height / 10, prevLegendYPos + height / 22);
        context.fillText(avg, width / 10 * avg + width / 2, prevLegendYPos + height / 22);
    }

    context.fillStyle = 'black';
    context.beginPath();
    context.moveTo(width * 9 / 20, height / 8);
    context.lineTo(width * 9 / 20, height * 7 / 8);
    context.stroke();

}

function drawNoDataAvailable() {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    context.clearRect(0, 0, width, height);
    context.font = height/15 + 'px Arial';
    context.textAlign = 'center';
    context.fillStyle = '#DADADA';
    context.fillText("No Data Available", width/2, height/2);
}

function makeUI() {
    var energyLevelView = new RadioButtonView(document.getElementById('energy_level'), 'energy', "(1=exhausted, 5=very awake)");
    var stressLevelView = new RadioButtonView(document.getElementById('stress_level'), 'stress', "(1=very stressed, 5=very relaxed)");
    var happinessLevelView = new RadioButtonView(document.getElementById('happiness_level'), 'happiness', "(1=depressed, 5=very happy)");
    var tableView = new TableView(document.getElementById('table_div'));
}

function alertInvalidTimeError() {
    var invalidTimeErrorView = new InvalidTimeErrorView(document.getElementById('invalid_time_error_div'));
}