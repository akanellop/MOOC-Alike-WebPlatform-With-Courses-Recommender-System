import csv
import random
import pandas as pd

#This script randomly produces a dataset to represent the attendance of existing students [usrid, courseid, rating, progress]
#Each student has a unique id and there should be only one unique interrelation between a student id and a course id
#Τhe size of this dataset (= 10.000 samples) is determined by a quick estimation of the number of uth-eclass users

score = []
weights= []
for i in range(100):
    score.append(i)
    if i>50:
        weights.append(0.66)
    else:
        weights.append(0.34)
        
with open('users_implicit_data.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile, delimiter=',')
    writer.writerow(['userid','courseid','score','ratings'])
    for i in range(20000):
        num_of_courses_taken = random.randint(5,100)
        ids_of_courses = random.sample(range(0,300),num_of_courses_taken)
        
        for j in range(num_of_courses_taken-1):
            attendance_string = []
            attendance_string.append(str(i))
            attendance_string.append(str(ids_of_courses[j]))
            attendance_string.append(random.choices(score,weights)[0])
            attendance_string.append(random.randint(0,5))

            writer.writerow(attendance_string)

df = pd.read_csv('users_implicit_data.csv')
print(df.info())