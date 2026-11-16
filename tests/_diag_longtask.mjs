import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.emulateNetworkConditions",{offline:false,downloadThroughput:(1.6*1024*1024)/8,uploadThroughput:(750*1024)/8,latency:150});
await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
await page.addInitScript(()=>{
  window.__allLongTasks=[];
  try{const o=new PerformanceObserver(l=>{for(const e of l.getEntries()){window.__allLongTasks.push({dur:Math.round(e.duration),start:Math.round(e.startTime),name:e.name});}});o.observe({type:"longtask",buffered:true});}catch(_){}
});
await page.goto("http://localhost:4173/mockups",{waitUntil:"networkidle",timeout:90000});
await page.waitForSelector("[role=listitem]",{timeout:30000});
// wait for cards to appear, then start scroll test
await page.evaluate(()=>{window.__scrollLongTasks=[];window.__allLongTasks=[];});
await page.evaluate((h)=>window.scrollTo({top:h*2,behavior:"smooth"}),915);
await page.waitForTimeout(1500);
const tasks = await page.evaluate(()=>window.__allLongTasks);
console.log(JSON.stringify(tasks));
await browser.close();
