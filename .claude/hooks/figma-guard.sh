#!/usr/bin/env bash
# PreToolUse guard for use_figma (local mcp__Figma__ server or a cloud Figma connector).
# Routine scripts run without a prompt (allowed in settings.json);
# this hook escalates to "ask" when a script looks destructive or
# writes to the original (non-Claude) pages of the YeetStyle file.

input=$(cat)
code=$(printf '%s' "$input" | jq -r '.tool_input.code // ""')

reasons=()

# Deleting / irreversible operations
if printf '%s' "$code" | grep -Eq '\.remove\(\)|removeMode\(|deleteVariable|\.detachInstance\(|\.flatten\(|figma\.createPage|\.ungroup\(|removeComponentProperty|deleteComponentProperty'; then
  reasons+=("удаление или необратимая операция")
fi

# Original pages of YeetStyle 2.0 (Design System 0.1, Screens Design 0.1, Prod, Animations, Archive)
if printf '%s' "$code" | grep -Eq "551:2286|1306:22698|'0:1'|\"0:1\"|354:17404|352:12171"; then
  if printf '%s' "$code" | grep -Eq '\.(set|swapComponent|appendChild|insertChild|resize|setProperties|setBoundVariable|setRangeFills|editComponentProperty|renameMode|setValueForMode)\(|\.(characters|fills|strokes|name|visible|description|cornerRadius|opacity)[[:space:]]*=[^=]'; then
    reasons+=("скрипт обращается к оригинальным страницам и что-то меняет")
  fi
fi

# Editing the original variable collection
if printf '%s' "$code" | grep -Eq "Yeet Design System'|\"Yeet Design System\"" && printf '%s' "$code" | grep -Eq 'setValueForMode|\.name[[:space:]]*=[^=]|\.remove\(|scopes[[:space:]]*='; then
  reasons+=("изменение исходной коллекции переменных")
fi

if [ ${#reasons[@]} -gt 0 ]; then
  msg=$(IFS='; '; echo "Figma: ${reasons[*]}")
  jq -n --arg r "$msg" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:$r}}'
fi
exit 0
