'use strict';

/*
 Put any interaction code here
 */

window.addEventListener('load', function () {
    // You should wire up all of your event handling code here, as well as any
    // code that initiates calls to manipulate the DOM (as opposed to responding
    // to events)

    console.log("Hello world!");

    var activityStoreModel = new ActivityStoreModel();
    var graphModel = new GraphModel();

    makeUI();

    var inputTab = document.getElementById('input_tab');
    var analysisTab = document.getElementById('analysis_tab');
    var submitButton = document.getElementById('submit_button');
    var inputDiv = document.getElementById('input_div');
    var analysisDiv = document.getElementById('analysis_div');
    var tableDiv = document.getElementById('table_div');
    var selectViewForm = document.getElementById('select_view_form');
    var chartDiv = document.getElementById('chart_div');
    var barChartMetricsDiv = document.getElementById('bar_chart_metrics_div');
    var invalidTimeErrorCaught = false;

    activityStoreModel.addListener(function (eventType, eventTime, activityData) {
        var durationTd = document.getElementById(activityData.activityType);
        durationTd.innerHTML = activityStoreModel.getActivityTotalDuration(activityData.activityType);

        var lastDataEntry = document.getElementById('last_data_entry');
        lastDataEntry.innerHTML = eventTime;
    });

    graphModel.addListener(function (eventType, eventTime, eventData) {
        if (activityStoreModel.getActivityDataPoints().length === 0) {
            drawNoDataAvailable();
        } else if (eventData === 'pie_chart') {
            drawPieGraph(activityStoreModel);
        } else {
            drawBarGraph(activityStoreModel, selectViewForm.elements['metrics'].value);
        }
    });

    inputTab.addEventListener("click", function () {
        inputTab.className = "active";
        analysisTab.className = "";
        analysisDiv.style.display = "none";
        inputDiv.style.display = "inherit";
    });

    analysisTab.addEventListener("click", function () {
        var selection = selectViewForm.elements['analysis_select_view'].value;

        analysisTab.className = "active";
        inputTab.className = "";
        inputDiv.style.display = "none";
        analysisDiv.style.display = "inherit";
        if (selection !== 'table') {
            graphModel.reDraw();
        }

    });

    selectViewForm.addEventListener("change", function () {
        var selection = selectViewForm.elements['analysis_select_view'].value;
        if (selection === 'table') {
            tableDiv.style.display = "initial";
            chartDiv.style.display = "none";
            barChartMetricsDiv.style.display = "none";
        } else {
            tableDiv.style.display = "none";
            chartDiv.style.display = "initial";
            if (graphModel.getNameOfCurrentlySelectedGraph() === selection) {
                graphModel.reDraw();
            } else {
                graphModel.selectGraph(selection);
            }
            if (selection === 'bar_chart') {
                barChartMetricsDiv.style.display = "inherit";
            } else {
                barChartMetricsDiv.style.display = "none";
            }
        }
    });

    submitButton.addEventListener("click", function () {
        var form = document.getElementById('activity_data_form');
        var duration = form.elements['time'].value;
        if (!/^\+?([1-9]\d*)$/.test(duration)) {
            if (!invalidTimeErrorCaught) {
                alertInvalidTimeError();
                invalidTimeErrorCaught = true;
            }
        } else {
            var ad = new ActivityData(form.elements['activity'].value,
                {
                    energy: parseFloat(form.elements['energy'].value),
                    stress: parseFloat(form.elements['stress'].value),
                    happiness: parseFloat(form.elements['happiness'].value)
                },
                parseFloat(form.elements['time'].value));
            activityStoreModel.addActivityDataPoint(ad);
            console.log(activityStoreModel.getActivityDataPoints());
            document.getElementById('invalid_time_error_div').innerHTML = "";
            invalidTimeErrorCaught = false;
        }

    });
});
