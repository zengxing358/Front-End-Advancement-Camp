import { Component, createElement } from "./framework.js"
import { Carousel } from "./carousel.js";
import { Timeline, Animation } from "./animation.js";

let d = ["https://static.runoob.com/images/demo/demo2.jpg", "https://img95.699pic.com/photo/40094/7630.jpg_wh300.jpg",
    "https://cdn.pixabay.com/photo/2017/07/10/23/45/cubes-2492010_1280.jpg", "https://cdn.pixabay.com/photo/2017/12/28/04/15/hand-3044387_1280.jpg"]
// let a = <div id="a" >
//     <span>a</span>
//     <span>b</span>
//     <span>c</span>
// </div>

// document.body.appendChild(a);
let a = <Carousel src={d} />
a.mountTo(document.body);

let tl = new Timeline();

tl.add(new Animation({ set a(v) { console.log(v) } }, "a", 0, 100, 1000, null));
tl.start();