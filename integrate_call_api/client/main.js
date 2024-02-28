const accessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InN0cmluZ2VlLWFwaTt2PTEifQ.eyJqdGkiOiJTSy4wLkllbEdJU1lGazNvZFI1Ymdzckw1VlBKclJLY1lIQW1hLTE3MDkxMTcwODMiLCJpc3MiOiJTSy4wLkllbEdJU1lGazNvZFI1Ymdzckw1VlBKclJLY1lIQW1hIiwiZXhwIjoxNzA5MjAzNDgzLCJ1c2VySWQiOiIxMjMiLCJpYXQiOjE3MDkxMTcwODN9.lfo7W-7eSX5FhAhdfN4laHviWWCa5cGHyc9pQbV_1yc";
const hotline = "842471098552";

var call;
var client = new StringeeClient();

client.connect(accessToken);

client.on("connect", function () {
    console.log("connected");
});

client.on("authen", function (res) {
    console.log("authen", res);
});

client.on("incomingcall", function (incomingcall) {
    console.log("incomingcall", incomingcall);
    call = incomingcall;
    settingCallEvent(incomingcall);
    var answer = confirm(
        "Incoming call from: " +
            incomingcall.fromNumber +
            ", do you want to answer?"
    );
    if (answer) {
        call.answer(function (res) {
            console.log("answer res", res);
        });
    } else {
        call.reject(function (res) {
            console.log("reject res", res);
        });
    }
});

const getPhoneTo = () => {
    const phoneIputEle = document.querySelector("input#phone-input");
    const value = phoneIputEle.value;
    return value;
};

const remoteVideo = document.querySelector("video#remoteVideo");
const localVideo = document.querySelector("video#localVideo");

function settingCallEvent(call1) {
    call1.on("addremotestream", function (stream) {
        // reset srcObject to work around minor bugs in Chrome and Edge.
        remoteVideo.srcObject = null;
        remoteVideo.srcObject = stream;
    });

    call1.on("addlocalstream", function (stream) {
        // reset srcObject to work around minor bugs in Chrome and Edge.
        console.log("addlocalstream");
        localVideo.srcObject = null;
        localVideo.srcObject = stream;
    });

    call1.on("signalingstate", function (state) {
        console.log("signalingstate ", state);
        var reason = state.reason;
        document.querySelector("#callStatus").textContent = reason;
    });

    call1.on("mediastate", function (state) {
        console.log("mediastate ", state);
    });

    call1.on("info", function (info) {
        console.log("on info:" + JSON.stringify(info));
    });
}

const callBtnEle = document.querySelector("button#call-btn");
callBtnEle.onclick = () => {
    call = new StringeeCall(client, hotline, getPhoneTo(), false);
    settingCallEvent(call);
    call.makeCall(function (res) {
        console.log("make call callback: " + JSON.stringify(res));
    });
};

const callVideoBtnEle = document.querySelector("button#call-video-btn");
callVideoBtnEle.onclick = () => {
    call = new StringeeCall(client, hotline, getPhoneTo(), true);
    settingCallEvent(call);
    call.makeCall(function (res) {
        console.log("make call callback: " + JSON.stringify(res));
    });
};

//http://v2.stringee.com:8282/answer_url
//http://v2.stringee.com:8282/event_url
