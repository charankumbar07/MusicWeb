let currentsong = new Audio();

let songs;

let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let r = await a.text();
    let div = document.createElement("div");
    div.innerHTML = r;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li>
                        <div class="songs display-flex align-items">
                            <img class="invert music" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                            </div>
                            <div class="PlayNow display-flex align-items">
                                <span>Play Now</span>
                                <img class="invert " src="img/play.svg" alt="">
                            </div>
                        </div>
                    </li>`
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            PlayMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
}

const PlayMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs`);
    let r = await a.text();
    let div = document.createElement("div");
    div.innerHTML = r;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];


            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let r = await a.json();
            console.log(r)
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
                    <div class="play transition">
                        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="12" fill="#1FDF64" />
                            <path d="M8 18V6L18 12L8 18Z" fill="black" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpeg" alt="">
                    <h2>${r.title}</h2>
                    <p>${r.description}</p>
                </div>`
        }
    }



    // Playlist loader

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(`songs/${item.currentTarget.dataset.folder}`)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);

            if (document.querySelector(".left").style.left == "-100%") {
                document.querySelector(".left").style.left = "0%";
            }
        })
    });
}

async function main() {

    await getSongs("songs/kannada");
    PlayMusic(songs[0], true);

    displayAlbums();

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg"
        } else {
            currentsong.pause();
            play.src = "img/play.svg"
        }
    }
    )

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";

        document.querySelector(".seekbar").addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentsong.currentTime = ((currentsong.duration) * percent) / 100;
        }
        )
    }
    )

    document.querySelector(".hamburgercantainer").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    }
    )
    document.querySelector(".closebtn").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    }
    )

    prev.addEventListener("click", () => {
        currentsong.pause()
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            PlayMusic(songs[index - 1]);
        }
        else {
            currentsong.play();
        }
    }
    )

    next.addEventListener("click", () => {
        currentsong.pause()
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            PlayMusic(songs[index + 1]);
        }
        else {
            currentsong.play();
        }
    }
    )
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    }
    )

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value="0"
        }
        else {
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value="10"
        }
    })

}

main();