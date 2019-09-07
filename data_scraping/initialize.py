import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


# Use the application default credentials
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
  'projectId': 'spotit-at-penn',
})

db = firestore.client()


#Import the csv file
import csv

#Load up the CSV file || Insert the CSV File
f = open("/Users/girri/Downloads/round1_data.csv")

csv_f = csv.reader(f)
#This skips the header for us
next(csv_f)
for row in csv_f:
    # If value is empty i.e., "" then we want to assign it to None
    for i in range(len(row)):
        if row[i] == '':
            row[i] = None

    title = row[0]
    host = row[1]
    time = row[2]
    location = row[3]
    summary = row[4]
    cost = row[5]
    registrationSite = row[6]
    websiteSource = row[7]
    keywords_raw = row[8].replace("'","")
    keywords = []
    #Would a list comprehension here work? To think when refactoring
    #To ensure no spaces at the start during refactoring
    for i in range(len(keywords_raw.split(','))):
        keywords.append(keywords_raw.split(',')[i])

    doc_ref = db.collection(u'events').document()
    doc_ref.set({
        u'title' : title ,
        u'host' : host ,
        u'time' : time,
        u'location' : location ,
        u'summary' : summary ,
        u'cost' : cost,
        u'registrationSite' :  registrationSite,
        u'websiteSource': websiteSource,
        u'keywords': keywords ,
        u'likesCount': 0
    })
    #print(f'Just completed {title} by {host} at {time}')





#These are the variables that will change constantly. Let's nest this within a for loop now.
#
# title = 'GOOD Saving the Environment: the Tiber and Roman Mythology'
# host = 'Center for Ancient Studies'
# time = 1567715400
# location = 'Cohen Hall 402, University of Pennsylvania'
# summary = None #Would this work?
# cost = None
# registrationSite = None
# websiteSource = 'https://www.sas.upenn.edu/ancient/events.html'
# keywords = ['Technology Jobs', ' Finance Jobs']
#
# doc_ref.set({
#     u'title' : title ,
#     u'host' : host ,
#     u'time' : time,
#     u'location' : location ,
#     u'summary' : summary ,
#     u'cost' : cost,
#     u'registrationSite' :  registrationSite,
#     u'websiteSource': websiteSource,
#     u'keywords': keywords ,
#     u'likesCount': 0
# })


#FOR CSV, I want to loop through and delete each row as it is done
#If it is empty, have it as null strip and no char, then NULL



#Code to print out events

# users_ref = db.collection(u'events')
# docs = users_ref.stream()
#
# for doc in docs:
#     print(doc.to_dict())





#TO Review if we run into bugs
# # Use the application default credentials
# cred = credentials.Certificate("/Users/girri/Downloads/spotit-at-penn-firebase-adminsdk-g0ot4-3c9a772033.json")
# #Try line 7 instead of 10 and below
# default_app = firebase_admin.initialize_app()
#
# # firebase_admin.initialize_app(cred, {
# #   'projectId': project_id,
# # })
#
# db = firestore.client()
#

#Enter own json key
#What do we need to change to establish a connection with our own dataset

#
# import firebase_admin
# from firebase_admin import credentials
#
# cred = credentials.Certificate("path/to/serviceAccountKey.json")
# firebase_admin.initialize_app(cred)


# export GOOGLE_APPLICATION_CREDENTIALS="/Users/girri/Downloads/spotit-at-penn-firebase-adminsdk-g0ot4-3c9a772033.json"
