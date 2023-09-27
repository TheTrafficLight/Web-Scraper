# Web-Scraper



**SPIDER.JS**

spider.js is an image extractor

requires node.js
requires node libraries:

axios,
cheerio,
commander,
fs,
push,

install these using the command: npm install "library name"
spider.js must be in the same folder as node.js


to run spider.js, use the command: node ./spider.js [-rlp] url
the command must be run in the same folder node.js was installed and the package.json file was created

-r = recursive download (downloads images from links on the webpage as well)
-l = recursive level (the depth that the recursive downoad occurs), requires an integer value after -l (e.g. -l 3), defult value is 5  
-p = path (the file path to store the images), requires a directory name after -p (e.g. -p ./images), defult path is ./data

url = the url of the website to scrape

if the specified path does not exist, a folder will be created with the specified name
spider.js will only download images of type:

jpeg/jpg
png
gif
bmp



**SCORPION.JS**

scorpion.js is a metadata extractor
metadata will be stored in a csv file

requires node.js
requires node libraries:

commander,
fs,
push,
exif-parser

install these using he command: npm install "library name"
scorpion.js must be in the same folder as node.js

to run scorpion.js, use the command: node ./scorpion.js [-p] directory
the command must be run in the same folder node.js was installed and the package.json file was created

-p = path (the file path to store the metadata), defult path is ./metadata

scorpion.js will only extract the exif data for jpeg/jpg images
if no exif data is found, the csv file will be deleted
