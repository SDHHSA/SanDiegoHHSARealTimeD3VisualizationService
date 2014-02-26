#!/usr/bin/env python
# -*- coding: utf-8 -*-

import collections
import functools
import copy
import re

import requests
import flask
from flask.ext.classy import FlaskView, route

import analysis
import json




def support_jsonp(json):
    '''Optionally enables support for jsonp, if requested.'''
    callback = flask.request.args.get('callback', False)
    if callback:
        content = str(callback) + '(' + json + ')'
        return flask.current_app.response_class(content, mimetype='application/json')
    else:
        return json
        
def rank_words(words, n):
    boring = {'the', 'of', 'a', 'an', 'or', 'some', 'will', 'and', 'for', 
        'should', 'would', 'did', 'does', 'do', 'but', 'yet', 'nor', 'it', 'was', '',
        'its', 'we', 'all', 'in', 'to', 'us', 'so'}
    clean = re.sub('[.,-;:]', ' ', words.lower())
    clean = re.sub('[^a-z0-9 ]', '', clean)
    clean = [a for a in clean.split(' ') if a not in boring] 
    # I can't convert 'clean' to a set, since then it would squash duplicate 
    # occurances of a word.
    return collections.Counter(clean).most_common(n)
    
    
class SurveyView(FlaskView):
    def __init__(self):
        super(FlaskView, self).__init__()

    def index(self):
        return 'TODO: Write up instructions'
        
    @route('<survey_id>/')
    def get(self, survey_id):
        return flask.render_template('submit.html')
        
    @route('<survey_id>/discover/')
    def discover(self, survey_id):
        response = requests.post(analysis.DB_URL + r"/dataset/allSurveys", data={"survey_id": survey_id})
        return support_jsonp(flask.json.dumps(response.json()))
            
    @route('<survey_id>/analytics/')
    def analytics(self, survey_id):
        survey = analysis.Survey(survey_id)
        results = analysis.ResultsView(survey)
        return support_jsonp(flask.json.dumps(results.json()))
            
    @route('<survey_id>/report/')
    def report(self, survey_id):
        survey = analysis.Survey(survey_id)
        results = analysis.ResultsView(survey)
        return flask.render_template('report.html', results=results, survey_id=survey_id)
    
    @route('<survey_id>/question/<question_id>/')
    def get(self, survey_id, question_id):
        survey = analysis.Survey(survey_id)
        results = analysis.ResultsView(survey)
        master = results.find_question(question_id)
        similar = [result for result in results.questions if result['type'] == master['type']]
        
        return flask.render_template('question.html', result=master)
        
    @route('<survey_id>/question/<question_id>/suggest/')
    def suggest(self, survey_id, question_id):
        survey = analysis.Survey(survey_id)
        results = analysis.ResultsView(survey)
        master = results.find_question(question_id)
        similar = [result for result in results.questions if result['type'] == master['type']]
        
        return 'Return similar questions to {0}'.format(question_id)
        
    @route('<survey_id>/question/<question_id>/<other_id>/')
    def combine(self, survey_id, question_id, other_id):
        return 'Return a combination of {0} and {1}'.format(question_id, other_id)
        

application = flask.Flask(__name__, static_folder='static')
app = application
app.secret_key = ',*\xee\xd6tJ1Ja\xc8D\x9d!-\xa2k\xb6K\x9e\xb8\xff\xd7z\xc3'
SurveyView.register(app)
    
if __name__ == '__main__':    
    application.run(debug=True)
    
    