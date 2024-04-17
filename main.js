import WSFMP4 from "./lib/wsfmp4.js";


let media = document.querySelector("#video");

let wsfmp4 = new WSFMP4(media,{
  debug: true,
  url: "ws://127.0.0.1:6060/wsfmp4",
})


