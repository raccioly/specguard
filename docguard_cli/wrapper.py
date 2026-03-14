#!/usr/bin/env python3
"""
DocGuard CLI — Python wrapper

Runs the Node.js DocGuard CLI via `npx` or a local installation.
This allows Python developers to use DocGuard without manually
installing npm. Node.js 18+ is required.

Usage:
    pip install docguard-cli
    docguard guard
    docguard diagnose
    docguard score
"""

import os
import shutil
import subprocess
import sys


def find_node():
    """Find a usable Node.js binary (>= 18)."""
    for cmd in ("node", "node18", "node20", "node22"):
        path = shutil.which(cmd)
        if path:
            try:
                version = subprocess.check_output(
                    [path, "--version"], text=True, stderr=subprocess.DEVNULL
                ).strip()
                major = int(version.lstrip("v").split(".")[0])
                if major >= 18:
                    return path
            except (subprocess.CalledProcessError, ValueError):
                continue
    return None


def find_npx():
    """Find npx binary."""
    return shutil.which("npx")


def find_local_cli():
    """Find locally installed DocGuard CLI (node_modules or global)."""
    # Check if installed globally via npm
    npx = find_npx()
    if npx:
        return None  # Will use npx path

    # Check node_modules in current project
    local = os.path.join(os.getcwd(), "node_modules", ".bin", "docguard")
    if os.path.isfile(local):
        return local

    return None


def main():
    """Entry point for the `docguard` command."""
    args = sys.argv[1:]

    node = find_node()
    if not node:
        print(
            "Error: Node.js 18+ is required but not found.\n"
            "Install from: https://nodejs.org/\n"
            "Or via nvm:   nvm install 20",
            file=sys.stderr,
        )
        sys.exit(1)

    npx = find_npx()
    local_cli = find_local_cli()

    if local_cli:
        # Use locally installed DocGuard
        cmd = [node, local_cli] + args
    elif npx:
        # Use npx to run DocGuard (auto-downloads if needed)
        cmd = [npx, "-y", "docguard-cli@latest"] + args
    else:
        print(
            "Error: npx not found. Install Node.js 18+ which includes npm/npx.\n"
            "Install from: https://nodejs.org/",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        result = subprocess.run(cmd, check=False)
        sys.exit(result.returncode)
    except FileNotFoundError:
        print(f"Error: Could not execute: {' '.join(cmd)}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        sys.exit(130)


if __name__ == "__main__":
    main()
