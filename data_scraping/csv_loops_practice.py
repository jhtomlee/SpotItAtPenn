#Import the csv file
import csv

#Load up the CSV file
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
