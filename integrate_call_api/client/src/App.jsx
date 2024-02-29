import { useCallback, useEffect, useRef, useState } from "react";
import { StringeeCall, StringeeClient } from "stringee";
import axios from "axios";

const hotline = "842471098552";
const client = new StringeeClient();

const axiosClient = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "Application/JSON",
    },
});

axiosClient.interceptors.response.use(
    function (response) {
        return response.data;
    },
    function (err) {
        return Promise.reject(err);
    }
);

function App() {
    const [accessToken, setAccessToken] = useState("");
    const [userId, setUserId] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("84911448457");
    const [toUserId, setToUserId] = useState("");

    const remoteVideo = useRef(null);
    const localVideo = useRef(null);
    const call = useRef(null);

    const handleLogin = (e) => {
        e.preventDefault();
        window.localStorage.setItem("userId", userId);
        axiosClient
            .get(`/access_token?userId=${userId}`)
            .then((res) => {
                setAccessToken(res.data);
            })
            .catch(() => {
                alert("Login failed");
            });
    };

    const handleDisconnect = useCallback(() => {
        const userId = window.localStorage.getItem("userId");
        axiosClient.post("/disconnect", { userId }).then(console.log);
    }, []);

    const settingCallEvent = useCallback((call1) => {
        call1.on("addremotestream", function (stream) {
            // reset srcObject to work around minor bugs in Chrome and Edge.
            remoteVideo.current.srcObject = null;
            remoteVideo.current.srcObject = stream;
        });

        call1.on("addlocalstream", function (stream) {
            // reset srcObject to work around minor bugs in Chrome and Edge.
            console.log("addlocalstream");
            localVideo.current.srcObject = null;
            localVideo.current.srcObject = stream;
        });

        call1.on("signalingstate", function (state) {
            console.log("signalingstate ", state);
            const { reason } = state;
            document.querySelector("#callStatus").textContent = reason;
        });

        call1.on("mediastate", function (state) {
            console.log("mediastate ", state);
        });

        call1.on("info", function (info) {
            console.log("on info:" + JSON.stringify(info));
        });
    }, []);

    const handleCallAppToPhone = () => {
        call.current = new StringeeCall(client, hotline, phoneNumber, false);
        console.log("🚀 ~ call.current:", call.current);

        settingCallEvent(call.current);
        call.current.makeCall(function (res) {
            console.log("make call callback: " + JSON.stringify(res));
        });
    };

    const handleCallAppToApp = (videoCall = false) => {
        call.current = new StringeeCall(client, userId, toUserId, videoCall);

        settingCallEvent(call.current);
        call.current.makeCall(function (res) {
            console.log("make call callback: " + JSON.stringify(res));
        });
    };

    useEffect(() => {
        if (accessToken) {
            client.connect(accessToken);
        }
    }, [accessToken]);

    useEffect(() => {
        client.on("connect", function () {
            console.log("connected");
        });

        client.on("authen", function (res) {
            console.log("authen", res);
        });

        client.on("disconnect", function () {
            handleDisconnect();
        });

        window.onbeforeunload = function () {
            handleDisconnect();
        };

        client.on("incomingcall", function (incomingcall) {
            console.log("incomingcall", incomingcall);
            call.current = incomingcall;
            settingCallEvent(incomingcall);
            var answer = confirm(
                "Incoming call from: " +
                    incomingcall.fromNumber +
                    ", do you want to answer?"
            );
            if (answer) {
                call.current.answer(function (res) {
                    console.log("answer res", res);
                });
            } else {
                call.current.reject(function (res) {
                    console.log("reject res", res);
                });
            }
        });
    }, [handleDisconnect, settingCallEvent]);

    if (!accessToken) {
        return (
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="userId">User id:</label>
                    <input
                        id="userId"
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />
                </div>
                <div>
                    <button type="submit">Login</button>
                </div>
            </form>
        );
    }

    return (
        <div>
            <center>User id: {userId}</center>
            <div>
                <video
                    id="localVideo"
                    ref={localVideo}
                    autoPlay
                    muted
                    style={{ width: "150px" }}
                ></video>
                <video
                    id="remoteVideo"
                    ref={remoteVideo}
                    autoPlay
                    style={{ width: "150px" }}
                ></video>
                <p id="callStatus"></p>
            </div>
            <div>
                <input
                    type="text"
                    id="phone-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <button
                    id="call-btn"
                    disabled={!phoneNumber}
                    onClick={handleCallAppToPhone}
                >
                    Call app - phone
                </button>
            </div>

            <div>
                <input
                    type="text"
                    value={toUserId}
                    onChange={(e) => setToUserId(e.target.value)}
                />
                <button
                    id="call-btn"
                    disabled={!toUserId}
                    onClick={() => handleCallAppToApp()}
                >
                    Call app - app (Voice)
                </button>
                <button
                    id="call-btn"
                    disabled={!toUserId}
                    onClick={() => handleCallAppToApp(true)}
                >
                    Call app - app (Video)
                </button>
            </div>

            <div>
                <button
                    onClick={() => {
                        if (call.current) {
                            call.current.hangup();
                        }
                    }}
                >
                    Hang up
                </button>
            </div>
        </div>
    );
}

export default App;
