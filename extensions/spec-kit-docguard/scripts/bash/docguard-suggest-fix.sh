#!/usr/bin/env bash
# DocGuard — Suggest fixes based on guard/diagnose results
# Runs guard, parses results, outputs prioritized fix suggestions as JSON
#
# Usage:
#   ./docguard-suggest-fix.sh [--json] [--top N]
#
# JSON output fields:
#   GUARD_PASS    — number of passing checks
#   GUARD_TOTAL   — total checks
#   FINDINGS      — array of {validator, severity, message, fix}
#   TOP_FIX       — the single highest-impact fix suggestion

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

JSON_MODE=false
TOP_N=5

while [ $# -gt 0 ]; do
    case "$1" in
        --json) JSON_MODE=true ;;
        --top)
            shift
            TOP_N="${1:-5}"
            ;;
        --help|-h)
            echo "Usage: $0 [--json] [--top N]"
            echo ""
            echo "Options:"
            echo "  --json     Output in JSON format"
            echo "  --top N    Show top N fix suggestions (default: 5)"
            echo "  --help     Show this help"
            exit 0
            ;;
        *) echo "Unknown option: $1" >&2; exit 1 ;;
    esac
    shift
done

# Find project
PROJECT_ROOT=$(find_docguard_root "$(pwd)") || {
    echo "Error: No DocGuard project found." >&2
    exit 1
}

CLI_CMD=$(find_docguard_cli "$PROJECT_ROOT") || {
    echo "Error: DocGuard CLI not found." >&2
    exit 1
}

cd "$PROJECT_ROOT"

# Run guard and capture output
GUARD_OUTPUT=$(eval $CLI_CMD guard 2>&1 || true)

# Parse pass/total
GUARD_SUMMARY=$(echo "$GUARD_OUTPUT" | grep -o '[0-9]*/[0-9]* passed' || echo "0/0 passed")
GUARD_PASS=$(echo "$GUARD_SUMMARY" | sed 's|/.*||')
GUARD_TOTAL=$(echo "$GUARD_SUMMARY" | sed 's|.*/||; s| .*||')

# Extract warnings and failures
FINDINGS="[]"
if echo "$GUARD_OUTPUT" | grep -q "⚠\|❌"; then
    # Extract warning/failure lines with validator context
    FINDING_LINES=$(echo "$GUARD_OUTPUT" | grep -A1 "⚠\|❌" | grep "⚠ \|❌ " || true)
    
    if [ -n "$FINDING_LINES" ]; then
        FINDINGS="["
        first=true
        count=0
        while IFS= read -r line; do
            [ $count -ge $TOP_N ] && break
            if [ "$first" = true ]; then first=false; else FINDINGS="$FINDINGS,"; fi
            
            # Clean the line
            clean_line=$(echo "$line" | sed 's/^[[:space:]]*//' | sed 's/⚠ //' | sed 's/❌ //')
            
            # Determine severity
            severity="MEDIUM"
            echo "$line" | grep -q "❌" && severity="CRITICAL"
            echo "$line" | grep -qi "security\|secret" && severity="CRITICAL"
            echo "$line" | grep -qi "structure\|missing" && severity="HIGH"
            
            FINDINGS="$FINDINGS{\"message\":\"$(json_escape "$clean_line")\",\"severity\":\"$severity\"}"
            count=$((count + 1))
        done <<< "$FINDING_LINES"
        FINDINGS="$FINDINGS]"
    fi
fi

if $JSON_MODE; then
    echo "{\"guardPass\":$GUARD_PASS,\"guardTotal\":$GUARD_TOTAL,\"findings\":$FINDINGS}"
else
    echo "Guard: $GUARD_PASS/$GUARD_TOTAL passed"
    echo ""
    if [ "$GUARD_PASS" = "$GUARD_TOTAL" ]; then
        echo "✅ All checks passed! No fixes needed."
    else
        echo "Suggested fixes (top $TOP_N):"
        echo "$GUARD_OUTPUT" | grep "⚠ \|❌ " | head -$TOP_N | while IFS= read -r line; do
            echo "  → $(echo "$line" | sed 's/^[[:space:]]*//')"
        done
    fi
fi
