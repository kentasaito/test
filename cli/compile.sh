#!/bin/sh
deno compile --target=x86_64-unknown-linux-gnu --output=./compiled/indentdown.x86_64-unknown-linux-gnu ./indentdown.ts
deno compile --target=aarch64-unknown-linux-gnu --output=./compiled/indentdown.aarch64-unknown-linux-gnu ./indentdown.ts
deno compile --target=x86_64-pc-windows-msvc --output=./compiled/indentdown.x86_64-pc-windows-msvc ./indentdown.ts
deno compile --target=x86_64-apple-darwin --output=./compiled/indentdown.x86_64-apple-darwin ./indentdown.ts
deno compile --target=aarch64-apple-darwin --output=./compiled/indentdown.aarch64-apple-darwin ./indentdown.ts
