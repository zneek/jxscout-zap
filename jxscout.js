// jxscout ingest by zneek/hansluz (very alpha)
var ScanRuleMetadata = Java.type(
  "org.zaproxy.addon.commonlib.scanrules.ScanRuleMetadata"
);
var jxendpoint  =  "http://localhost:3333/caido-ingest";

var HttpSender = Java.type("org.parosproxy.paros.network.HttpSender")  
var HttpMessage = Java.type("org.parosproxy.paros.network.HttpMessage")  
var HttpHeader = Java.type("org.parosproxy.paros.network.HttpHeader")  
var HttpRequestHeader = Java.type("org.parosproxy.paros.network.HttpRequestHeader")  
var URI = Java.type("org.apache.commons.httpclient.URI")  

function getMetadata() {
  return ScanRuleMetadata.fromYaml(`
id: 100099
name: jxscout ingestion for  ZAP
description: jxscout ingestion for  ZAP
solution: jxscout ingestion for  ZAP
`);
}

function scan(helper, reqresp, src) {
  // If the file type is image jpeg/png , then the scan will be skipped
  var contenttype = reqresp.getResponseHeader().getHeader("Content-Type");
  var unwantedfiletypes = [
    "image/png",
    "image/jpeg",
    "text/css",
    "image/gif",
    "application/x-shockwave-flash",
    "application/pdf",
  ];
  if (unwantedfiletypes.indexOf("" + contenttype) >= 0) {
    return;
  } else {
    //  send  to /caido-ingest jxscout endpoint
    var respbody = reqresp.getResponseHeader() + reqresp.getResponseBody().toString(); 
    var reqheader = reqresp.getRequestHeader().toString();
    var body = {"requestUrl":reqresp.getRequestHeader().getURI().toString(),"response":respbody,"request":reqheader};  
    body = JSON.stringify(body)  
    var requestMethod = HttpRequestHeader.POST  
    var msg = new HttpMessage()  
    msg.setRequestHeader(new HttpRequestHeader(requestMethod, new URI(jxendpoint, true), HttpHeader.HTTP11))  
    msg.getRequestHeader().setHeader(HttpHeader.CONTENT_TYPE, HttpHeader.JSON_CONTENT_TYPE)  
    msg.getRequestHeader().setHeader(HttpHeader.CONTENT_LENGTH, String(body.length))  
    msg.setRequestBody(body)  
    try {
        var sender = new HttpSender(HttpSender.MANUAL_REQUEST_INITIATOR)  
        var result  = sender.sendAndReceive(msg);
        print(reqresp.getRequestHeader().getURI().toString()+" - "+msg.getResponseBody())
    } catch (err) {
        print(err);
    }
  }
}
