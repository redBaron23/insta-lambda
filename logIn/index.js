const chromium = require('chrome-aws-lambda');



const HEADLESS = true;

const BROWSER = "chromium";



const goToProfile = async (page, USERNAME) => {
  try {
    await page.goto("https://www.instagram.com/" + USERNAME);
    console.log("In profile: " + USERNAME);
    await page.waitFor(4000);
  } catch (e) {
    console.log("Could not get to main profile");
  }
}



const  getCookies = async (page, USERNAME) => {
  const usefulCookies = ["sessionid", "csrftoken", "shbid"];
  await goToProfile(page, USERNAME);
  const browserCookies = await page.cookies();
  console.log(browserCookies)
  let cookies = browserCookies.filter(i => usefulCookies.includes(i.name));
  let existCsrftoken = cookies.some(i => i.name === "csrftoken");
  let existSessionid = cookies.some(i => i.name === "sessionid");
  let existShbid = cookies.some(i => i.name === "shbid");
  //not important cookie
  if (existShbid) {
    cookies.push({
      name: "shbid",
      value: "13095",
      domain: ".instagram.com",
      path: "/",
      expires: 1593920567.071231,
      size: 10,
      httpOnly: true,
      secure: true,
      session: false
    });
  }
  console.log(cookies);
  if (existCsrftoken && existSessionid) {
    console.log("Session created");
  } else {
    throw "NEED MORE COOKIES";
  }
  return cookies;
}

const logIn = async (USERNAME, PASSWORD, CODE) => {
    const browser = await chromium.puppeteer.launch({
        executablePath: await chromium.executablePath,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        headless: true,
    });
  let page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );

  await page.goto("https://www.instagram.com");

  const INSTAGRAM_LOGO =
    "#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.oJZym > a > div > div > img";
  const USER_INPUT =
    "#loginForm > div > div:nth-child(1) > div > label > input";
  const PASS_INPUT =
    "#loginForm > div > div:nth-child(2) > div > label > input";

  const LOGIN_BTN = "#loginForm > div > div:nth-child(3) > button";

  await page.waitForSelector(USER_INPUT, { timeout: 5000 });
  await page.focus(USER_INPUT);
  await page.keyboard.type(USERNAME, { delay: 50 });

  await page.focus(PASS_INPUT);
  await page.keyboard.type(PASSWORD, { delay: 50 });
  try {
    const btn = await page.waitForSelector(LOGIN_BTN, { timeout: 5000 });
    await btn.evaluate(btn => btn.click());
    //To get cookies
    await page.waitForSelector(INSTAGRAM_LOGO, { timeout: 5000 });
    const res = await getCookies(page, USERNAME);
    console.log("Logged Successful()");
    return res;
  } catch (e) {
    let errCode;

    
    try{
      const ERROR_TEXT = "#slfErrorAlert";
      let errorText = await page.$(ERROR_TEXT);


      const message = await page.evaluate(i => i.textContent, errorText);
      if (message.includes("password")) {
        console.log("Incorrect password for " + USERNAME);
        // 401 == incorrect password
       errCode = 401;
      } else {
        // -1 unknown error
       errCode = -1;
        console.log(e);
      }
    }
    catch(e){
      //Need a code
      console.log("Need the code!")
      const UNUSUAL_ERROR_TEXT = "#react-root > section > div > div > div.GNbi9 > div > p";
      let unusualTextHtml = await page.$(UNUSUAL_ERROR_TEXT);
      const unusualText = await page.evaluate(i => i.textContent, unusualTextHtml);
      if(unusualText.includes("Suspicious")){
        //Send a code
        console.log("Sending the code!")

        const sendCodeButton = "#react-root > section > div > div > div.GA2q- > form > span > button";
        const btn_sendCode = await page.waitForSelector(sendCodeButton, { timeout: 5000 });
        await btn_sendCode.evaluate(btn => btn.click());
        
        
        const codeInput = "#security_code";
        const codeButton = "#react-root > section > div > div > div.GA2q- > form > span > button"
        await page.waitForSelector(codeInput, { timeout: 5000 });
        if(CODE){
          await page.focus(codeInput);
          await page.keyboard.type(CODE, { delay: 50 });
          const btn_code = await page.waitForSelector(codeButton, { timeout: 5000 });
          await btn_code.evaluate(btn => btn.click());
          console.log('Go to profile 2')
          //Go to profile
          await page.waitForSelector(INSTAGRAM_LOGO, { timeout: 5000 });
          const res = await getCookies(page, USERNAME);
          console.log("Logged Successful()");
          errCode = res;
        }
        else{
          //Need code
          errCode = 402        
        }

      }
    }
    finally{
      return errCode;      
    }

  } finally {
    browser.close();
  }
}



exports.handler = async (event) => {
    // TODO implement
    
    //const userName = event.userName;
    //const password = event.password;
    //const code = event.code;
    
    //Post parameters
    
    console.log("event",event)
    
    const req = JSON.parse(event.body);

    const userName = req.userName;
    const password = req.password;
    const code = (req.code) ? req.code : null;
    console.log(userName,password);

    const cookies = await logIn(userName,password,code);

    console.log("RES",cookies);
    
    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(cookies),
    };
    
    return response;
};
