import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { StringeeCall, StringeeClient } from "stringee";

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
    const [accessToken, setAccessToken] = useState(
        window.localStorage.getItem("token") ?? ""
    );
    const [userId, setUserId] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [toUserId, setToUserId] = useState("");
    const [forwardTo, setForwardTo] = useState("84819287888");
    const [userInfo, setUserInfo] = useState(null);

    const remoteVideo = useRef(null);
    const localVideo = useRef(null);
    const call = useRef(null);

    const handleLogin = (e) => {
        e.preventDefault();
        window.localStorage.setItem("userId", userId);
        axiosClient
            .get(`/access_token?userId=${userId}`)
            .then((res) => {
                setTimeout(() => {
                    window.localStorage.setItem("token", res.data);
                    setUserId("");
                    setAccessToken(res.data);
                }, 3000);
            })
            .catch(() => {
                alert("Login failed");
            });
    };

    const settingCallEvent = (call1) => {
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
    };

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
            setUserInfo(res);
            console.log("authen", res);
        });

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
    }, []);

    if (!accessToken) {
        return (
            <form
                onSubmit={handleLogin}
                style={{ display: "flex", gap: "8px" }}
            >
                <label htmlFor="userId">User id:</label>
                <input
                    id="userId"
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
        );
    }

    return (
        <div>
            {!!userInfo && (
                <div>
                    <center>User id: {userInfo.userId}</center>
                    <center>
                        Username: {userInfo.displayName ?? userInfo.userId}
                    </center>
                    <center>
                        <button
                            onClick={() => {
                                window.localStorage.removeItem("token");
                                setAccessToken("");
                            }}
                        >
                            Logout
                        </button>
                    </center>
                </div>
            )}
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
            <div style={{ display: "flex", gap: "8px" }}>
                <label htmlFor="phone-input">Phone number:</label>
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

            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                <label htmlFor="user-id">User id:</label>
                <input
                    id="user-id"
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

            <div style={{ marginTop: "12px" }}>
                <button
                    onClick={() => {
                        if (call.current) {
                            call.current.hangup();
                        }
                    }}
                >
                    Hangup
                </button>
            </div>

            <div style={{ marginTop: "24px", display: "flex", gap: "8px" }}>
                <label htmlFor="">Forward to:</label>
                <input
                    type="text"
                    value={forwardTo}
                    onChange={(e) => setForwardTo(e.target.value)}
                />
                <input
                    type="checkbox"
                    disabled={!forwardTo}
                    onChange={(e) => {
                        const checked = e.target.checked;
                        axiosClient.post("/toggle_forward_number", {
                            number: checked ? forwardTo : "",
                            disabled: !checked,
                        });
                    }}
                />
            </div>
        </div>
    );
}

export default App;
