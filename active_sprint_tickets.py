import requests
import pandas as pd

# Jiraの情報
JIRA_URL = 'https://your-jira-instance.com'
JIRA_BOARD_ID = 'your_board_id'
JIRA_USERNAME = 'your_email@example.com'
JIRA_API_TOKEN = 'your_api_token'

# JIRA API URL
API_URL = f'{JIRA_URL}/rest/agile/1.0/board/{JIRA_BOARD_ID}/sprint'

def authenticate_jira():
    """Jiraの認証情報を返す"""
    return (JIRA_USERNAME, JIRA_API_TOKEN)

def get_active_sprints():
    """アクティブなスプリントのリストを取得する"""
    auth = authenticate_jira()
    response = requests.get(API_URL, auth=auth)
    sprints = response.json().get('values', [])
    return [sprint for sprint in sprints if sprint['state'] == 'active']

def get_issues_in_sprint(sprint_id):
    """指定されたスプリント内のチケット情報を取得する"""
    auth = authenticate_jira()
    sprint_issues_url = f'{JIRA_URL}/rest/agile/1.0/sprint/{sprint_id}/issue'
    response = requests.get(sprint_issues_url, auth=auth)
    issues = response.json().get('issues', [])
    return issues

def fetch_tickets():
    """アクティブスプリントのチケット情報を取得し、整形して返す"""
    active_sprints = get_active_sprints()
    tickets = []

    for sprint in active_sprints:
        issues = get_issues_in_sprint(sprint['id'])
        filtered_issues = filter_issues(issues)
        for issue in filtered_issues:
            ticket_link = f"{JIRA_URL}/browse/{issue['key']}"
            assignee = issue['fields'].get('assignee', {}).get('displayName', 'Unassigned')
            buddy = issue['fields'].get('customfield_12345', 'No Buddy')  # 'customfield_12345' はバディフィールドのIDに置き換え
            tickets.append([ticket_link, assignee, buddy])

    return tickets

def filter_issues(issues):
    """ラベルに'toil'が含まれるチケットを除外する"""
    for issue in issues:
        labels = issue['fields'].get('labels', [])
        if 'toil' not in labels:
            yield issue

def format_output(tickets):
    """チケット情報をDataFrameに変換し、Markdown形式の表として出力する"""
    df = pd.DataFrame(tickets, columns=['チケットのリンク', '担当者', 'バディ'])
    output = df.to_markdown(index=False)
    return output

if __name__ == "__main__":
    tickets = fetch_tickets()
    output = format_output(tickets)
    print(output)
