import React, { useState } from 'react';
import './App.css';

function App() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginStatus, setLoginStatus] = useState(null);
    const [courses, setCourses] = useState([]);
    const [filter, setFilter] = useState('');

    // 處理登入

    const handleLogin = async (event) => {
        event.preventDefault();
        setLoginStatus('正在登入中...');
    
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
    
            const result = await response.json();
    
            if (result.success) {
                setLoginStatus('');
                setCourses(result.courses); // 將課程資料存入狀態
            } else {
                setLoginStatus('登入失敗');
                setCourses([]);
            }
        } catch (error) {
            console.error("Login error:", error);
            setLoginStatus('資料取得失敗');
        }
    };

    // 篩選課程
    const filteredCourses = courses.filter(course => {
        return filter ? course.title.startsWith(filter) : true;
    });

    return (
        <div className="App">
            {/* 新增圖片 */}
            <img src="/Moodle_logo.png" alt="Moodle Logo" style={{ width: '800px', marginBottom: '0px' }} />
            <h1>Moodle Pro Max</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>

            {loginStatus && <p>{loginStatus}</p>}

            {/* 選單篩選課程 */}
            <label htmlFor="filter">課程顯示：</label>
            <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">全部</option>
                <option value="1131"> 113-1 </option>
                <option value="1122"> 112-2 </option>
            </select>

            {filteredCourses.length > 0 && (
                <ul>
                    {filteredCourses.map((course, index) => (
                        <li key={index}>
                            <a href={course.url} target="_blank" rel="noopener noreferrer">
                                {course.title}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default App;