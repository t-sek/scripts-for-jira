const CONFLUENCE_API_BASE_URL = 'https://your-domain.atlassian.net/wiki/rest/api/';
const AUTH_EMAIL = 'your-email@example.com';
const API_TOKEN = 'your-api-token';
const SPACE_KEY = 'YOUR_SPACE_KEY'; // Confluence スペースキーを指定

// Confluence APIへの認証ヘッダーを設定
const getAuthHeaders = () => {
  const token = Utilities.base64Encode(`${AUTH_EMAIL}:${API_TOKEN}`);
  return {
    "Authorization": `Basic ${token}`,
    "Content-Type": "application/json"
  };
};

// テンプレートページから新しいページを作成
function createPageFromTemplate() {
  const templateId = 'TEMPLATE_PAGE_ID'; // 使用するテンプレートのページIDを指定

  const payload = {
    "type": "page",
    "title": `New Page from Template - ${new Date().toLocaleString()}`,
    "space": { "key": SPACE_KEY },
    "ancestors": [{ "id": templateId }],
    "body": {
      "storage": {
        "value": "<p>ここに新しいコンテンツを追加します</p>",
        "representation": "storage"
      }
    }
  };

  const options = {
    method: "post",
    headers: getAuthHeaders(),
    payload: JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch(`${CONFLUENCE_API_BASE_URL}content`, options);
  const createdPage = JSON.parse(response.getContentText());

  Logger.log(`Page created with ID: ${createdPage.id}`);
  return createdPage.id;
}

// 作成したページに表を追加
function addTableToPage(pageId, ticketData) {
  let tableRows = '';
  ticketData.forEach(ticket => {
    tableRows += `<tr>
      <td>${ticket.key}</td>
      <td>${ticket.assignee}</td>
      <td>${ticket.point}</td>
    </tr>`;
  });

  const tableContent = `<table>
    <tr>
      <th>Key</th>
      <th>Assignee</th>
      <th>Point</th>
    </tr>
    ${tableRows}
  </table>`;

  const payload = {
    "version": { "number": 2 }, // ページバージョンは1増加させる
    "title": `Updated Page with Table - ${new Date().toLocaleString()}`,
    "type": "page",
    "body": {
      "storage": {
        "value": tableContent,
        "representation": "storage"
      }
    }
  };

  const options = {
    method: "put",
    headers: getAuthHeaders(),
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch(`${CONFLUENCE_API_BASE_URL}content/${pageId}`, options);
  Logger.log(`Table added to page ID: ${pageId}`);
}

// メイン関数
function updateConfluencePageWithTickets() {
  const ticket = [
    { key: "TKT-001", assignee: "John Doe", point: 3 },
    { key: "TKT-002", assignee: "Jane Doe", point: 5 },
    { key: "TKT-003", assignee: "Jim Beam", point: 2 }
  ];

  const pageId = createPageFromTemplate();
  addTableToPage(pageId, ticket);
}
