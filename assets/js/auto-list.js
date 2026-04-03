/**
 * Ch-Learning-Hub 自动列表生成器 (专业版)
 * 功能：自动扫描文件夹，读取 HTML 内部的 <h1> 标题并展示为中文列表
 */
async function renderFileList(folderPath, elementId) {
    const user = 'ch-flows';
    const repo = 'learning-hub'; // ⚠️ 如果你的仓库名改了，请务必修改这里
    const listDiv = document.getElementById(elementId);

    try {
        // 1. 获取 GitHub API 目录列表
        const response = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${folderPath}`);
        if (!response.ok) throw new Error('无法连接到仓库');
        
        const files = await response.json();
        if (!Array.isArray(files)) return;

        listDiv.innerHTML = ''; // 清空加载动画

        // 2. 循环处理每一个文件
        for (const file of files) {
            // 过滤：只处理 HTML，排除 index.html
            if (file.name !== 'index.html' && file.name.endsWith('.html')) {
                
                let displayTitle = '';

                try {
                    // 核心逻辑：去“读”文件的真正内容
                    const fileResponse = await fetch(file.download_url);
                    const htmlText = await fileResponse.text();
                    
                    // 使用正则表达式抓取 <h1> 标签里的文字
                    const match = htmlText.match(/<h1>(.*?)<\/h1>/);
                    
                    if (match && match[1]) {
                        displayTitle = match[1].trim(); // 抓取成功，显示中文标题
                    } else {
                        // 如果没找到 <h1>，就把文件名里的横线换成空格显示
                        displayTitle = file.name.replace('.html', '').replace(/-/g, ' ').toUpperCase();
                    }
                } catch (e) {
                    displayTitle = file.name; // 万一读取失败，保底显示文件名
                }

                // 3. 动态创建链接卡片
                const link = document.createElement('a');
                link.href = file.name;
                link.className = 'task-link';
                link.innerHTML = `<span>📌</span> ${displayTitle}`;
                listDiv.appendChild(link);
            }
        }

        // 4. 如果文件夹是空的
        if (listDiv.innerHTML === '') {
            listDiv.innerHTML = '<p style="color:#999; padding:20px;">☕ 老师正在准备资料，请稍后再来...</p>';
        }

    } catch (error) {
        console.error('自动化列表报错:', error);
        listDiv.innerHTML = '<p style="color:red; padding:20px;">⚠️ 同步失败，请检查网络或仓库名。</p>';
    }
}
