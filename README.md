# Web-Scraper

spider.js is an image extractor

requires node.js
requires node libraries:
  axios
  cheerio
  commander
  fs
  push
install these using the command: npm install "library name"
spider.js must be in the same folder as node.js

to run spider.js, use the command: node ./spider.js [-rlp] url

-r = recursive download (downloads images from links on the webpage as well)
-l = recursive level (the depth that the recursive downoad occurs).
  Requires an integer value after -l (e.g. -l 3)
-p = path (the file path to store the images)
  Requires a directory name after -p (e.g. -p /data)

url = the url of the website to scrape
