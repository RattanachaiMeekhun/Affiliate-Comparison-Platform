import re
import json


def _parse_json_response(content: str):
    content = content.strip()
    if "```" in content:
        match = re.search(r"```(?:json)?\s*(.*?)```", content, re.DOTALL)
        if match:
            content = match.group(1).strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"sow_content": "", "response": content}
