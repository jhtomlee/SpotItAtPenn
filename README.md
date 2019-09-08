# SpotItAtPenn

## Inspiration 
There are numerous events on campus organized by a wide range of groups. Presently, we get bombarded with announcements of events we are not interested but still struggle to find the events that matter to us. 
(https://i.imgur.com/ZSpSql1.jpg)

**That's why we wanted to create SpotIt- an events aggregator that gives you a personalized list of events aligned with your interests.** 


## What it does
During the signup process, the student registers his/her interests (e.g., blockchain, ancient history, technology). Then, SpotIt will present the student a list of events that have tagged under the interests the student specifies. 
The student will also have the option of searching for events based on the event title, host, location. 

Students will get to know events that there are interested in regardless of whether there are existing email listing subscribers or group members. The events listed in the student's feed will be dependent on interests and agnostic to the host. So whether there is a blockchain talk by the blockchain club or business school, the student won't miss out the events they are interested in. 

## How we built it
We built the app that works on both iOS and Android using React Native, Firebase, and Cloud Firestore database. We scraped events from school sub-domain websites which organize a high volume of popular events (e.g., Career Services) using Scrapy. We used NLP-related packages like SpaCy to automatically tag the interests associated with the event. 

## Challenges we ran into
Scraping events data from school sub-domain websites was tough. Every sub-domain website uses a different event listing format. There was a large number of websites with very few events. Consequently, writing a custom scraper for each one of these websites wasn't the best use of time and we used data miners to extract the data for us. 

## Accomplishments that we're proud of
This is our first hackathon and we are glad we could build out the prototype quickly. 


## What we learned
By working together, we could cross-share knowledge and learn about the different domains we are interested in (e.g., react native/web scraping). We learned how to scope projects better based on time constraints so that we could get a functioning product ready. 


## What's next for SpotIt 
We plan to work with campus organizations to encourage them to key in their events directly into SpotIt and promote this app among their members. 
