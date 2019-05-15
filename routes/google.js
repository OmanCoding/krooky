var express = require("express");
var router = express.Router();
var fs = require("fs");
const request = require("request");
const Vision = require("@google-cloud/vision");
const { Storage } = require("@google-cloud/storage");
const uuid = require("uuid/v4");
const formidable = require("formidable");

const storage = new Storage({
	projectId: "omancoding",
	keyFilename: "./google_credentials.json"
});

const vision = new Vision.ImageAnnotatorClient({
	projectId: "omancoding",
	keyFilename: "./google_credentials.json"
});

var bucketName = "omancoding_storage";

async function store(file) {
	var fs = require("fs");

	await storage.bucket(bucketName).upload(file, {
		metadata: {
			cacheControl: "public, max-age=31536000"
		}
	});

	console.log(`${file} uploaded to ${bucketName}.`);
	return file;
}

router.post("/ocr/file", async function(req, res, next) {
	// Performs text detection on the local file
	var fls = await new Promise(function(resolve, reject) {
		new formidable.IncomingForm().parse(req, (err, fields, files) => {
			if (err) {
				console.error("Error", err);
				throw err;
			}
			resolve(files);
		});
	});

	var filename = await store(fls.file.path);
	filename = filename.split("/").pop();

	const [result] = await vision.textDetection(`gs://${bucketName}/${filename}`);
	const detections = result.textAnnotations;
	/*detections.forEach(function(text) {
		console.log(text);
	});*/
	console.log(detections[0].description);
	res.send(detections[0].description);
});

module.exports = router;
