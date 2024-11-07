class GoogleSheetNotifier {
  constructor(spreadsheetId, sheetName, chatWebhookUrl, botName, botIconUrl) {
    this.spreadsheetId = spreadsheetId;
    this.sheetName = sheetName;
    this.chatWebhookUrl = chatWebhookUrl;
    this.botName = botName; // ボット名
    this.botIconUrl = botIconUrl; // アイコンURL
    this.sheet = SpreadsheetApp.openById(this.spreadsheetId).getSheetByName(this.sheetName);
  }

  // 指定した範囲のデータを取得
  getData(range) {
    return this.sheet.getRange(range).getValues();
  }

  // Googleチャットに通知
  sendToChat(message) {
    const payload = JSON.stringify({
      text: message,
      alias: this.botName,           // ボット名の指定
      iconUrl: this.botIconUrl       // アイコンのURLを指定
    });

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: payload,
    };
    UrlFetchApp.fetch(this.chatWebhookUrl, options);
  }

  // スプレッドシートのデータをフォーマットしてGoogleチャットに送信
  notify(range) {
    const data = this.getData(range);
    const message = data.map(row => row.join(' ')).join('\n'); // 行ごとに結合してメッセージにする
    this.sendToChat(message);
  }
}
