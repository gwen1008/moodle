const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let browser;
let mainPage;

const cors = require('cors');
app.use(cors());


// 啟動伺服器時開啟瀏覽器和初始化主分頁
(async () => {
    try {
        browser = await puppeteer.launch({
            headless: false,
            userDataDir: './user_data',
        });
        mainPage = await browser.newPage();
        await mainPage.goto('https://moodle3.ntnu.edu.tw/login/index.php', { waitUntil: 'networkidle2' });
    } catch (error) {
        console.error("Error initializing browser:", error);
    }
});

// 登入並保持會話
async function login(username, password) {
    try {
        // 檢查 mainPage 狀態，確保在登入過程中不會意外關閉或分離
        if (!mainPage || mainPage.isClosed()) {
            mainPage = await browser.newPage();
            await mainPage.goto('https://moodle3.ntnu.edu.tw/login/index.php', { waitUntil: 'networkidle2' });
        } else {
            await mainPage.goto('https://moodle3.ntnu.edu.tw/login/index.php', { waitUntil: 'networkidle2' });
        }

        await mainPage.type('#username', username);
        await mainPage.type('#password', password);

        await Promise.all([
            mainPage.click('#loginbtn'),
            mainPage.waitForNavigation({ waitUntil: 'networkidle2' }), // 等待網頁完全加載
        ]);

        const loginError = await mainPage.$('.error');
        if (loginError) {
            throw new Error('Login failed: Incorrect username or password');
        }
        console.log('Login successful');
    } catch (error) {
        console.error("Error in login process:", error);
        throw error;
    }
}

// 處理登入請求
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        await login(username, password);
        res.json({ success: true, message: 'Login successful' });
    } catch (error) {
        console.error("Error during login:", error);
        res.json({ success: false, message: error.message });
    }
});

// 抓取課程資料
app.get('/api/courses', async (req, res) => {
    if (!mainPage) {
        return res.status(500).json({ success: false, message: 'Browser not initialized' });
    }

    try {
        const newPage = await browser.newPage();
        await newPage.goto('https://moodle3.ntnu.edu.tw/my/', { waitUntil: 'networkidle2' }); // 等待頁面完全加載

        const courses = await newPage.evaluate(() => {
            return Array.from(document.querySelectorAll('.column.c1 a')).map(course => ({
                title: course.innerText,
                url: course.href,
            }));
        });

        await newPage.close();
        res.json({ success: true, courses });
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch courses' });
    }
});

// 新增根路徑處理
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Moodle Dashboard API</h1><p>Use /api/login to log in and /api/courses to fetch courses.</p>');
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
