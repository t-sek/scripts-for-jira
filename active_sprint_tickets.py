import requests
import pandas as pd

# Jiraの情報
JIRA_URL = 'https://your-jira-instance.com'
JIRA_BOARD_ID = 'your_board_id'
JIRA_USERNAME = 'your_email@example.com'
JIRA_API_TOKEN = 'your_api_token'

# JIRA API URL
API_URL = f'{JIRA_URL}/rest/agile/1.0/board/{JIRA_BOARD_ID}/sprint'

# JIRAの認証
auth = (JIRA_USERNAME, JIRA_API_TOKEN)

# スプリントの情報を取得
response = requests.get(API_URL, auth=auth)
sprints = response.json().get('values', [])

# アクティブスプリントを取得
active_sprints = [sprint for sprint in sprints if sprint['state'] == 'active']

# チケットの情報を取得
tickets = []
for sprint in active_sprints:
    sprint_id = sprint['id']
    sprint_issues_url = f'{JIRA_URL}/rest/agile/1.0/sprint/{sprint_id}/issue'
    response = requests.get(sprint_issues_url, auth=auth)
    issues = response.json().get('issues', [])
    for issue in issues:
        # ラベルがtoilを含むものを除外
        labels = issue['fields'].get('labels', [])
        if 'toil' in labels:
            continue
        ticket_link = f"{JIRA_URL}/browse/{issue['key']}"
        assignee = issue['fields'].get('assignee', {}).get('displayName', 'Unassigned')
        buddy = issue['fields'].get('customfield_12345', 'No Buddy')  # 'customfield_12345' はバディフィールドのIDに置き換え
        tickets.append([ticket_link, assignee, buddy])

# データをデータフレームに変換
df = pd.DataFrame(tickets, columns=['チケットのリンク', '担当者', 'バディ'])

# 表形式で出力
output = df.to_markdown(index=False)
print(output)
