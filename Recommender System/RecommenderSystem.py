import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import warnings
import sys
import random
import time
import json
import csv
import numpy as np
import tensorrec
import tensorflow as tf
from collections import defaultdict
from scipy import sparse
from sklearn.preprocessing import MultiLabelBinarizer
from pymongo import MongoClient
warnings.filterwarnings('ignore')
userex = 1000

#Method that consumes item ranks for each user and prints out recall@10 train/test metrics
def check_results(ranks):
    train_recall_at_10 = tensorrec.eval.recall_at_k(
        test_interactions=users_data_train,
        predicted_ranks=ranks,
        k=10
    ).mean()
    test_recall_at_10 = tensorrec.eval.recall_at_k(
        test_interactions=users_data_test,
        predicted_ranks=ranks,
        k=10
    ).mean()
    print("@From function check results")
    print("@Recall at 10: Train: {:.4f} Test: {:.4f}".format(train_recall_at_10,test_recall_at_10))
    print("@Among the test set, there is a {}% chance that a course that I ve liked made it in to the top 10.".format(test_recall_at_10*100))

#Method that combines ratings and score for a specific interrelation between a course and a user
#via trial and error 
#multiplying the rating by 20 is to bring in the same numerical scale as the score metric
#weights were tried to achieve a reasonable outcome
def final_score(users_data,users_header):
    for i in users_data:
        i[2]=0.6 * i[2] + 0.4*20*i[3]
        i = i.pop(3)
    users_header.pop(3)

#Method that converts a list of (user, item, score) to a sparse matrix
#In this matrix, every row represents a user and every column is a course.
# The [i, j]th value in this matrix is User i’s combined score for j course.
def interactions_list_to_sparse_matrix(interactions):
    users_column, items_column, score_column = zip(*interactions)
    return sparse.coo_matrix(((score_column), (users_column, items_column)),shape=(n_users, n_items))



#!!!!!!!!!!!!!!!!!!!!!!!CONNECTION WITH DATABASE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

print("@Connecting to webappdbs db on mongodb://127.0.0.1:27017/")
client = MongoClient('mongodb://127.0.0.1:27017/')
db = client.webappdbs

print('@Loading course info data from DB.')
courses_header = ['courseid', 'title', 'coursefield', 'professor_involvement', 'types_of_content', 'difficulty']
courses_data = list(map(lambda x: list(x.values()), db.courses.find()))
for i in courses_data:
    i.pop(0)
print('@Loading users interactions from DB.')
users_header = ['userid', 'courseid', 'score', 'ratings']
users_data = list(map(lambda x: list(x.values()), db.users.find()))
for i in users_data:
    i.pop(0)


#!!!!!!!!!!!!!!!!!!!!!!!DATA MANIPULATION!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
print('@Preparing the datasets')
print('@Creating Intenal ids for the courses and the students.')
#this is how we keep unique ids for user and items and turn our data to int and floats for exploiting
internal_user_ids = defaultdict(lambda: len(internal_user_ids))
internal_item_ids = defaultdict(lambda: len(internal_item_ids))
for row in users_data:
    #changing the userid of the csv file with our internal id
    row[0] = internal_user_ids[int(row[0])]
    row[1] = internal_item_ids[int(row[1])] 
    #has changed the course id
    row[2] = float(row[2]) #score
    row[3] = int(row[3])   #rating
n_users = len(internal_user_ids)
n_items = len(internal_item_ids)
#now users_data has unique interrelations and numerical scores in its fields

print('@Combining the score and ratings metrics to one ,score signifies the completion of the course and the rating is the explict rating given by the user')
final_score(users_data,users_header)

print("@Raw users data example\n{} :".format(users_header))
print("{}".format(users_data[0]))
print("@Raw course features example\n{} :".format(courses_header))
print("{}".format(courses_data[0]))

# Shuffle the ratings and split them in to train/test sets 80%/20%
random.shuffle(users_data)  # Shuffles the list in-place
cutoff = int(.8 * len(users_data))
train_set = users_data[:cutoff]
test_set = users_data[cutoff:]
print("@Separating our ratings data.\n{} train ratings(80%), {} test ratings(20%)".format(len(train_set), len(test_set)))

users_data_train = interactions_list_to_sparse_matrix(train_set)
users_data_test = interactions_list_to_sparse_matrix(test_set)
print('@Created sparsed matrixes needed for tensorrec algorithm and matrix factorization.')

print('@Kept only inputs with scorea above 50.0, to make corresponding recommendations')
users_data_train = users_data_train.multiply(users_data_train >= 50.0)
users_data_test = users_data_test.multiply(users_data_test >= 50.0)

#TensorRec will perform matrix factorization by default if it is given only 
#identity matrices as user/item features.
#These identity matrices are often called “indicator features.”
user_indicator_features = sparse.identity(n_users)
item_indicator_features = sparse.identity(n_items)

#Adding metadata Features
courses_content_by_internal_id = {}
for row in courses_data:
    row[0] = internal_item_ids[int(row[0])]  # Map to IDs
    row[4] = row[4].split('|')  # Split up the content  
    courses_content_by_internal_id[row[0]] = row[4]

#Build a list of genres where the index is the internal course ID and
# the value is a list of [Genre, Genre, ...]
courses_content = [courses_content_by_internal_id[internal_id] for internal_id in range(n_items)]

# Transform the genres into binarized labels using scikit's MultiLabelBinarizer
courses_content_features = MultiLabelBinarizer().fit_transform(courses_content)
n_types_content = courses_content_features.shape[1]
print("@Binarized content types for course {}: {}".format(0,courses_content_features[0]))

# Coherce the course content features to a sparse matrix, which TensorRec expects
courses_content_features = sparse.coo_matrix(courses_content_features)

# Concatenating the genres on to the indicator features for a hybrid recommender system
full_item_features = sparse.hstack([item_indicator_features, courses_content_features])



#!!!!!!!!!!!!!!!!!!!!!!!TRAINING AND FITTING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

print("@Training hybrid recommender")
hybrid_model = tensorrec.TensorRec(
    n_components= 305,
    user_repr_graph=tensorrec.representation_graphs.NormalizedLinearRepresentationGraph(),
    item_repr_graph=tensorrec.representation_graphs.WeightedFeaturePassThroughRepresentationGraph(),
    prediction_graph=tensorrec.prediction_graphs.CosineSimilarityPredictionGraph(),
    loss_graph=tensorrec.loss_graphs.WMRBLossGraph()
)

print("@Fitting the trained model")

start_time = time.time()
hybrid_model.fit(interactions=users_data_train,
                 user_features=user_indicator_features,
                 item_features=full_item_features,
                 epochs = 100,
                 learning_rate = 0.1,
                 verbose = True,
                 n_sampled_items= int(n_items*0.1))
print("@Finished fitting in %s minutes" % ((time.time() - start_time)/60))

print("@Hybrid recommender predicting ranks")
predicted_ranks = hybrid_model.predict_rank(user_features=user_indicator_features,item_features=full_item_features)



#!!!!!!!!!!!!!!!!!!!!!!!RESULTS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
print("@Inserting all new recommendations to database")
#New recommendations are the top 5 ranked courses
counter_user=0
for user in predicted_ranks:
    u_rankings = user
    u_top_five_recs = np.where(u_rankings <= 5)[0]
    new_five = []
    for i in u_top_five_recs:
        new_five.append(int(list(internal_item_ids.keys())[i]))
    db.userinfo.find_and_modify(query={'userid':counter_user}, update={"$set": {'proposed':new_five}}, upsert=False, full_response= True)
    counter_user += 1
    if(counter_user%1000==0):
        print("Loading")




#Uncomment 1 or 2 for different kind of result checks
#1)THIS can be used to store all new recommendations to a txt file
'''
f=open('secondresults.txt','w')
f.write(str(int(list(internal_item_ids.keys())[i]))+',')
f.write('\n')
f.close()
'''

#2)Print out courses that example user has liked
#Note: 'print(predicted_ranks[1939])' is the same as 'print(u_rankings)' below
'''
print("@User {} has a good score for the courses:".format(userex))
for m in users_data_train[userex].indices:
    if (int(users_data_train[userex][(0,m)])>50):
        print('for internal course key {} with score {}, we refer to the course'.format(m,users_data_train[userex][(0,m)]))
        print(courses_data[list(internal_item_ids.keys())[list(internal_item_ids.values()).index(m)]])
        print("internal id {}, {} with score {}".format(m,courses_content_by_internal_id[m],users_data_train[userex][(0,m)]))


# Pull given user's features out of the user features matrix and predict course ranks for just that user
u_features = sparse.csr_matrix(user_indicator_features)[userex]
u_rankings = hybrid_model.predict_rank(user_features=u_features,item_features=full_item_features)[0]

# Get internal IDs of User ex's top 10 recommendations
# These are sorted by item ID, not by rank
# This may contain items with which User ex has already interacted
u_top_five_recs = np.where(u_rankings <= 5)[0]
print("@User example recommendations:")
for m in u_top_five_recs:
    print("internal id {}, {} ,true courseid: {}".format(m,courses_content_by_internal_id[m],list(internal_item_ids.keys())[m]))
'''