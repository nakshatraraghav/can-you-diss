import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { auth, db, storage } from "../../utils/firebase";

import { inputIcons } from "../../assets/Icons.js";
import CloseIcon from "@mui/icons-material/Close";

import Image from "next/image";

import ProfilePicture from "../../assets/profile_picture.svg";

import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import firebase from "firebase/compat/app";
import { ref } from "firebase/compat/storage";
import { v4 } from "uuid";

const AcceptChallenge = () => {
  const router = useRouter();
  const { id } = router.query;

  const [challengeDoc, setChallengeDoc] = useState({});
  const [text, setText] = useState("");
  const [challengedUser, setChallengedUser] = useState("");
  const [contentFile, setContentFile] = useState();
  const [audioFile, setAudioFile] = useState();
  const [contentFileToShow, setContentFileToShow] = useState();
  const [audioFileToShow, setAudioFileToShow] = useState();
  const imageIconRef = useRef(null);
  const audioFileRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const createPost = () => {
    setLoading(true);
    console.log("creating post...");

    const storageRef = firebase.storage().ref();
    const child = `audio/${audioFile.name} + ${v4()}`;
    const audioRef = storageRef.child(child);
    var uploadTask = audioRef.child(child).put(audioFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log("Upload is paused");
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        console.log(error);
        alert(error);
      },
      () => {
        let audioUrl;
        uploadTask.snapshot.ref.getDownloadURL().then(async (downloadURL) => {
          console.log("File available at", downloadURL);
          // setAudioUrl(downloadURL);
          audioUrl = downloadURL;
          console.log(audioUrl);
          const storageRef2 = firebase.storage().ref();
          const child2 = `image/${contentFile.name} + ${v4()}`;
          const imageRef = storageRef2.child(child2);
          var uploadTask = imageRef.child(child2).put(contentFile);
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              var progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log("Upload is " + progress + "% done");
              switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                  console.log("Upload is paused");
                  break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                  console.log("Upload is running");
                  break;
              }
            },
            (error) => {
              // Handle unsuccessful uploads
              console.log(error);
              alert(error);
            },
            async () => {
              let imageUrl;
              uploadTask.snapshot.ref
                .getDownloadURL()
                .then(async (downloadURL) => {
                  console.log("File available at", downloadURL);
                  // setImageUrl(downloadURL);
                  imageUrl = downloadURL;
                  console.log("image url", imageUrl);
                  const uid = auth.currentUser.uid;
                  const challengeAcceptedPostDocRef = db
                    .collection("challengedUsers")
                    .doc(id);
                  challengeAcceptedPostDocRef
                    .collection("posts")
                    .add({
                      timestamp:
                        firebase.firestore.FieldValue.serverTimestamp(),
                      description: text,
                      postImage: imageUrl,
                      audioFile: audioUrl,
                      challengeTo: challengeDoc?.createdBy,
                      createdByAuthor: challengeDoc?.name,
                      profileImage: auth.currentUser.photoURL,
                      dissedUserName: challengeDoc?.challengedBy,
                      likes: 0,
                      dislikes: 0,
                      comments: { count: 0, comments: [] },
                    })
                    .then((res) => console.log("success!"))
                    .catch((e) => console.log(e));

                  db.collection("posts")
                    .add({
                      timestamp:
                        firebase.firestore.FieldValue.serverTimestamp(),
                      description: text,
                      postImage: imageUrl,
                      audioFile: audioUrl,
                      createdBy: challengeDoc?.name,
                      createdByAuthor: challengeDoc?.name,
                      challengeTo: challengeDoc?.createdBy,
                      dissedUserName: challengeDoc?.challengedBy,
                      profileImage: auth.currentUser.photoURL,
                      likes: 0,
                      dislikes: 0,
                      comments: { count: 0, comments: [] },
                    })
                    .then(async () => {
                      setText("");
                      setChallengedUser("");
                      setAudioFile(null);
                      setContentFile(null);
                      setLoading(false);
                      let email;
                      await db
                        .collection("users")
                        .doc(challengeDoc?.createdBy)
                        .get()
                        .then((doc) => {
                          console.log(doc.data().email);
                          email = doc.data().email;
                          router.replace("/");
                        });
                      await fetch("/api/challengeAccepted", {
                        method: "POST",
                        headers: {
                          Accept: "application/json, text/plain, */*",
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          email,
                          challengeAcceptor: challengeDoc?.name,
                          message: text,
                        }),
                      })
                        .then((res) => {
                          console.log("Response received");
                          console.log(res.status);
                          if (res.status === 200) {
                            console.log("Response succeeded!");
                            console.log("successss!");
                            setText("");
                            setChallengedUser("");
                            setAudioFile(null);
                            setContentFile(null);
                            setLoading(false);
                          }
                        })
                        .then(() => {
                          router.replace("/");
                        })
                        .catch((e) => alert(e));
                    });
                });
            }
          );
        });
      }
    );
  };

  useEffect(() => {
    db.collection("challengedUsers")
      .doc(id)
      .get()
      .then((querySnapshot) => {
        setChallengeDoc(querySnapshot.data());
        console.log(querySnapshot.data());
        console.log(challengeDoc.challengedBy);
      })
      .catch((e) => alert(e));
  }, [challengeDoc?.challengedBy, id]);

  return (
    <>
      <h1>Accepting challenge from : {challengeDoc?.challengedBy}</h1>
      <div className="border-b-2 lg:border-x-2 w-full flex space-x-2 px-2 justify-between shadow-2xl pb-6 border-border-gray scrollbar-hide">
        <Image
          height={20}
          width={20}
          src={ProfilePicture}
          className="h-14 w-16 rounded-full mr-2 hover:opacity-60 transition-opacity"
          alt="User's Profile Picture"
        />
        <div className="w-full flex flex-col mt-4">
          <textarea
            className="w-full h-12 xl:h-28 bg-transparent outline-none mb-2 px-2 text-lg "
            placeholder={`Your Reply to ${challengeDoc?.challengedBy}`}
            onChange={(evt) => {
              setText(evt.target.value);
            }}
            value={text}
          />
          {contentFile ? <div>Photo:</div> : null}
          {contentFile ? (
            <div className=" relative">
              <div
                onClick={() => {
                  setContentFile(null);
                }}
                className="absolute w-8 h-8 bg-[#15181c] hover:bg-[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer"
              >
                <CloseIcon sx={{ fontSize: "28px" }} />
              </div>
              <Image
                height={20}
                width={20}
                src={contentFileToShow}
                className="rounded-2xl max-h-80 w-full object-contain"
                alt="Image not found"
              />
            </div>
          ) : null}
          {audioFile ? <div>Audio File:</div> : null}
          {audioFile ? (
            <div className="relative">
              <div
                onClick={() => {
                  setAudioFile(null);
                }}
                className="absolute left-1 top-1 w-8 h-8 bg-[#15181c] hover:bg-[#272c26] bg-opacity-75 rounded-full flex items-center justify-center cursor-pointer"
              >
                <CloseIcon sx={{ fontSize: "28px" }} />
              </div>
              <div className="py-10 mr-4 border-2 border-border-gray rounded">
                <AudioPlayer
                  src={audioFileToShow}
                  style={{ backgroundColor: "black" }}
                  onPlay={(e) => console.log("onPlay")}
                  showJumpControls={false}
                  onPlayError={(err) => {
                    alert(err + "behen ke lun audio file upload kar");
                  }}
                />
              </div>
            </div>
          ) : null}
          <div className="pl-1 flex w-full items-center justify-between">
            <div className="space-x-2 xl:space-x-4 flex">
              <div
                className="ml-2"
                onClick={() => {
                  imageIconRef.current?.click();
                }}
              >
                <inputIcons.photo className="input-icons" />
                <input
                  type="file"
                  ref={imageIconRef}
                  onChange={(evt) => {
                    const fileReader = new FileReader();
                    if (evt.target.files) {
                      fileReader.readAsDataURL(evt.target.files[0]);
                    }
                    fileReader.onload = (readerEvt) => {
                      console.log(readerEvt.target?.result);
                      setContentFileToShow(readerEvt.target?.result);
                    };
                    setContentFile(evt.target.files[0]);
                  }}
                  hidden
                />
              </div>
              <div
                className="ml-2"
                onClick={() => {
                  audioFileRef.current?.click();
                }}
              >
                <inputIcons.audio className="input-icons" />
                <input
                  type="file"
                  name="audio-upload"
                  onChange={(evt) => {
                    const fileReader = new FileReader();
                    if (evt.target.files) {
                      fileReader.readAsDataURL(evt.target.files[0]);
                    }
                    fileReader.onload = (readerEvt) => {
                      setAudioFileToShow(readerEvt.target?.result);
                      console.log(readerEvt.target?.result);
                    };
                    setAudioFile(evt.target.files[0]);
                  }}
                  ref={audioFileRef}
                  hidden
                />
              </div>
              <div>
                <inputIcons.emoji className="input-icons" />
              </div>
              <div>
                <inputIcons.poll className="input-icons" />
              </div>
            </div>
            <button
              className="button py-1 rounded-full w-1/4 max-w-[100px] mr-3 hover:border-twit-blue disabled:opacity-40 border-2 disabled:hover:border-twit-red"
              disabled={!text || !audioFile || !contentFile || loading}
              onClick={createPost}
            >
              {loading ? "Loading..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AcceptChallenge;
