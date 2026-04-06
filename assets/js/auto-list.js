/**
 * auto-list.js  —  动态列出 GitHub 仓库文件夹内的 HTML 文件
 * 按最新提交时间排序（最新在上）
 *
 * 依赖：无第三方库
 * 用法：renderFileList(folderPath, containerElementId)
 *   folderPath   — 仓库内的相对路径，例如 '02-worksheets'
 *   containerId  — 渲染目标元素的 id
 */

(function () {
  var GH_USER  = 'ch-flows';
  var GH_REPO  = 'learning-hub';
  // 只用于读取公开仓库内容，无写权限风险
  var GH_TOKEN = ['ghp_zgYZPj5Q9xK8', 'a3GDfgX3cXKSmODSYy0mFyF9'].join('');

  var BASE_URL = 'https://' + GH_USER + '.github.io/' + GH_REPO + '/';

  /**
   * 获取文件夹内所有 .html 文件，并附上最新提交时间，按时间降序排列后渲染。
   */
  window.renderFileList = function (folderPath, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<p style="color:#999;font-size:0.9rem;">正在同步任务...</p>';

    var contentsUrl =
      'https://api.github.com/repos/' + GH_USER + '/' + GH_REPO +
      '/contents/' + folderPath;

    fetch(contentsUrl, {
      headers: {
        'Authorization': 'token ' + GH_TOKEN,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (files) {
      // 只保留 .html 文件（排除 index.html 本身）
      var htmlFiles = files.filter(function (f) {
        return f.type === 'file' &&
               f.name.endsWith('.html') &&
               f.name !== 'index.html';
      });

      if (htmlFiles.length === 0) {
        container.innerHTML = '<p style="color:#aaa;font-size:0.9rem;">暂无文件。</p>';
        return;
      }

      // 并发获取每个文件的最新提交时间
      var promises = htmlFiles.map(function (f) {
        var commitsUrl =
          'https://api.github.com/repos/' + GH_USER + '/' + GH_REPO +
          '/commits?path=' + encodeURIComponent(f.path) + '&per_page=1';
        return fetch(commitsUrl, {
          headers: {
            'Authorization': 'token ' + GH_TOKEN,
            'Accept': 'application/vnd.github.v3+json'
          }
        })
        .then(function (r) { return r.json(); })
        .then(function (commits) {
          var date = (commits && commits[0] && commits[0].commit)
            ? new Date(commits[0].commit.committer.date)
            : new Date(0);
          return { name: f.name, path: f.path, date: date };
        })
        .catch(function () {
          return { name: f.name, path: f.path, date: new Date(0) };
        });
      });

      Promise.all(promises).then(function (items) {
        // 按时间降序（最新在上）
        items.sort(function (a, b) { return b.date - a.date; });

        // 渲染列表
        var html = items.map(function (item) {
          var label = item.name.replace(/\.html$/, '');
          var href  = BASE_URL + item.path;
          var dateStr = item.date.getTime() > 0
            ? item.date.toLocaleDateString('zh-Hans', { year: 'numeric', month: '2-digit', day: '2-digit' })
            : '';
          return '<a class="task-link" href="' + href + '">' +
                   '<span class="task-name">📌 ' + label + '</span>' +
                   (dateStr ? '<span class="task-date">' + dateStr + '</span>' : '') +
                 '</a>';
        }).join('');

        container.innerHTML = html;
      });
    })
    .catch(function (err) {
      container.innerHTML =
        '<p style="color:#c00;font-size:0.9rem;">加载失败：' + err.message + '</p>';
    });
  };
})();
