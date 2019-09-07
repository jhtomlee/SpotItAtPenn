#1. Write a scraper to get data
#2. Write a CSV file to store the data
#3. If it doesn't exist on existing dataset then it will proceed to create a new entry
#4. Neat if it shoots me us email to about the status


import scrapy




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
