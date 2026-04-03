// 这里的配置请根据你的 GitHub 实际情况填写
const user = "ch-flows"; 
const repo = "learning-hub";
const branch = "main";

async function renderFileList(folderPath, elementId) {
    const listDiv = document.getElementById(elementId);
    const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/${folderPath}`;

    try {
        const response = await fetch(apiUrl);
        let files = await response.json();

        if (!Array.isArray(files)) {
            listDiv.innerHTML = "<p style='color:red;'>路径配置错误，请检查文件夹名。</p>";
            return;
        }

        // 1. 过滤掉 index.html，并按文件名排序 (确保 01, 02 这种命名起作用)
        files = files.filter(f => f.name !== 'index.html' && f.name.endsWith('.html'))
                     .sort((a, b) => a.name.localeCompare(b.name));

        listDiv.innerHTML = ""; // 清空加载状态

        for (const file of files) {
            // 构建文件的原始访问地址，用来读取 <h1> 标题
            const rawUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${folderPath}/${file.name}`;
            
            try {
                const fileResponse = await fetch(rawUrl);
                const htmlText = await fileResponse.text();
                
                // 正则表达式抓取 <h1> 里的内容
                const match = htmlText.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
                const displayTitle = (match && match[1]) ? match[1].trim() : file.name;

                // 创建链接卡片
                const link = document.createElement('a');
                link.href = file.name; // 点击跳转
                link.className = 'task-link';
                link.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>📌 ${displayTitle}</span>
                        <span style="font-size: 0.7rem; color: #ccc; opacity: 0.6;">${file.name}</span>
                    </div>
                `;
                listDiv.appendChild(link);
            } catch (e) {
                console.error("读取文件标题失败:", file.name);
            }
        }
    } catch (error) {
        listDiv.innerHTML = "<p>同步失败，请检查网络或 GitHub 配置。</p>";
    }
}
