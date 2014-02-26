function BarChart(target, question) {
    'use strict';
    this.target = target;
    this.question = question;
    this.previous = [];
}

BarChart.prototype.createChart = function (data) {
    'use strict';
    data = this.prepareData(data);

    this.chart = nv.models.discreteBarChart()
        .x(function (d) { return d.label; })
        .y(function (d) { return d.value; })
        .staggerLabels(false)
        .tooltips(true)
        .showValues(true);
        
    nv.utils.windowResize(this.chart.update);
    nv.addGraph(this.chart);
};

BarChart.prototype.update = function (data) {
    'use strict';
    
    data = this.prepareData(data);
    
    d3.select(this.target)
        .datum(data)
        .transition().duration(500)
        .call(this.chart);
};

BarChart.prototype.prepareData = function (data) {
    'use strict';
    
    var arr = [];
    var i;
    for (i in data) {
        arr.push({ "label": i, "value": data[i] });
    }
    
    return [{
        key: this.question,
        values: arr
    }];
};

// ------------

function PieChart(target, question) {
    'use strict';
    this.target = target;
    this.question = question;
    this.previous = [];
}

PieChart.prototype.createChart = function (data) {
    'use strict';
    data = this.prepareData(data);
    
    this.chart = nv.models.pieChart()
        .x(function (d) { return d.label; })
        .y(function (d) { return d.value; })
        .showLabels(true);
        
    nv.utils.windowResize(this.chart.update);
    nv.addGraph(this.chart);
};

PieChart.prototype.update = function (data) {
    'use strict';
    data = this.prepareData(data);
    
    d3.select(this.target)
        .datum(data)
        .transition().duration(500)
        .call(this.chart);
};

PieChart.prototype.prepareData = function (data) {
    'use strict';
    var arr = [];
    var i;
    for (i in data) {
        arr.push({ "label": i, "value": data[i] });
    }
    
    return arr;
};

// --------

function WordCloud(target, question) {
    'use strict';
    
    this.target = target;
    this.question = question;
    this.previous = [];
}

WordCloud.prototype.createChart = function (data) {
    'use strict';
    this.chart = d3.layout.cloud()
        .words(data)
        .padding(5)
        .rotate(function() { return ~~(Math.random() * 2) * 0; })
        .font("Impact")
        .fontSize(function(d) { return d.size; });
};

WordCloud.prototype.update = function (data) {
    'use strict';
    
    d3.select(this.target).text('');

    var fill = d3.scale.category20();
    
    function draw(words) {
        d3.select(this.target)
            .attr("width", 400)
            .attr("height", 300)
          .append("g")
            .attr("transform", "translate(150,150)")
          .selectAll("text")
            .data(words)
          .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Impact")
            .style("fill", function(d, i) { return fill(i); })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
    }
            
    this.chart
        .words(data)
        .on("end", draw)
        .start();    
};

WordCloud.prototype.prepareData = function (data) {
    'use strict';
    return data.map(function (t) { 
        return {
            "text": t[0],
            "size": Math.min(10 + t[1] * 20, 100)
        };
    });
};

// ------------------------

function StackedBarChart(target, questions) {
    'use strict';
    this.target = target;
    this.questions = questions;
    this.previous = [];
}

StackedBarChart.prototype.createChart = function (datas) {
    'use strict';
    this.chart = nv.models.multiBarChart();
    nv.utils.windowResize(this.chart.upgrade);
    nv.addGraph(this.chart);
};

StackedBarChart.prototype.update = function(datas) {
    'use strict';
    var stream = datas.map(function (data, index) {
        return { key: this.questions[index], value: data };
    });
    
    d3.select(this.target)
        .datum(stream)
        .transition()
        .duration(500)
        .call(this.chart);
        
    nv.utils.windowResize(this.chart.update);
};

// ---------------------

function StackedAreaData(target, questions) {
    'use strict';
    this.target = target;
    this.questions = questions;
    this.previous = [];
}

StackedAreaData.prototype.createChart = function (datas) {
    'use strict';
    this.chart = nv.models.stackedAreaChart()
        .x(function (d) { return d[0]; })
        .y(function (d) { return d[1]; })
        .clipEdge(true);
        
    nv.utils.windowResize(this.chart.update);
    nv.addGraph(this.chart);
};

StackedAreaData.prototype.update = function (datas) {
    'use strict';
    var stream = datas.map(function (data, index) {
        return { key: this.questions[index], value: data };
    });
    
    d3.select(this.target)
        .datum(stream)
        .transition()
        .duration(500)
        .call(this.chart);
        
    nv.utils.windowResize(this.chart.update);
};

// ---------------------

function LiteralText(target, question) {
    'use strict';
    this.target = target;
    this.question = question;
    this.previous = [];
}

LiteralText.prototype.createChart = function (data) {
    'use strict';
    alert(data);
    $(this.target).html(JSON.stringify(data));
    
};

LiteralText.prototype.update = function (data) {
    'use strict';
    $(this.target).html(JSON.stringify(data));
};


// ---------------------

function Updater(survey_id, updateSpeed) {
    'use strict';
    this.survey_id = survey_id;
    this.updateSpeed = updateSpeed;
    this.charts = {};
    this.associations = {
        'single selection': {
            'bar': BarChart, 
            'pie': PieChart,
            'text': LiteralText
        },
        'multiple selection': {
            'bar': BarChart,
            'text': LiteralText
        },
        'list question': {
            'bar': BarChart, 
            'pie': PieChart,
            'text': LiteralText
        },
        'short text': {
            'word cloud': WordCloud,
            'text': LiteralText
        },
        'paragraph text': {
            'word cloud': WordCloud,
            'text': LiteralText
        }
    };
    
    this.defaults = {
        'single selection': 'pie',
        'multiple selection': 'bar',
        'list question': 'bar',
        'short text': 'word cloud',
        'paragraph text': 'word cloud'
    }
}

Updater.prototype.attach = function (target, question, type, defaultDisplay) {
    'use strict';
    
    if (defaultDisplay === null) {
        defaultDisplay = this.defaults[type];
    }
    
    var options = $("#" + target + " .view-change");
    
    this.launchChart(type, defaultDisplay, target, question);
    
    var self = this;
    options.change(function () {
        self.launchChart(type, this.value, target, question);
    });
    
    options.append('<option value="' + defaultDisplay + '">' + defaultDisplay + '</option>');
    
    var view;
    for (view in this.associations[type]) {
        if (view !== defaultDisplay) {
            options.append('<option value="' + view + '">' + view + '</option>');
        }
    }  
};

Updater.prototype.launchChart = function (type, desiredView, target, question) {
    'use strict'
    var selectorTarget = '#' + target + ' .chart svg';
    $(selectorTarget).empty();
    var chart = new this.associations[type][desiredView](selectorTarget, question);
    chart.createChart('test');
    
    this.charts[target] = chart;
};

Updater.prototype.start = function () { 
    'use strict';
    var survey_id = this.survey_id;
    var charts = this.charts;
    
    function update() {
        $.ajax({
            url: '/survey/' + survey_id + '/analytics', 
            dataType: "json",
            success: function(json) {
                var index;
                for (index in json.results) {
                    var question = json.results[index];
                    charts[question.unique_id].update(question.answers);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                //alert(textStatus + " | " + errorThrown);
            }
        });
    }
    
    // force a refresh at the start.
    update();
    setInterval(update, this.updateSpeed);
};
