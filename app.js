const http = require("http");
function isStaticContent(fullPath) {
  const staticThings = [".html", ".css", ".js", ".jpeg", ".jpg"];
  const path = require("path");
  let extName = path.extname(fullPath);
  return staticThings.indexOf(extName) >= 0;
}
function serveStaticContent(uri, response) {
  const fs = require("fs");
  const path = require("path");
  let fullPath = path.join(__dirname, "/public" + uri);
  const readStream = fs.createReadStream(fullPath);
  readStream.pipe(response);
  readStream.on("error", () => {
    response.write("Error During File Read");
    response.end();
  });
}

function handleRequestResponse(request, response) {
  if (request.url == "/") {
    serveStaticContent("/index.html", response);
  } else if (isStaticContent(request.url)) {
    serveStaticContent(request.url, response);
  } else if (request.url.indexOf("/dologin") >= 0 && request.method == "GET") {
    const url = require("url");
    var obj = url.parse(request.url, true);
    console.log("INside GET ", request.url, " Obj ", obj.query);
    if (obj.query.userid == obj.query.pwd) {
      response.write("<h1>Welcome " + obj.query.userid + "</h1>");
    } else {
      response.write("INvalid Userid or password");
    }
    response.end();
  } else if (request.url == "/dologin" && request.method == "POST") {
    const queryString = require("querystring");
    var postData = "";
    request.on("data", (chunk) => {
      postData += chunk;
    });
    request.on("end", () => {
      var obj = queryString.parse(postData);
      console.log("Data is ", postData, " Obj is ", obj);
      if (obj.userid == obj.pwd) {
        response.setHeader("content-type", "text/html");
        response.write("<h1>Welcome " + obj.userid + "</h1>");
      } else {
        response.write("Invalid Userid or Password");
      }
      response.end();
    });
    request.on("error", () => {
      response.write("Some Error During Post");
      response.end();
    });
  } else {
    response.write("<h1>Hello Client I am Server...</h1>");
    response.end(); // flush
  }

  console.log("Inside Handle Req/Res ", request.url);
}
const server = http.createServer(handleRequestResponse);
server.listen(1234, () => {
  console.log("Server Start");
});
