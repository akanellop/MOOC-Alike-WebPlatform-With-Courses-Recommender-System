import csv
import random
fields=['physics','arts','formalscience','medicine','history','naturalscience','economics']
professor_involvement=['low','medium','high']
content=['scripts','videos','audios','extraliterature','exercises']
difficulty=['low','medium','high']
courses =[]

#"This script creates a csv file where the item features of each course is stored, [courseid,title,..]" 
#"These features are determined by the instructor when the course is uploaded to the platform"
#"Here the data is randomly produced to signify existing courses"
#"In real environment, they may be determined explicitly by the professor or taken from the web platform depending the professor's actions"


with open('courses_item_features.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile, delimiter=',' )
    writer.writerow(['courseid','title','coursefield','professor_involvement','types_of_content','difficulty'])
    for i in range(1000):
        course_string=[]
        course_string.append(str(i))
        course_string.append('title')
        course_string.append(random.sample(fields,k=1)[0])
        course_string.append(random.sample(professor_involvement,k=1)[0])

        num_of_content_types = random.randint(1,5)
        content_list= random.sample(content,k=num_of_content_types)[:(num_of_content_types)]
        course_string.append('|'.join(x for x in content_list))
        course_string.append(random.sample(difficulty,k=1)[0])

        writer.writerow(course_string)


