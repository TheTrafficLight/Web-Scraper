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
    .option("-m --memory", "use memory data to prevent duplicate website scraping", true)
    .argument("<url>", "url to scrape")
    .parse(process.argv);

const options = program.opts();
const url = program.args[0];
const websites = [url];
const scrapedWebsites = []

//check that options have correct values for the program
if(!Number.isInteger(options.level * 1)) {
    console.error("ERROR: depth level value must be integer");
} else {

//get the urls of images    
async function getImages(link, depth = 0) {
    if (!scrapedWebsites.includes(link)){
        try {
            //access the website data
            const response = await axios.get(link, {responseType: "document"});
            const $ = cheerio.load(response.data);
            scrapedWebsites.push(link)
            
            //check if there are images on the website
            if ($("img").length === 0) {
                console.log("No images found")
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
        
                                //check if the url already has a file extention and if it matches up with the MIME fileType
                                if (src.split(".").pop() == fileExtention) {
                                    let filePath = path.join(options.path, fileName);
                                    fs.writeFileSync(filePath, imageData);
                                    console.log("downloaded image to " + options.path);
                                } else {
                                    //add the file extention to the image path
                                    let filePath = path.join(options.path, fileName + "." + fileExtention);
                                    fs.writeFileSync(filePath, imageData);
                                    console.log("downloaded image to " + options.path);
                                }
                            }
                        } catch (error) {
                            console.error("error getting src data for " + src);
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
        console.error("error getting links")
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
if (options.recursive){
    getImages(url, options.level)
} else {
    getImages(url, 0)
    console.log("getting images");
}
}