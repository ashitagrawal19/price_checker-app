
let pup = require('puppeteer');
let CronJob = require('cron').CronJob;
let nodemailer = require("nodemailer");

let $ = require('cheerio').default
let url = 'https://www.amazon.in/dp/B08Z85HC96/ref=redir_mobile_desktop?_encoding=UTF8&aaxitk=812c682d3b79fd92d121398bfba9eb27&hsa_cr_id=2440823370902&pd_rd_plhdr=t&pd_rd_r=ae9be90d-cba8-4ba6-a416-481dac9ca2b8&pd_rd_w=UCpbu&pd_rd_wg=VJMqj&ref_=sbx_be_s_sparkle_mcd_asin_0_img';

// function  which opwes a browser  and return the page (url specified by us )
async function configbrowser() {
    let browser = await pup.launch();
    let page = await browser.newPage();
    await page.goto(url);
    await page.screenshot({ path: 'example.png' });

    return page;

}
// function to check price 

async function checkprice(page) {
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);
    //console.log(html); 
    $('#priceblock_ourprice', html).each(function () {
        let Price = $(this).text();

        let currentPrice = Number(Price.replace(/[^0-9.-]+/g, ""));
        
        if (currentPrice < 400) {
            
            console.log("YOU CAN BUY" + currentPrice);
            sendnotification(currentPrice);

        }


    });

}
// cron is used to check web browser again and again automaticaly 
async function tracking() {
    let page = await configbrowser();
    let job = new CronJob('*/15 * * * * *', function () {//runs every 15 sec  in this 
        checkprice(page);
    }, null, true, null, null, true);
    job.start();
}


// if price is less then our desired one the send me notification 

async function sendnotification(price) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
    secure: false,
    requireTLS: true,
        auth: {
            user: '*********@gmail.com',//your email
            pass: '********'//your password
        }
    });
    let textToSend = 'Price dropped to '+ price;
    let htmlText = `<a href=\"${url}\">Link</a>`;

    let info = await transporter.sendMail({
        from: '"Price Tracker"<*******@gmail.com>',
        to: '**********@gmail.com',
        subject: 'dont reply back',
        text: textToSend,
        html: htmlText
    });

    console.log("Message sent: %s", info.messageId);


}
tracking();

// async function monitor()
// {
//     let page = await  configbrowser();
//     await checkprice(page);
// }
// monitor();
