import requests
import re
from bs4 import BeautifulSoup

print("I am here")

page = requests.get("https://careerservices.upenn.edu/events/2019/11/08/preparing-for-academic-screening-conference-and-on-campus-interviews-academic-job-search-series/")

soup = BeautifulSoup(page.content, 'html.parser')

print(soup.find_all('div','entry-content'))

#CONTINUE FROM HERE
raw_summary = ''
for p in soup.find_all('div','entry-content'):
    raw_summary= "\n" + (p.text)
# print(raw_summary)

#Identifying registration link

# <a target="_blank" class="button rsvp-button" href="https://upenn.joinhandshake.com/events/324446">Click here to attend</a>
links_with_text = [a['href'] for a in soup.find_all('a', href=True) if a.text=='Click here to attend']
print(links_with_text[0]) #Is the registration link


###Set up connection with firebase
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


# Use the application default credentials
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
  'projectId': 'spotit-at-penn',
})

db = firestore.client()

####End of Firebase connection

#Test if connection exists

users_ref = db.collection(u'events')
docs = users_ref.stream()


#Doing this to minimize calling the firebase database
current_data = []
for doc in docs:
    storage_list = []
    storage_list.append(doc.to_dict()['title'])
    storage_list.append(doc.to_dict()['time'])
    current_data.append(storage_list)

print(['CDB POSTDOC HAPPY HOUR', '1571464400'] in current_data)
# current_data[1]['title']
# current_data[1]['time']

# for i in range(len(current_data)):
#     if " "
# thisdict = {
#   "brand": "Ford",
#   "model": "Mustang",
#   "year": 1964
# }
#
# year_to_number = {
# 'january' : 1,
# 'february':2,
# 'march':3,
# 'april':4,
# 'may':5,
# 'june':6,
# 'july':7,
# 'august':8,
# 'september':9,
# 'october':10,
# 'november':11,
# 'december':12
# }
#
# print(year_to_number['January'.lower()])
# # list_of_urls_to_check = []
# # for i in range(1,15):
# #     list_of_urls_to_check.append('https://careerservices.upenn.edu/events/default/page/' + str(i))
# # print(list_of_urls_to_check)
#
#
# #Function to determine if a page should be included in a list
# def events_present(i):
#     url_to_check = 'https://careerservices.upenn.edu/events/default/page/'+str(i)
#     fetch(url_to_check)
#     if "Sorry, there are no new events" in response.css('li::text').getall()[-1]:
#         return False
#     else:
#         return True
