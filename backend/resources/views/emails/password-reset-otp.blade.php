{{-- resources/views/emails/password-reset-otp.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
</head>

<body style="font-family: -apple-system, sans-serif; background: #F8F9FA; padding: 24px; margin: 0;">
    <div
        style="max-width: 400px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px 28px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div
            style="width: 56px; height: 56px; border-radius: 16px; background: #6152FF11; border: 1px solid #6152FF33; display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 20px;">
            🛡
        </div>
        <h1 style="font-size: 22px; color: #1E293B; margin: 0 0 6px;">Password Reset Code</h1>
        <p style="font-size: 14px; color: #64748B; line-height: 1.5; margin: 0 0 24px;">
            Use the code below to reset your SafariGuard password. This code expires in 10 minutes.
        </p>
        <div
            style="background: #6152FF11; border: 1px solid #6152FF33; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #6152FF;">{{ $otp }}</span>
        </div>
        <p style="font-size: 12px; color: #94A3B8; margin: 0;">
            If you didn't request this, you can safely ignore this email.
        </p>
    </div>
</body>

</html>
