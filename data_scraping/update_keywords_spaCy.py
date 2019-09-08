###Loading Firebase Credentials
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


# Use the application default credentials
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
  'projectId': 'spotit-at-penn',
})

db = firestore.client()

###Firebase connection established

##SpaCy Model Requirements
import spacy
nlp = spacy.load('en_core_web_sm')
###SpaCy Over

users_ref = db.collection(u'events')
docs = users_ref.stream()


list_of_important_tags = ['PERSON','NORP','ORG','WORK_OF_ART']
#Each element in above list will contain title and time to check if new entry is unique
for doc in docs:
    event_id = doc.id #This will track where the updates go
    document_ref = users_ref.document(event_id)
    summary = doc.to_dict()['summary']
    if (len(doc.to_dict()['keywords']))<1:
        # update_count+=1
        #Apply our model to create keywords
        title = doc.to_dict()['title']
        location = doc.to_dict()['location']
        combined_string = title + " " + location +  " " + summary
        doc = nlp(combined_string)
        for word in doc.ents:
            if (word.label_ in list_of_important_tags):
                additional_keyword = word.text
                #When refactoring I can create one whole array and then union it rather piece meal
                document_ref.update({u'keywords': firestore.ArrayUnion([additional_keyword])})



# Atomically add a new region to the 'regions' array field.
# city_ref.update({u'regions': firestore.ArrayUnion([u'greater_virginia'])})
