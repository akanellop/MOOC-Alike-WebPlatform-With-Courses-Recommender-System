import pandas as pd
import numpy as np
from pymongo import MongoClient
import sys 

#dcg function for evaluating recommendation rankings from 
def dcgfun(result):
    dcg = []
    for idx, val in enumerate(result): 
        numerator = 2**val - 1
        # add 2 because python 0-index
        denominator =  np.log2(idx + 2) 
        score = numerator/denominator
        dcg.append(score)
    return sum(dcg)

#connect to db
client = MongoClient('mongodb://127.0.0.1:27017/')
db = client.webappdbs


#given user for checking his ranking results
print("\n")
user = int(input("Please enter user id:\n"))

#number of times each content type appears in taken courses
counterVid = 0
counterAud = 0
counterScr = 0
counterLit = 0
counterExer = 0

#total score accumulated from each content type in taken courses
VideoScore = 0
AudioScore = 0
ScrScore = 0
LitScore = 0
ExerScore = 0

#number of times each content type appears in proposed courses
counterVidProp = 0
counterAudProp = 0
counterScrProp = 0
counterLitProp = 0
counterExerProp = 0

contents = []

for query in db.userinfo.find({'userid':user}):
   coursesTaken = query['courses']
   coursesProposed = query['proposed']

for course in coursesTaken:
   for userinfo in db.users.find({'userid':user,'courseid':course}):
      score = userinfo['score']
   for course  in db.courses.find({'courseid':course}):
      contents = (course['types_of_content'].split('|'))
      if('videos' in contents):
         counterVid+=1
         VideoScore += score
      if('audios' in contents):
         counterAud+=1
         AudioScore += score
      if('exercises' in contents):
         counterExer+=1
         ExerScore += score
      if('scripts' in contents):
         counterScr+=1
         ScrScore += score
      if('extraliterature' in contents):
         counterLit+=1
         LitScore += score


for course in coursesProposed:
   for course  in db.courses.find({'courseid':course}):
      contents = (course['types_of_content'].split('|'))
      if('videos' in contents):
         counterVidProp+=1
      if('audios' in contents):
         counterAudProp+=1
      if('exercises' in contents):
         counterExerProp+=1
      if('scripts' in contents):
         counterScrProp+=1
      if('extraliterature' in contents):
         counterLitProp+=1 

space = "                                "

print("            No Of Appearances In Taken Courses | Score | No Of Appearances In Proposed Courses | DCG")
print("            __________________________________________________________________________________________")
print('Video     : '+ str(counterVid)+space+str(VideoScore/10)+"      "+str(counterVidProp)+space+str(dcgfun([counterVid,(VideoScore/10)])))
print('Audio     : '+ str(counterAud)+space+str(AudioScore/10)+"      "+str(counterAudProp)+space+str(dcgfun([counterAud,(AudioScore/10)])))
print('Pdfs      : '+ str(counterScr)+space+str(ScrScore/10)+"      "+str(counterScrProp)+space+str(dcgfun([counterScr,(ScrScore/10)])))
print('Exercises : '+ str(counterExer)+space+str(ExerScore/10)+"      "+str(counterExerProp)+space+str(dcgfun([counterExer,(ExerScore/10)])))
print('Literature: '+ str(counterLit)+space+str(LitScore/10)+"      "+str(counterLitProp)+space+str(dcgfun([counterLit,(LitScore/10)])))
