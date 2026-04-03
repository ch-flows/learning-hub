// 通用自动化列表脚本 - ch-flows 专用版
async function renderFileList(folderPath, elementId) {
    const user = 'ch-flows';
    const repo = 'ch-learning-hub'; // 请确认你的仓库名
    const listDiv = document.getElementById(elementId);

    try {
        const response = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${folderPath}`);
        const files = await response.json();
        
        if (!Array.isArray(files)) return;

        listDiv.innerHTML = ''; 

        files.forEach(file => {
            // 过滤：不显示 index.html，只显示 .html 文件
            if (file.name !== 'index.html' && file.name.endsWith('.html')) {
                const link = document.createElement('a');
                link.href = file.name;
                link.className = 'task-link';
                
                // 格式化美化：s2-reading-01 -> S2 READING 01
                let displayName = file.name
                    .replace('.html', '')
                    .replace(/-/g, ' ')
                    .toUpperCase();
                
                link.innerHTML = `<span>📌</span> ${displayName}`;
                listDiv.appendChild(link);
            }
        });
    } catch (error) {
        listDiv.innerHTML = '⚠️ 暂无任务或链接失效';
        console.error('Fetch error:', error);
    }
}
