//import libraries
const exif = require("exif-parser")
const program = require("commander");
const fs = require("fs")
const path = require("path")

//define the options for the command
program
    .option("-p --path <path>", "directory to save the imageData csv file", "./metadata")
    .argument("<directory>", "directory to read the files");
program.parse();

//variables for the program
const directory = program.args[0]
const folderName = program.opts().path

//the header for the csv file (metadata keys)
const csvHeaders = "ImageDescription,Make,Model,XResolution,YResolution,ResolutionUnit,Software,ModifyDate,Artist,Copyright,ExposureTime,FNumber,ExposureProgram,ISO,SensitivityType,RecommendedExposureIndex,DateTimeOriginal,CreateDate,undefined,ShutterSpeedValue,ApertureValue,ExposureCompensation,MaxApertureValue,MeteringMode,Flash,FocalLength,SubSecTimeOriginal,SubSecTimeDigitized,ColorSpace,FocalPlaneXResolution,FocalPlaneYResolution,FocalPlaneResolutionUnit,CustomRendered,ExposureMode,WhiteBalance,SceneCaptureType,SerialNumber,LensInfo,LensModel,LensSerialNumber"
metadataCount = 0

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

//extracts the metadata from any files passed to it
function fileReader(file){
    fs.readFile(file, (err, data) => {
        if(err){
            console.error(err);
        }
        let exifData = exif.create(data).parse();
        console.log(exifData);
        //separate the exifData into the keys and values
        exifKeys = Object.keys(exifData.tags)
        exifValues = Object.values(exifData.tags)
        //if there is no image description shift all elements in the array
        if (exifKeys[0] !== "ImageDescription"){
            exifValues.unshift("")
        }
        try {
            //check each element in the object
            for (const key in exifValues){
                if (Object.prototype.hasOwnProperty.call(exifValues, key)) {
                    //convert everything to a string
                    //remove new lines and commas in the strings
                    exifValues[key] = exifValues[key].toString().replace(/\n/g, "")
                    exifValues[key] = exifValues[key].toString().replace(/,/g, " ");
                    if (exifValues.length() > 0){
                        metadata ++
                    }
                  }
            }
            //add the string to the csv file on a new line
            fs.appendFileSync("./images.csv", "\n" + exifValues.toString().replace("/n", ""))
        } catch (err) {
            console.error(err)
        }
    })
}

//reads the files in the directory and passes all of the jpeg images to the fileReader function
function readDirectory(directoryPath) {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
          console.error("Error reading directory:", err);
          return;
        }
        //loop through each file in the folder
        files.forEach((fileName, index) => {
            //get the file extention from the end of the image name
            let extention = fileName.split(".").pop()
            //check if the image is a jpeg file and pass the file location to the file reader
            if (extention == "jpg" || extention == "jpeg"){
                //console.log(extention);
                let filePath = path.join(directoryPath, fileName)
                fileReader(filePath)
            }
        })
    });
    //once all of the files have been read, check to see if any metadata was recorded
    checkForData()
}

//creates the csv file and puts headders on it
function createCSV() {
    try {
        console.log("created csv file")
        //the name for the csv file is the name of the directory -metadata
        directoryShortName = directory.split("/").pop();
        targetName = directoryShortName + "-metadata";
        //create the csv file in the selected path
        fs.writeFile(folderName + "/" + targetName + ".csv", csvHeaders, (error) => {
            if(error) {
                console.error(error);
                return;
            }
        })
    } catch (error) {
        console.error(error);
    }
}

//check to see if there is any data in the csv file
//if not, delete the csv file
function checkForData() {
    if (metadataCount == 0){
        try {
            console.log("deleted csv file: no metadata was found")
            //the name for the csv file is the name of the directory -metadata
            directoryShortName = directory.split("/").pop();
            targetName = directoryShortName + "-metadata";
            //delete the csv file in the selected path
            fs.unlink(folderName + "/" + targetName + ".csv", (error) => {
                if(error) {
                    console.error(error);
                    return;
                }
            })
        } catch (error) {
            console.error(error);
        }
    }
}

//create a csv file then read the dirctory for its metadata
createCSV()
readDirectory(directory)