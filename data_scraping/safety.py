#Progress
#View https://medium.com/@acowpy/scraping-files-images-using-scrapy-scrapinghub-and-google-cloud-storage-c7da9f9ac302
#To see how to deploy on Google Cloud

import datetime as dt
import scrapy
from scrapy.crawler import CrawlerProcess

##For Secondary Site extraction. For ease, I am using BeautifulSoup. Wonder how running two spiders works on Scrapy
import requests
import re
from bs4 import BeautifulSoup


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
current_data_markers = []
#Each element in above list will contain title and time to check if new entry is unique
for doc in docs:
    storage_list = []
    storage_list.append(doc.to_dict()['title'])
    storage_list.append(doc.to_dict()['time'])
    current_data_markers.append(storage_list)



#How to check if it is a fresh entry: name and timing

# for i in range(len(current_data)):
#     to_enter = True
#     if current


list_of_urls_to_check = []
#To refactor: Write method to figure out the end number
for i in range(1,15):
    list_of_urls_to_check.append('https://careerservices.upenn.edu/events/default/page/' + str(i))



class EventsSpider(scrapy.Spider):
    name = "career_services_spider"

    start_urls= list_of_urls_to_check


    def parse(self, response):
        for event in response.css("li.event_item"):
            unique_list_marker = [] #Will contain title and time to check for new entry
            title = event.css('div::text').getall()[1]
            unique_list_marker.append(title)
            host = "Penn Career Services"
            time = None #Updated later
            raw_events_data = event.css('span ::text').getall()
            location = raw_events_data[-1]
            summary = None #Update Later
            cost = None
            websiteSource = event.css("a ::attr(href)").getall()[0]
            #Process
            registrationSite = event.css("a ::attr(href)").getall()[1]
            keywords = []
            # print(title)
            start_time_hours = raw_events_data[1].split(" ")[0]
            #Let's make all the start time hours look uniform so we can manipulate them easily
            #These are the instances where the : is missing
            if len(start_time_hours) <5:
                raw_hour = int(start_time_hours[:-2])
                if(start_time_hours[-2:]=='am' or raw_hour == 12):
                    hour = int(raw_hour)
                else:
                    hour = raw_hour+12
                minute = int(0)

            else:
                hour = int(start_time_hours[:-5])
                minute = int(start_time_hours[-4:-2])
                am_or_pm = start_time_hours[-2:]
                if (am_or_pm == 'pm' and hour!=12):
                    hour+= 12


            # if ":" or " : " not in start_time_hours:
            #     print(start_time_hours)
            year = int(raw_events_data[0].split(" ")[3])
            day = int(raw_events_data[0].split(" ")[2].replace(",",""))
            month_str = (raw_events_data[0].split(" ")[1])
            month_to_number = {
            'january' : 1,
            'february':2,
            'march':3,
            'april':4,
            'may':5,
            'june':6,
            'july':7,
            'august':8,
            'september':9,
            'october':10,
            'november':11,
            'december':12
            }

            month = month_to_number[month_str.lower()]
            date_object = dt.datetime(year, month, day, hour, minute)
            #Adding 4 hours because of ETC
            time = int(((date_object - dt.datetime(1970,1,1)).total_seconds()+(4*60*60)))
            #Place to check and add
            unique_list_marker.append(time)
            if unique_list_marker in current_data_markers:
                print("Already Present")
            else:
                print("New!")
                #Put for launch
                # doc_ref = db.collection(u'events').document()
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




            #Time to connect with Firebase Storage and Create a New Entry If Necessary






            # class BlogSpider(scrapy.Spider):
                # name = 'blogspider'
                # start_urls = ['https://blog.scrapinghub.com']
                #
                # def parse(self, response):
                #     for title in response.css('.post-header>h2'):
                #         yield {'title': title.css('a ::text').get()}
                #
                #     for next_page in response.css('a.next-posts-link'):
                #         yield response.follow(next_page, self.parse)
                #
