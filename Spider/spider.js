//import libraries
const axios = require("axios");
const cheerio = require("cheerio");
const program = require("commander");
const fs = require("fs")
const path = require ("path")

const url = "https://sites.google.com/42adel.org.au/webscraping"

program
    .option("-r, --recursive", "download images recursively")
    .option("-l, --level <value>", "maximum depth level", 5)
    .option("-p, --path <path>", "path to store images", "Spider/data")
    .parse(process.argv)

const options = program.opts();

//check that options have correct values for the program
if(!Number.isInteger(options.level * 1)) {
    console.error("ERROR: depth level value must be integer")
} else {

//check if the recursive option was selected
if(options.recursive){
    getImage();
}
    
//get the urls of images    
async function getImage() {
    try {
        //access the website data
        const response = await axios.get(url, {responseType: "document"});
        const $ = cheerio.load(response.data);

        //loop through each image and get the src value
        $("img").each(async(index, element) => {
            const src = $(element).attr("src");

            //only check for the same amount of images as the specified depth (5 by defult)
            if (src && index <= options.level) {
                try {
                
                    console.log(path.join(options.path, "/image" + index + ".jpeg"))
                    
                    const imageDataResponse = await axios.get(src, {responseType: "arraybuffer"});
                    const imageData = imageDataResponse.data;

                    //check which file type it is
                    const contentType = imageDataResponse.headers["content-type"];
                    let fileExtension = ".jpg"; // Default to JPEG
                    if (contentType === "image/png") {
                        fileExtension = ".png";
                    } else if (contentType === "image/gif") {
                        fileExtension = ".gif";
                    } // Add more format checks as needed

                    //chose where to save the file and creat a file in that place
                    const filePath = path.join(options.path, "/image" + index + fileExtension);
                    fs.writeFileSync(filePath, imageData)
                    console.log(src)
                    // axios.get(src , {responseType: "arrayBuffer"})
                } catch (error) {
                    console.error(error);
                }
                
            }
        })
    } catch (error) {
        console.error(error);
    }
}

}

