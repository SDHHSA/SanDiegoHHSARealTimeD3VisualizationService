#!/usr/bin/env python

import itertools
import collections
import uuid

import requests

DB_URL = r"http://astelytics.nodejitsu.com"

# /dataset/allSurveys
#   survey_id
#
# /dataset/returnValues
#
# {
#   geo: [ lon, lat ],
#   maxdistance:
#   user_id:
#   survey_id:
#   time_begin: 
#   time_end: 



class Survey(object):
    def __init__(self, survey_id):
        assert(isinstance(survey_id, basestring))
        
        response = requests.post(DB_URL + r"/dataset/allSurveys", data={"survey_id": survey_id})
        self.survey = response.json()
        
        self.survey_id = survey_id
        self.hidden_id = self.survey[0][u'_id']
        self.title = self.survey[0][u'surveyTitle']
        self.user_id = self.survey[0][u'user_id']
        questions = [q[u'questions'] for q in self.survey if u'questions' in q]
        rotated_questions = zip(*questions)
        
        self.questions = []
        for questions in rotated_questions:
            self.questions.append(Question(
                questions[0][u'questionTitle'],
                [q[u'value'] for q in questions],
                questions[0][u'type']))
        
    def json(self):
        return self.survey
        
class Question(object):
    def __init__(self, question, answers, type):
        self.question = question
        self.unique_id = 'id-' + str(uuid.uuid5(uuid.NAMESPACE_DNS, question.encode('utf-16be')))
        self.answers = answers
        self.type = self._clean_type(type)
        
    def _clean_type(self, type):
        if type == u'st':
            return u'short text'
        elif type == u'pt':
            return u'paragraph text'
        elif type == u'ss':
            return u'single selection'
        elif type == u'mc':
            return u'multiple selection'
        elif type == u'list':
            return u'list question'
        else:
            return type
            
    def json(self):
        return {u'question': self.question, u'answers': self.answers, 
            u'type': self.type, u'unique_id': self.unique_id}
            
    
        
class ResultsView(object):
    def __init__(self, survey):
        self.survey = survey
        self.questions = [self._custom_questions(q) for q in self.survey.questions]
        
    def _custom_questions(self, question):
        return {
            u'question': question.question,
            u'type': question.type,
            u'unique_id': question.unique_id,
            u'answers': self._format_answers_by_type(question.type, question.answers)
        }
        
    def json(self):
        return {u'results': self.questions}
        
    def find_question(self, unique_id):
        return [result for result in self.questions if result['unique_id'] == unique_id][0]
        
    def _format_answers_by_type(self, type, answers):
        if type == u'single selection':
            clean = []
            for answer in answers:
                clean.extend([option for option in answer if answer[option] == u'true'])
            return dict(collections.Counter(clean))
        elif type == u'multiple selection':
            clean = []
            for answer in answers:
                clean.extend([option for option in answer if answer[option] == u'true'])
            return dict(collections.Counter(clean))
        else:
            return answers
        
    def _clean(self, answers):
        for answer in answers:
            for option in answer:
                if answer[option] == u'true':
                    yield option
                    break
        
        
        