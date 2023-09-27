//import libraries
const axios = require("axios");
const cheerio = require("cheerio");
const program = require("commander");
const fs = require("fs");
const path = require ("path");

//define the options for the command
program
    .option("-r, --recursive", "download images recursively", false)
    .option("-l, --level <value>", "maximum depth level", 5)
    .option("-p, --path <path>", "path to store images", "./data")
    .argument("<url>", "url to scrape");
program.parse(process.argv);

//variables for the program
const options = program.opts();
const url = program.args[0];
const websites = [url];
const scrapedWebsites = [];
const folderName = options.path;
const imageExtentions = ["jpeg", "jpg", "png", "gif", "bmp"];
var websiteCount = 0

//check that options have correct values for the program
if(!Number.isInteger(options.level * 1)) {
    console.error("ERROR: depth level value must be integer");
} else {

//check if a folder already exists
try {
    if (!fs.existsSync(folderName)){
        //if the folder doesn't exist, make a folder
        fs.mkdirSync(folderName);
        console.log("created folder: " + folderName);
    }
} catch (error) {
    console.error("directory error");
}

//get the urls of images    
async function getImages(link, depth = 0) {
    if (!scrapedWebsites.includes(link)){
        try {
            //access the website data
            const response = await axios.get(link, {responseType: "document"});
            const $ = cheerio.load(response.data);
            scrapedWebsites.push(link);
            websiteCount ++
            console.log("downloading images from " + link)
            console.log("total websites accessed = " + websiteCount)
            
            //check if there are images on the website
            if ($("img").length === 0) {
                console.log("No images found");
            } else{
                //loop through each image and get the src value
                $("img").each(async(index, element) => {
                    const src = $(element).attr("src");
                    if (src) {
                        try {
                            //get the data from the image
                            const imageDataResponse = await axios.get(src, {responseType: "arraybuffer"});
                            const imageData = imageDataResponse.data;
        
                            //check which file type it is and create a file extention
                            const contentType = imageDataResponse.headers["content-type"];
        
                            //check to see if the image has a content type and that it can split it
                            if (contentType && contentType.includes("/")){
                                //get the file extention (jpeg, png, gif, etc.)
                                const fileExtention = (contentType.split("/")).pop();
                                var fileName = src;
                                //check to see if the image url has a / in it, and if so, only use the end link for the file name
                                if (src.includes("/")) {
                                    fileName = (src.split("/").pop());
                                }
                                //only download the image if it is of certain file types
                                if (imageExtentions.includes(fileExtention)){
                                    //check if the url already has a file extention and if it matches up with the MIME fileType
                                    if (src.split(".").pop() == fileExtention || src.split(".").pop() == "jpg") {
                                        let filePath = path.join(folderName, fileName);
                                        fs.writeFileSync(filePath, imageData);
                                        //console.log("downloaded image to " + folderName);
                                    } else {
                                        //add the file extention to the image path
                                        let filePath = path.join(folderName, fileName + "." + fileExtention);
                                        fs.writeFileSync(filePath, imageData);
                                        //console.log("downloaded image to " + folderName);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error("error accessing src data");
                        }
                    }
                })
            }
            if (options.recursive){
                getLinks(link, depth + 1);
            }
        } catch (error) {
            console.error("error accessing website data");
        }
    }
}

//get all of the links in a website and add them to the websites array
async function getLinks(link, depth) {
    try {
        const response = await axios.get(link, {responseType: "document"});
        const $ = cheerio.load(response.data);
        $("a").each(async(index, element) => {
            const href = $(element).attr("href");
            //check if there is a link, if so clean it to a usable link
            if(href){
                const convertedURL = convertLinks(href)
                if(convertedURL && !websites.includes(convertedURL)){
                    websites.push(convertedURL)
                    await getImages(convertedURL, depth)
                }
                //console.log(convertLinks(href))
            }
            
        })
    } catch (error) {
        console.error("error accessing links")
    }
}

//convert partial links into usable links
function convertLinks(link) {
    //don't include external links
    if (link.includes("https://") || link.includes("http://")) {
        return;
    } else {
        if (link.includes("/")){
            const targetUrl = url.split("/")
            const cleanedLink = link.split("#").splice(-1)
            const element = targetUrl[0] + "//" + targetUrl[2] + cleanedLink
            return(element)
        }
        else {
            return;}
    }
}

//run the code either recursively or only for the first website
//this is the start of all of the functions
if (options.recursive){
    getImages(url, options.level)
} else {
    getImages(url, 0)
}
}