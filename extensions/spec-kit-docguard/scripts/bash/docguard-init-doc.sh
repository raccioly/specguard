#!/usr/bin/env bash
# DocGuard — Initialize a new canonical document with metadata header
# Copies template and adds DocGuard metadata scaffolding
#
# Usage:
#   ./docguard-init-doc.sh <doc-name> [--json] [--version X.X.X]
#
# Examples:
#   ./docguard-init-doc.sh architecture
#   ./docguard-init-doc.sh security --json --version 0.5.0
#
# JSON output fields:
#   DOC_PATH     — absolute path to created document
#   DOC_NAME     — canonical document name
#   TEMPLATE     — template used (if any)
#   CREATED      — whether file was created (true/false)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

JSON_MODE=false
DOC_VERSION="0.1.0"
DOC_NAME=""

while [ $# -gt 0 ]; do
    case "$1" in
        --json) JSON_MODE=true ;;
        --version)
            shift
            DOC_VERSION="${1:-0.1.0}"
            ;;
        --help|-h)
            echo "Usage: $0 <doc-name> [--json] [--version X.X.X]"
            echo ""
            echo "Document names: architecture, data-model, security, test-spec, environment, requirements"
            echo ""
            echo "Options:"
            echo "  --json          Output in JSON format"
            echo "  --version X.X.X Set initial version (default: 0.1.0)"
            echo "  --help          Show this help"
            exit 0
            ;;
        *)
            if [ -z "$DOC_NAME" ]; then
                DOC_NAME="$1"
            else
                echo "Error: Unexpected argument: $1" >&2
                exit 1
            fi
            ;;
    esac
    shift
done

if [ -z "$DOC_NAME" ]; then
    echo "Error: Document name required" >&2
    echo "Usage: $0 <doc-name> [--json] [--version X.X.X]" >&2
    exit 1
fi

# Normalize document name
DOC_NAME_UPPER=$(echo "$DOC_NAME" | tr '[:lower:]' '[:upper:]' | tr '-' '-')
DOC_FILE="docs-canonical/${DOC_NAME_UPPER}.md"

# Find project root
PROJECT_ROOT=$(find_docguard_root "$(pwd)") || {
    echo "Error: No DocGuard project found." >&2
    exit 1
}

cd "$PROJECT_ROOT"

DOC_PATH="$PROJECT_ROOT/$DOC_FILE"
CREATED=false
TEMPLATE_USED=""

# Check if file already exists
if [ -f "$DOC_PATH" ]; then
    if $JSON_MODE; then
        echo "{\"docPath\":\"$(json_escape "$DOC_PATH")\",\"docName\":\"$(json_escape "$DOC_NAME_UPPER")\",\"created\":false,\"reason\":\"File already exists\"}"
    else
        echo "⚠ $DOC_FILE already exists. Use docguard fix to update it."
    fi
    exit 0
fi

# Ensure docs-canonical directory exists
ensure_dir "$PROJECT_ROOT/docs-canonical"

# Check for template
TEMPLATE_DIR="$PROJECT_ROOT/templates"
TEMPLATE_FILE="$TEMPLATE_DIR/${DOC_NAME_UPPER}.md"

# Generate metadata header
TODAY=$(today_iso)
HEADER="# ${DOC_NAME_UPPER}

<!-- docguard:version ${DOC_VERSION} -->
<!-- docguard:status active -->
<!-- docguard:last-reviewed ${TODAY} -->
"

if [ -f "$TEMPLATE_FILE" ]; then
    # Use template, but replace/add metadata header
    cp "$TEMPLATE_FILE" "$DOC_PATH"
    TEMPLATE_USED="$TEMPLATE_FILE"
    
    # Ensure metadata header exists
    if ! grep -q "docguard:version" "$DOC_PATH"; then
        # Prepend metadata after first heading
        tmp_file=$(mktemp)
        head -1 "$DOC_PATH" > "$tmp_file"
        echo "" >> "$tmp_file"
        echo "<!-- docguard:version ${DOC_VERSION} -->" >> "$tmp_file"
        echo "<!-- docguard:status active -->" >> "$tmp_file"
        echo "<!-- docguard:last-reviewed ${TODAY} -->" >> "$tmp_file"
        tail -n +2 "$DOC_PATH" >> "$tmp_file"
        mv "$tmp_file" "$DOC_PATH"
    fi
    CREATED=true
else
    # Generate from scratch with skeleton
    cat > "$DOC_PATH" << EOF
${HEADER}
<!-- ACTION REQUIRED: This is a skeleton document. Fill each section with
     real project-specific content. Run 'docguard fix --doc ${DOC_NAME}' for
     AI-generated guidance on what to write. -->

## Overview

[Describe the purpose of this document and what it covers]

## Details

[Add project-specific content here]

## References

- [Link to related documents or resources]
EOF
    CREATED=true
fi

if $JSON_MODE; then
    echo "{\"docPath\":\"$(json_escape "$DOC_PATH")\",\"docName\":\"$(json_escape "$DOC_NAME_UPPER")\",\"template\":\"$(json_escape "$TEMPLATE_USED")\",\"created\":$CREATED,\"version\":\"$(json_escape "$DOC_VERSION")\"}"
else
    echo "✅ Created $DOC_FILE"
    [ -n "$TEMPLATE_USED" ] && echo "   Template: $TEMPLATE_USED"
    echo "   Version: $DOC_VERSION"
    echo "   Next: Run 'docguard fix --doc $DOC_NAME' for content guidance"
fi
