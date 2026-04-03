/**
 * Ch-Learning-Hub 自动列表生成器 (稳定版)
 * 功能：自动扫描 GitHub 文件夹，并抓取 HTML 内部的 <h1> 标题作为中文链接显示
 */
async function renderFileList(folderPath, elementId) {
    // --- ⚠️ 请确保这里的 user 和 repo 与你的 GitHub 地址完全一致 ---
    const user = 'ch-flows';
    const repo = 'learning-hub'; 
    const branch = 'main'; // 如果你的分支叫 master，请改为 'master'
    
    const listDiv = document.getElementById(elementId);

    try {
        // 1. 获取目录下的文件清单
        const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/${folderPath}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error('无法连接仓库 API');
        const files = await response.json();

        if (!Array.isArray(files)) return;

        // 清空现有的加载提示
        listDiv.innerHTML = '';

        // 2. 遍历所有文件
        for (const file of files) {
            // 过滤：只处理 .html 文件，且排除掉 index.html 本身
            if (file.name !== 'index.html' && file.name.endsWith('.html')) {
                
                let displayTitle = '';

                // 构建原始文件的下载链接，绕过 API 限制读取内容
                const rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${folderPath}/${file.name}`;

                try {
                    const fileResponse = await fetch(rawUrl);
                    const htmlText = await fileResponse.text();
                    
                    // 正则表达式：匹配 <h1> 标签内的文字（忽略大小写和换行）
                    const match = htmlText.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
                    
                    if (match && match[1]) {
                        displayTitle = match[1].trim(); // 成功抓取中文标题
                    } else {
                        // 没找到 <h1> 时，美化文件名作为备选显示
                        displayTitle = file.name.replace('.html', '').replace(/-/g, ' ').toUpperCase();
                    }
                } catch (e) {
                    console.warn(`读取文件内容失败: ${file.name}`, e);
                    displayTitle = file.name.replace('.html', ''); // 保底显示
                }

                // 3. 将结果渲染到页面
                const link = document.createElement('a');
                link.href = file.name;
                link.className = 'task-link';
                link.innerHTML = `<span>📌</span> ${displayTitle}`;
                listDiv.appendChild(link);
            }
        }

        // 4. 空文件夹处理
        if (listDiv.innerHTML === '') {
            listDiv.innerHTML = '<p style="color:#999; padding:20px;">☕ 老师正在准备资料，请稍后再来...</p>';
        }

    } catch (error) {
        console.error('自动化列表生成出错:', error);
        listDiv.innerHTML = '<p style="color:red; padding:20px;">⚠️ 列表同步失败，请检查仓库配置或刷新重试。</p>';
    }
}
