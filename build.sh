#!/bin/bash
APK_URL="https://expo.dev/artifacts/eas/axP3gDdj9gN9fvPhG3yPYr.apk"
APK_NAME="supa-social-app.apk"

echo "➡️ Khởi động emulator..."
emulator -avd Pixel_4_XL -no-snapshot -no-boot-anim -gpu swiftshader_indirect &

sleep 30  # đợi máy ảo mở (tuỳ máy, có thể tăng lên 60s nếu chậm)

echo "⬇️ Tải APK..."
wget "$APK_URL" -O "$APK_NAME"

echo "📱 Cài APK vào emulator..."
adb install -r "$APK_NAME"

echo "✅ Xong! Mở app trong emulator để kiểm tra."
