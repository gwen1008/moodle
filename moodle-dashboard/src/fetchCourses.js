const puppeteer = require('puppeteer');

(async () => {
  const [username, password] = process.argv.slice(2); // 取得命令列參數
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://moodle3.ntnu.edu.tw/login/index.php');

    await page.type('#username', username);
    await page.type('#password', password);
    await Promise.all([
      page.click('#loginbtn'),
      page.waitForNavigation()
    ]);

    const loginError = await page.$('.error');
    if (loginError) {
      console.log(JSON.stringify({ success: false }));
    } else {
      const courses = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.column.c1 a')).map(course => ({
          title: course.innerText,
          link: course.href
        }));
      });
      console.log(JSON.stringify(courses)); // 將課程資料轉為 JSON 輸出
      res.json({ success: true, courses });

    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
})();