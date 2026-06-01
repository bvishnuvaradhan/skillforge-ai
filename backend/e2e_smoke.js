(async ()=>{
  try{
    const p = require('puppeteer');
    const browser = await p.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
    const page = await browser.newPage();
    const url = 'http://localhost:3000/';
    console.log('Visiting', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const title = await page.title();
    console.log('PAGE_TITLE:', title);
    const html = await page.content();
    console.log('PAGE_LENGTH:', html.length);
    await browser.close();
    process.exit(0);
  }catch(e){
    console.error('E2E_ERROR', e);
    process.exit(2);
  }
})();
